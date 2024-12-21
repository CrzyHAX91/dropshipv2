const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');
const logger = require('../logger');

class PaymentService {
    constructor() {
        // Initialize PayPal
        this.paypalClient = new paypal.core.PayPalHttpClient(
            new paypal.core.SandboxEnvironment(
                process.env.PAYPAL_CLIENT_ID,
                process.env.PAYPAL_CLIENT_SECRET
            )
        );

        // Payment provider configurations
        this.providers = {
            stripe: {
                enabled: true,
                handler: this.processStripePayment.bind(this)
            },
            paypal: {
                enabled: true,
                handler: this.processPayPalPayment.bind(this)
            }
        };

        // Initialize webhook handlers
        this.webhookHandlers = {
            stripe: this.handleStripeWebhook.bind(this),
            paypal: this.handlePayPalWebhook.bind(this)
        };
    }

    // Process payment based on provider
    async processPayment(orderData, provider = 'stripe') {
        try {
            if (!this.providers[provider]?.enabled) {
                throw new Error(`Payment provider ${provider} is not enabled`);
            }

            return await this.providers[provider].handler(orderData);
        } catch (error) {
            logger.error(`Payment processing error (${provider}):`, error);
            throw error;
        }
    }

    // Stripe payment processing
    async processStripePayment(orderData) {
        try {
            // Create payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(orderData.total * 100), // Convert to cents
                currency: orderData.currency || 'usd',
                metadata: {
                    orderId: orderData.orderId,
                    customerId: orderData.customerId
                },
                payment_method_types: ['card'],
                capture_method: 'automatic',
                description: `Order ${orderData.orderId}`,
                receipt_email: orderData.customerEmail
            });

            // Save payment intent details
            await this.savePaymentDetails({
                orderId: orderData.orderId,
                provider: 'stripe',
                paymentIntentId: paymentIntent.id,
                amount: orderData.total,
                status: paymentIntent.status,
                metadata: paymentIntent.metadata
            });

            return {
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            };
        } catch (error) {
            logger.error('Stripe payment processing error:', error);
            throw new Error('Payment processing failed');
        }
    }

    // PayPal payment processing
    async processPayPalPayment(orderData) {
        try {
            const request = new paypal.orders.OrdersCreateRequest();
            request.prefer("return=representation");
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: orderData.currency || 'USD',
                        value: orderData.total.toString()
                    },
                    reference_id: orderData.orderId,
                    custom_id: orderData.customerId
                }]
            });

            const order = await this.paypalClient.execute(request);

            // Save payment details
            await this.savePaymentDetails({
                orderId: orderData.orderId,
                provider: 'paypal',
                paypalOrderId: order.result.id,
                amount: orderData.total,
                status: order.result.status,
                metadata: {
                    customerId: orderData.customerId
                }
            });

            return {
                success: true,
                orderId: order.result.id,
                approvalUrl: order.result.links.find(link => link.rel === 'approve').href
            };
        } catch (error) {
            logger.error('PayPal payment processing error:', error);
            throw new Error('Payment processing failed');
        }
    }

    // Webhook handlers
    async handleStripeWebhook(event) {
        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handleSuccessfulPayment('stripe', event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handleFailedPayment('stripe', event.data.object);
                    break;
                // Add more webhook event handlers as needed
            }
        } catch (error) {
            logger.error('Stripe webhook handling error:', error);
            throw error;
        }
    }

    async handlePayPalWebhook(event) {
        try {
            switch (event.event_type) {
                case 'PAYMENT.CAPTURE.COMPLETED':
                    await this.handleSuccessfulPayment('paypal', event.resource);
                    break;
                case 'PAYMENT.CAPTURE.DENIED':
                    await this.handleFailedPayment('paypal', event.resource);
                    break;
                // Add more webhook event handlers as needed
            }
        } catch (error) {
            logger.error('PayPal webhook handling error:', error);
            throw error;
        }
    }

    // Payment success handler
    async handleSuccessfulPayment(provider, paymentData) {
        try {
            // Update payment status
            await this.updatePaymentStatus(paymentData.id, 'completed');

            // Get order details
            const orderId = this.extractOrderId(provider, paymentData);
            const order = await this.getOrderDetails(orderId);

            // Trigger order processing
            await this.triggerOrderProcessing(order);

            // Send confirmation email
            await this.sendPaymentConfirmation(order);

            logger.info(`Payment successful for order ${orderId}`);
        } catch (error) {
            logger.error('Error handling successful payment:', error);
            throw error;
        }
    }

    // Payment failure handler
    async handleFailedPayment(provider, paymentData) {
        try {
            // Update payment status
            await this.updatePaymentStatus(paymentData.id, 'failed');

            // Get order details
            const orderId = this.extractOrderId(provider, paymentData);
            const order = await this.getOrderDetails(orderId);

            // Send failure notification
            await this.sendPaymentFailureNotification(order);

            logger.warn(`Payment failed for order ${orderId}`);
        } catch (error) {
            logger.error('Error handling failed payment:', error);
            throw error;
        }
    }

    // Refund processing
    async processRefund(paymentId, amount, reason) {
        try {
            const paymentDetails = await this.getPaymentDetails(paymentId);
            
            if (paymentDetails.provider === 'stripe') {
                return await this.processStripeRefund(paymentDetails, amount, reason);
            } else if (paymentDetails.provider === 'paypal') {
                return await this.processPayPalRefund(paymentDetails, amount, reason);
            }

            throw new Error('Unsupported payment provider');
        } catch (error) {
            logger.error('Refund processing error:', error);
            throw error;
        }
    }

    // Stripe refund processing
    async processStripeRefund(paymentDetails, amount, reason) {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: paymentDetails.paymentIntentId,
                amount: Math.round(amount * 100),
                reason: reason
            });

            await this.saveRefundDetails({
                paymentId: paymentDetails.id,
                refundId: refund.id,
                amount: amount,
                reason: reason,
                status: refund.status
            });

            return {
                success: true,
                refundId: refund.id,
                status: refund.status
            };
        } catch (error) {
            logger.error('Stripe refund processing error:', error);
            throw error;
        }
    }

    // PayPal refund processing
    async processPayPalRefund(paymentDetails, amount, reason) {
        try {
            const request = new paypal.payments.CapturesRefundRequest(paymentDetails.paypalOrderId);
            request.requestBody({
                amount: {
                    currency_code: 'USD',
                    value: amount.toString()
                },
                note_to_payer: reason
            });

            const refund = await this.paypalClient.execute(request);

            await this.saveRefundDetails({
                paymentId: paymentDetails.id,
                refundId: refund.result.id,
                amount: amount,
                reason: reason,
                status: refund.result.status
            });

            return {
                success: true,
                refundId: refund.result.id,
                status: refund.result.status
            };
        } catch (error) {
            logger.error('PayPal refund processing error:', error);
            throw error;
        }
    }

    // Utility methods
    async savePaymentDetails(details) {
        // Implementation for saving payment details to database
    }

    async updatePaymentStatus(paymentId, status) {
        // Implementation for updating payment status in database
    }

    async getPaymentDetails(paymentId) {
        // Implementation for retrieving payment details from database
    }

    async saveRefundDetails(details) {
        // Implementation for saving refund details to database
    }

    async getOrderDetails(orderId) {
        // Implementation for retrieving order details from database
    }

    async triggerOrderProcessing(order) {
        // Implementation for triggering order processing
    }

    async sendPaymentConfirmation(order) {
        // Implementation for sending payment confirmation email
    }

    async sendPaymentFailureNotification(order) {
        // Implementation for sending payment failure notification
    }

    extractOrderId(provider, paymentData) {
        if (provider === 'stripe') {
            return paymentData.metadata.orderId;
        } else if (provider === 'paypal') {
            return paymentData.custom_id;
        }
        throw new Error('Unknown payment provider');
    }
}

module.exports = new PaymentService();
