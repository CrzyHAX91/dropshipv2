const WebSocket = require('ws');
const logger = require('../logger');

class WebSocketService {
    constructor() {
        this.clients = new Map(); // Map to store client connections
        this.server = null;
    }

    initialize(httpServer) {
        this.server = new WebSocket.Server({ server: httpServer });

        this.server.on('connection', (ws, req) => {
            const clientId = req.headers['sec-websocket-key'];
            logger.info(`New WebSocket connection established: ${clientId}`);
            
            // Store client connection
            this.clients.set(clientId, {
                ws,
                subscriptions: new Set() // Track what updates the client is subscribed to
            });

            // Handle client messages
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleClientMessage(clientId, data);
                } catch (error) {
                    logger.error('Error handling WebSocket message:', error);
                }
            });

            // Handle client disconnection
            ws.on('close', () => {
                logger.info(`Client disconnected: ${clientId}`);
                this.clients.delete(clientId);
            });

            // Send initial connection success message
            this.sendToClient(clientId, {
                type: 'connection',
                status: 'connected',
                timestamp: new Date().toISOString()
            });
        });

        logger.info('WebSocket server initialized');
    }

    handleClientMessage(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client) return;

        switch (message.type) {
            case 'subscribe':
                // Handle subscription requests
                if (message.topics && Array.isArray(message.topics)) {
                    message.topics.forEach(topic => {
                        client.subscriptions.add(topic);
                    });
                    this.sendToClient(clientId, {
                        type: 'subscription',
                        status: 'success',
                        topics: Array.from(client.subscriptions)
                    });
                }
                break;

            case 'unsubscribe':
                // Handle unsubscription requests
                if (message.topics && Array.isArray(message.topics)) {
                    message.topics.forEach(topic => {
                        client.subscriptions.delete(topic);
                    });
                    this.sendToClient(clientId, {
                        type: 'subscription',
                        status: 'success',
                        topics: Array.from(client.subscriptions)
                    });
                }
                break;

            default:
                logger.warn(`Unknown message type received: ${message.type}`);
        }
    }

    // Send message to a specific client
    sendToClient(clientId, data) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(data));
        }
    }

    // Broadcast message to all subscribed clients
    broadcast(topic, data) {
        this.clients.forEach((client, clientId) => {
            if (client.subscriptions.has(topic) && client.ws.readyState === WebSocket.OPEN) {
                this.sendToClient(clientId, {
                    type: 'update',
                    topic,
                    data,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    // Broadcast sales notification
    broadcastSaleNotification(saleData) {
        this.broadcast('sales', {
            type: 'sale',
            ...saleData
        });
    }

    // Broadcast inventory alert
    broadcastInventoryAlert(inventoryData) {
        this.broadcast('inventory', {
            type: 'inventory_alert',
            ...inventoryData
        });
    }

    // Broadcast analytics update
    broadcastAnalyticsUpdate(analyticsData) {
        this.broadcast('analytics', {
            type: 'analytics_update',
            ...analyticsData
        });
    }

    // Get connected clients count
    getConnectedClientsCount() {
        return this.clients.size;
    }

    // Close all connections
    closeAll() {
        this.clients.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.close();
            }
        });
        this.clients.clear();
    }
}

module.exports = new WebSocketService();
