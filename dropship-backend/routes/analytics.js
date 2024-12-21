const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { authenticate, authorize } = require('../middleware/security');
const logger = require('../logger');

// Get report data
router.post('/report', authenticate, authorize(['VIEW_DASHBOARD']), async (req, res) => {
    try {
        const { type, timeFrame, startDate, endDate } = req.body;
        const report = await analyticsService.generateReport(type, timeFrame, {
            startDate,
            endDate,
            userId: req.user.id
        });

        res.json(report);
    } catch (error) {
        logger.error('Report generation error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Export report
router.post('/export', authenticate, authorize(['VIEW_DASHBOARD']), async (req, res) => {
    try {
        const { type, format, data } = req.body;
        const exportedData = await analyticsService.exportReport(data, format);

        // Set appropriate headers based on format
        switch (format) {
            case 'csv':
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=report.csv`);
                break;
            case 'excel':
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename=report.xlsx`);
                break;
            case 'pdf':
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=report.pdf`);
                break;
            default:
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=report.json`);
        }

        res.send(exportedData);
    } catch (error) {
        logger.error('Report export error:', error);
        res.status(500).json({ error: 'Failed to export report' });
    }
});

// Create custom dashboard
router.post('/dashboards', authenticate, authorize(['MANAGE_DASHBOARDS']), async (req, res) => {
    try {
        const dashboard = await analyticsService.buildDashboard({
            ...req.body,
            userId: req.user.id
        });

        res.json(dashboard);
    } catch (error) {
        logger.error('Dashboard creation error:', error);
        res.status(500).json({ error: 'Failed to create dashboard' });
    }
});

// Get dashboard by ID
router.get('/dashboards/:id', authenticate, authorize(['VIEW_DASHBOARD']), async (req, res) => {
    try {
        const dashboard = await analyticsService.getDashboard(req.params.id);
        if (!dashboard) {
            return res.status(404).json({ error: 'Dashboard not found' });
        }

        res.json(dashboard);
    } catch (error) {
        logger.error('Dashboard retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve dashboard' });
    }
});

// Update dashboard
router.put('/dashboards/:id', authenticate, authorize(['MANAGE_DASHBOARDS']), async (req, res) => {
    try {
        const dashboard = await analyticsService.updateDashboard(req.params.id, req.body);
        res.json(dashboard);
    } catch (error) {
        logger.error('Dashboard update error:', error);
        res.status(500).json({ error: 'Failed to update dashboard' });
    }
});

// Delete dashboard
router.delete('/dashboards/:id', authenticate, authorize(['MANAGE_DASHBOARDS']), async (req, res) => {
    try {
        await analyticsService.deleteDashboard(req.params.id);
        res.json({ message: 'Dashboard deleted successfully' });
    } catch (error) {
        logger.error('Dashboard deletion error:', error);
        res.status(500).json({ error: 'Failed to delete dashboard' });
    }
});

// Get dashboard widgets
router.get('/widgets', authenticate, authorize(['VIEW_DASHBOARD']), async (req, res) => {
    try {
        const widgets = await analyticsService.getAvailableWidgets();
        res.json(widgets);
    } catch (error) {
        logger.error('Widget retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve widgets' });
    }
});

// Create dashboard widget
router.post('/widgets', authenticate, authorize(['MANAGE_DASHBOARDS']), async (req, res) => {
    try {
        const widget = await analyticsService.createDashboardWidget(req.body);
        res.json(widget);
    } catch (error) {
        logger.error('Widget creation error:', error);
        res.status(500).json({ error: 'Failed to create widget' });
    }
});

// Update widget
router.put('/widgets/:id', authenticate, authorize(['MANAGE_DASHBOARDS']), async (req, res) => {
    try {
        const widget = await analyticsService.updateWidget(req.params.id, req.body);
        res.json(widget);
    } catch (error) {
        logger.error('Widget update error:', error);
        res.status(500).json({ error: 'Failed to update widget' });
    }
});

// Delete widget
router.delete('/widgets/:id', authenticate, authorize(['MANAGE_DASHBOARDS']), async (req, res) => {
    try {
        await analyticsService.deleteWidget(req.params.id);
        res.json({ message: 'Widget deleted successfully' });
    } catch (error) {
        logger.error('Widget deletion error:', error);
        res.status(500).json({ error: 'Failed to delete widget' });
    }
});

// Get analytics data for specific metric
router.get('/metrics/:metric', authenticate, authorize(['VIEW_DASHBOARD']), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await analyticsService.getMetricData(req.params.metric, {
            startDate,
            endDate,
            userId: req.user.id
        });

        res.json(data);
    } catch (error) {
        logger.error('Metric data retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve metric data' });
    }
});

// Get real-time analytics
router.get('/realtime', authenticate, authorize(['VIEW_DASHBOARD']), async (req, res) => {
    try {
        const data = await analyticsService.getRealTimeData(req.user.id);
        res.json(data);
    } catch (error) {
        logger.error('Real-time data retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve real-time data' });
    }
});

// Schedule report
router.post('/schedule', authenticate, authorize(['MANAGE_REPORTS']), async (req, res) => {
    try {
        const schedule = await analyticsService.scheduleReport(req.body);
        res.json(schedule);
    } catch (error) {
        logger.error('Report scheduling error:', error);
        res.status(500).json({ error: 'Failed to schedule report' });
    }
});

module.exports = router;
