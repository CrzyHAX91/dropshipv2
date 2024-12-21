const nodemailer = require('nodemailer');
const Mailchimp = require('mailchimp-api-v3');
const SendGrid = require('@sendgrid/mail');
const logger = require('../logger');

class EmailMarketingService {
    constructor() {
        // Initialize email service providers
        this.providers = {
            mailchimp: {
                enabled: true,
                client: new Mailchimp(process.env.MAILCHIMP_API_KEY),
                listId: process.env.MAILCHIMP_LIST_ID
            },
            sendgrid: {
                enabled: true,
                client: SendGrid
            }
        };

        // Initialize SendGrid
        this.providers.sendgrid.client.setApiKey(process.env.SENDGRID_API_KEY);

        // Initialize Nodemailer for transactional emails
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });

        // Email templates
        this.templates = {
            welcome: {
                subject: 'Welcome to our store!',
                template: 'welcome-template'
            },
            orderConfirmation: {
                subject: 'Order Confirmation',
                template: 'order-confirmation-template'
            },
            abandonedCart: {
                subject: 'Complete your purchase',
                template: 'abandoned-cart-template'
            },
            productRecommendation: {
                subject: 'Products you might like',
                template: 'product-recommendation-template'
            }
        };
    }

    // Campaign Management
    async createCampaign(campaign) {
        try {
            // Create campaign in Mailchimp
            const mailchimpCampaign = await this.providers.mailchimp.client.post('/campaigns', {
                type: 'regular',
                recipients: {
                    list_id: this.providers.mailchimp.listId,
                    segment_opts: campaign.segmentation || {}
                },
                settings: {
                    subject_line: campaign.subject,
                    title: campaign.title,
                    from_name: campaign.fromName,
                    reply_to: campaign.replyTo
                }
            });

            // Set campaign content
            await this.providers.mailchimp.client.put(
                `/campaigns/${mailchimpCampaign.id}/content`,
                {
                    html: campaign.content
                }
            );

            // Save campaign details
            await this.saveCampaign({
                id: mailchimpCampaign.id,
                type: 'marketing',
                provider: 'mailchimp',
                details: campaign,
                status: 'draft'
            });

            return {
                campaignId: mailchimpCampaign.id,
                status: 'created'
            };
        } catch (error) {
            logger.error('Campaign creation error:', error);
            throw error;
        }
    }

    // Send campaign
    async sendCampaign(campaignId) {
        try {
            await this.providers.mailchimp.client.post(`/campaigns/${campaignId}/actions/send`);

            await this.updateCampaignStatus(campaignId, 'sent');

            return {
                success: true,
                campaignId,
                status: 'sent'
            };
        } catch (error) {
            logger.error('Campaign sending error:', error);
            throw error;
        }
    }

    // Schedule campaign
    async scheduleCampaign(campaignId, scheduledTime) {
        try {
            await this.providers.mailchimp.client.post(
                `/campaigns/${campaignId}/actions/schedule`,
                {
                    schedule_time: scheduledTime
                }
            );

            await this.updateCampaignStatus(campaignId, 'scheduled');

            return {
                success: true,
                campaignId,
                scheduledTime
            };
        } catch (error) {
            logger.error('Campaign scheduling error:', error);
            throw error;
        }
    }

    // Subscriber Management
    async addSubscriber(subscriber) {
        try {
            const result = await this.providers.mailchimp.client.post(
                `/lists/${this.providers.mailchimp.listId}/members`,
                {
                    email_address: subscriber.email,
                    status: 'subscribed',
                    merge_fields: {
                        FNAME: subscriber.firstName,
                        LNAME: subscriber.lastName
                    },
                    tags: subscriber.tags || []
                }
            );

            await this.saveSubscriber({
                email: subscriber.email,
                status: 'active',
                details: subscriber
            });

            return {
                success: true,
                subscriberId: result.id
            };
        } catch (error) {
            logger.error('Subscriber addition error:', error);
            throw error;
        }
    }

    // Send transactional email
    async sendTransactionalEmail(type, recipient, data) {
        try {
            const template = this.templates[type];
            if (!template) {
                throw new Error('Invalid email template type');
            }

            const email = {
                from: process.env.EMAIL_FROM,
                to: recipient,
                subject: template.subject,
                template_id: template.template,
                dynamic_template_data: data
            };

            const result = await this.providers.sendgrid.client.send(email);

            await this.saveEmailLog({
                type: 'transactional',
                recipient,
                template: type,
                status: 'sent'
            });

            return {
                success: true,
                messageId: result[0].headers['x-message-id']
            };
        } catch (error) {
            logger.error('Transactional email error:', error);
            throw error;
        }
    }

    // Send bulk emails
    async sendBulkEmails(recipients, template, data) {
        try {
            const emails = recipients.map(recipient => ({
                to: recipient.email,
                dynamic_template_data: {
                    ...data,
                    ...recipient.data
                }
            }));

            const result = await this.providers.sendgrid.client.sendMultiple({
                from: process.env.EMAIL_FROM,
                template_id: template,
                personalizations: emails
            });

            await this.saveBulkEmailLog({
                type: 'bulk',
                recipients: recipients.length,
                template,
                status: 'sent'
            });

            return {
                success: true,
                messageId: result[0].headers['x-message-id']
            };
        } catch (error) {
            logger.error('Bulk email error:', error);
            throw error;
        }
    }

    // Get campaign analytics
    async getCampaignAnalytics(campaignId) {
        try {
            const report = await this.providers.mailchimp.client.get(`/reports/${campaignId}`);

            return {
                opens: report.opens,
                clicks: report.clicks,
                bounces: report.bounces,
                unsubscribes: report.unsubscribes,
                deliveryRate: (report.emails_sent - report.bounces) / report.emails_sent * 100,
                clickRate: report.clicks.click_rate * 100,
                openRate: report.opens.open_rate * 100
            };
        } catch (error) {
            logger.error('Campaign analytics error:', error);
            throw error;
        }
    }

    // Create email segment
    async createSegment(criteria) {
        try {
            const segment = await this.providers.mailchimp.client.post(
                `/lists/${this.providers.mailchimp.listId}/segments`,
                {
                    name: criteria.name,
                    options: criteria.conditions
                }
            );

            await this.saveSegment({
                id: segment.id,
                name: criteria.name,
                criteria: criteria.conditions
            });

            return {
                success: true,
                segmentId: segment.id
            };
        } catch (error) {
            logger.error('Segment creation error:', error);
            throw error;
        }
    }

    // Utility methods
    async saveCampaign(campaign) {
        // Implementation for saving campaign details to database
    }

    async updateCampaignStatus(campaignId, status) {
        // Implementation for updating campaign status in database
    }

    async saveSubscriber(subscriber) {
        // Implementation for saving subscriber details to database
    }

    async saveEmailLog(log) {
        // Implementation for saving email log to database
    }

    async saveBulkEmailLog(log) {
        // Implementation for saving bulk email log to database
    }

    async saveSegment(segment) {
        // Implementation for saving segment details to database
    }
}

module.exports = new EmailMarketingService();
