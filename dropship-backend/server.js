const express = require('express');
const http = require('http');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const helmet = require('helmet');
const logger = require('./logger');

// Routes
const aliexpressRoutes = require('./routes/aliexpress');
const dataManagementRoutes = require('./routes/dataManagement');
const authRoutes = require('./routes/auth');

// Services
const dropshippingService = require('./services/dropshippingService');
const aliexpressSync = require('./services/aliexpressSync');
const websocketService = require('./services/websocketService');
const securityService = require('./services/securityService');

// Security middleware
const {
    authenticate,
    authorize,
    rateLimiters,
    sanitizeInput,
    securityHeaders,
    handleSecurityError
} = require('./middleware/security');

const app = express();
const server = http.createServer(app);

// Basic security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(securityHeaders);
app.use(sanitizeInput);

// Apply rate limiting to all routes
app.use(rateLimiters.api);

// Initialize WebSocket service
websocketService.initialize(server);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Welcome to the Dropship API!');
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdir(uploadsDir, { recursive: true })
    .catch(err => logger.error('Error creating uploads directory:', err));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/aliexpress', authenticate, authorize(['VIEW_DASHBOARD']), aliexpressRoutes);
app.use('/api/data', authenticate, authorize(['MANAGE_DATA']), dataManagementRoutes);

// Protected order endpoints
app.post('/api/orders', authenticate, authorize(['MANAGE_ORDERS']), async (req, res) => {
    try {
        const orderDetails = await dropshippingService.processOrder(req.body);
        
        // Broadcast the new order to all connected clients
        websocketService.broadcastSaleNotification({
            orderId: orderDetails.id,
            amount: orderDetails.total,
            customer: orderDetails.customer,
            items: orderDetails.items,
            timestamp: new Date()
        });
        
        res.status(201).json(orderDetails);
    } catch (error) {
        logger.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

// Protected stats endpoint
app.get('/api/stats/profit', authenticate, authorize(['VIEW_DASHBOARD']), (req, res) => {
    try {
        const stats = dropshippingService.getProfitStats();
        res.json(stats);
    } catch (error) {
        logger.error('Error fetching profit stats:', error);
        res.status(500).json({ message: 'Error fetching profit stats', error: error.message });
    }
});

// Protected analytics endpoint
app.get('/api/analytics/realtime', authenticate, authorize(['VIEW_DASHBOARD']), (req, res) => {
    try {
        const analytics = {
            activeUsers: websocketService.getConnectedClientsCount(),
            recentOrders: dropshippingService.getRecentOrders(),
            salesVelocity: dropshippingService.getSalesVelocity(),
            topProducts: dropshippingService.getTopProducts()
        };
        res.json(analytics);
    } catch (error) {
        logger.error('Error fetching real-time analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics', error: error.message });
    }
});

// Error handling
app.use(handleSecurityError);

// Start automatic sync process (runs every hour by default)
aliexpressSync.startAutoSync();

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
    logger.info('Security measures initialized');
    logger.info('WebSocket server is initialized');
    logger.info('Automatic AliExpress sync is enabled');
});

// Handle process termination
process.on('SIGTERM', async () => {
    logger.info('Server is shutting down');
    
    // Close all active sessions
    await securityService.terminateAllSessions();
    
    // Close WebSocket connections
    websocketService.closeAll();
    
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});
