const express = require('express');
const router = express.Router();
const automationService = require('../services/automationService');
const { authenticate, authorize } = require('../middleware/security');
const logger = require('../logger');

// Get automation rules
router.get('/rules', authenticate, authorize(['MANAGE_AUTOMATION']), async (req, res) => {
    try {
        const rules = {
            pricing: await automationService.rules.pricing,
            inventory: await automationService.rules.inventory,
            email: await automationService.rules.email,
            marketing: await automationService.rules.marketing
        };
        res.json(rules);
    } catch (error) {
        logger.error('Error fetching automation rules:', error);
        res.status(500).json({ error: 'Failed to fetch automation rules' });
    }
});

// Add new automation rule
router.post('/rules', authenticate, authorize(['MANAGE_AUTOMATION']), async (req, res) => {
    try {
        const rule = await automationService.addAutomationRule(req.body.type, {
            ...req.body,
            createdBy: req.user.id
        });
        res.json(rule);
    } catch (error) {
        logger.error('Error adding automation rule:', error);
        res.status(500).json({ error: 'Failed to add automation rule' });
    }
});

// Update automation rule
router.put('/rules/:id', authenticate, authorize(['MANAGE_AUTOMATION']), async (req, res) => {
    try {
        const rule = await automationService.updateAutomationRule(
            req.body.type,
            req.params.id,
            req.body
        );
        res.json(rule);
    } catch (error) {
        logger.error('Error updating automation rule:', error);
        res.status(500).json({ error: 'Failed to update automation rule' });
    }
});

// Delete automation rule
router.delete('/rules/:id', authenticate, authorize(['MANAGE_AUTOMATION']), async (req, res) => {
    try {
        await automationService.deleteAutomationRule(req.query.type, req.params.id);
        res.json({ message: 'Rule deleted successfully' });
    } catch (error) {
        logger.error('Error deleting automation rule:', error);
        res.status(500).json({ error: 'Failed to delete automation rule' });
    }
});

// Get automation status
router.get('/status', authenticate, authorize(['VIEW_AUTOMATION']), async (req, res) => {
    try {
        const status = {
            pricing: await automationService.getAutomationStatus('pricing'),
            inventory: await automationService.getAutomationStatus('inventory'),
            email: await automationService.getAutomationStatus('email'),
            marketing: await automationService.getAutomationStatus('marketing')
        };
        res.json(status);
    } catch (error) {
        logger.error('Error fetching automation status:', error);
        res.status(500).json({ error: 'Failed to fetch automation status' });
    }
});

// Toggle automation
router.post('/:type/toggle', authenticate, authorize(['MANAGE_AUTOMATION']), async (req, res) => {
    try {
        const status = await automationService.toggleAutomation(req.params.type);
        res.json({ status });
    } catch (error) {
        logger.error('Error toggling automation:', error);
        res.status(500).json({ error: 'Failed to toggle automation' });
    }
});

// Pricing automation endpoints
router.post('/pricing/optimize', authenticate, authorize(['MANAGE_AUTOMATION']), async (req, res) => {
    try {
        const result = await automationService.optimizePricing(req.body.productId, req.body.options);
        res.json(result);
    } catch (error) {
        logger.error('Error optimizing price:', error);
        res.status(500).json({ error: 'Failed to optimize price' });
    }
});

// Inventory automation endpoints
router.post('/inventory/manage', authenticate, authorize(['MANAGE_AUTOMATION']), async (req, res) => {
    try {
        const result = await automationService.manageInventory(req.body.productId);
        res.json(result);
    } catch (error) {
        logger.error('Error managing inventory:', error);
        res.status(500).json({ error: 'Failed to manage inventory' });
    }
});

// Email automation endpoints
router.post('/email/trigger', authenticate, authorize(['MANAGE_AUTOMATION']), async (req, res) => {
    try {
        const result = await automationService.automateEmails(req.body.trigger, req.body.data);
        res.json(result);
    } catch (error) {
        logger.error('Error triggering email automation:', error);
        res.status(500).json({ error: 'Failed to trigger email automation' });
    }
});

// Marketing automation endpoints
router.post('/marketing/campaign', authenticate, authorize(['MANAGE_AUTOMATION']), async (req, res) => {
    try {
        const result = await automationService.automateMarketing(req.body.campaign);
        res.json(result);
    } catch (error) {
        logger.error('Error automating marketing campaign:', error);
        res.status(500).json({ error: 'Failed to automate marketing campaign' });
    }
});

// Get automation logs
router.get('/logs', authenticate, authorize(['VIEW_AUTOMATION']), async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        const logs = await automationService.getAutomationLogs(type, {
            startDate,
            endDate
        });
        res.json(logs);
    } catch (error) {
        logger.error('Error fetching automation logs:', error);
        res.status(500).json({ error: 'Failed to fetch automation logs' });
    }
});

// Get automation metrics
router.get('/metrics', authenticate, authorize(['VIEW_AUTOMATION']), async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        const metrics = await automationService.getAutomationMetrics(type, {
            startDate,
            endDate
        });
        res.json(metrics);
    } catch (error) {
        logger.error('Error fetching automation metrics:', error);
        res.status(500).json({ error: 'Failed to fetch automation metrics' });
    }
});

// Test automation rule
router.post('/rules/test', authenticate, authorize(['MANAGE_AUTOMATION']), async (req, res) => {
    try {
        const result = await automationService.testRule(req.body.type, req.body.rule, req.body.testData);
        res.json(result);
    } catch (error) {
        logger.error('Error testing automation rule:', error);
        res.status(500).json({ error: 'Failed to test automation rule' });
    }
});

module.exports = router;
