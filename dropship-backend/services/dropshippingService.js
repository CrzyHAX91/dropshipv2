const logger = require('../logger');

// Profit margin configuration
const config = {
    defaultMarkup: 50, // 50% markup by default
    minProfitMargin: 5, // Minimum $5 profit
    shippingMarkup: 20, // 20% markup on shipping
    autoReorderThreshold: 10, // Reorder when stock drops below this
    maxOrderRetries: 3, // Maximum number of retries for failed orders
    syncInterval: 3600000, // Sync inventory every hour
};

class DropshippingService {
    constructor() {
        this.orderQueue = [];
        this.profitStats = {
            daily: {},
            monthly: {},
            total: 0
        };
        this.startAutomation();
    }

    calculateProfitablePrice(originalPrice, shippingCost = 0) {
        const baseMarkup = originalPrice * (config.defaultMarkup / 100);
        const shippingMarkup = shippingCost * (config.shippingMarkup / 100);
        
        const totalCost = originalPrice + shippingCost;
        const calculatedPrice = totalCost + baseMarkup + shippingMarkup;
        const minPrice = totalCost + config.minProfitMargin;
        
        return Math.max(calculatedPrice, minPrice).toFixed(2);
    }

    async processOrder(orderData) {
        try {
            // Simulate automatic order placement with supplier
            const orderDetails = {
                orderId: `ORD-${Date.now()}`,
                status: 'processing',
                trackingNumber: `TRK-${Math.random().toString(36).substr(2, 9)}`,
                estimatedDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                supplierOrderId: `SUP-${Math.random().toString(36).substr(2, 9)}`,
                items: orderData.items,
                profit: this.calculateOrderProfit(orderData.items)
            };

            // Update profit statistics
            this.updateProfitStats(orderDetails.profit);

            // Automatically check stock levels and reorder if necessary
            await this.checkAndReorderStock(orderData.items);

            logger.info(`Order processed automatically: ${orderDetails.orderId}`);
            return orderDetails;
        } catch (error) {
            logger.error('Error processing order:', error);
            this.orderQueue.push(orderData); // Queue failed orders for retry
            throw error;
        }
    }

    calculateOrderProfit(items) {
        return items.reduce((total, item) => {
            const itemProfit = (item.price - item.originalPrice - item.shippingCost) * item.quantity;
            return total + itemProfit;
        }, 0).toFixed(2);
    }

    updateProfitStats(profit) {
        const today = new Date().toISOString().split('T')[0];
        const month = today.substring(0, 7);

        // Update daily stats
        this.profitStats.daily[today] = (this.profitStats.daily[today] || 0) + parseFloat(profit);

        // Update monthly stats
        this.profitStats.monthly[month] = (this.profitStats.monthly[month] || 0) + parseFloat(profit);

        // Update total profit
        this.profitStats.total += parseFloat(profit);
    }

    async checkAndReorderStock(items) {
        for (const item of items) {
            if (item.stock <= config.autoReorderThreshold) {
                await this.autoReorder(item);
            }
        }
    }

    async autoReorder(item) {
        try {
            logger.info(`Auto-reordering stock for item: ${item.id}`);
            // Simulate automatic reorder with supplier
            const reorderQuantity = Math.max(50, config.autoReorderThreshold * 2);
            const reorderDetails = {
                itemId: item.id,
                quantity: reorderQuantity,
                orderId: `REORDER-${Date.now()}`,
                status: 'processing'
            };
            logger.info(`Reorder placed successfully: ${reorderDetails.orderId}`);
        } catch (error) {
            logger.error(`Error auto-reordering stock for item ${item.id}:`, error);
        }
    }

    async syncInventory() {
        try {
            logger.info('Starting automated inventory sync');
            const syncResult = {
                timestamp: new Date(),
                updatedProducts: Math.floor(Math.random() * 100),
                newProducts: Math.floor(Math.random() * 20),
                removedProducts: Math.floor(Math.random() * 5),
                stockUpdates: Math.floor(Math.random() * 50)
            };
            logger.info(`Inventory sync completed: ${syncResult.updatedProducts} products updated`);
            return syncResult;
        } catch (error) {
            logger.error('Error syncing inventory:', error);
            throw error;
        }
    }

    startAutomation() {
        // Start periodic inventory sync
        setInterval(() => this.syncInventory(), config.syncInterval);

        // Start order queue processing
        setInterval(() => this.processOrderQueue(), 300000); // Process queue every 5 minutes
    }

    async processOrderQueue() {
        if (this.orderQueue.length > 0) {
            const orderData = this.orderQueue.shift();
            try {
                await this.processOrder(orderData);
            } catch (error) {
                logger.error('Error processing queued order:', error);
                if (orderData.retries < config.maxOrderRetries) {
                    orderData.retries = (orderData.retries || 0) + 1;
                    this.orderQueue.push(orderData);
                }
            }
        }
    }

    getProfitStats() {
        return {
            daily: this.profitStats.daily,
            monthly: this.profitStats.monthly,
            total: this.profitStats.total,
            averageOrderProfit: this.profitStats.total / Object.keys(this.profitStats.daily).length
        };
    }
}

module.exports = new DropshippingService();
