const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./logger');

// Routes
const aliexpressRoutes = require('./routes/aliexpress');
const dataManagementRoutes = require('./routes/dataManagement');
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:80',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Dropship API is running!');
});

// Use routes
app.use('/api/aliexpress', aliexpressRoutes);
app.use('/api/data', dataManagementRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

module.exports = app;
