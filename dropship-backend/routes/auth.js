const express = require('express');
const router = express.Router();
const securityService = require('../services/securityService');
const { rateLimiters, require2FA } = require('../middleware/security');
const logger = require('../logger');

// Login endpoint
router.post('/login', rateLimiters.login, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate credentials
        const user = await securityService.verifyCredentials(username, password);
        if (!user) {
            await securityService.handleLoginAttempt(username, false);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if 2FA is required
        if (user.requires2FA) {
            return res.json({
                requiresSecondFactor: true,
                tempToken: securityService.generateSecureToken()
            });
        }

        // Create session and return token
        const token = securityService.createSession(user.id, user.role);
        await securityService.handleLoginAttempt(username, true);

        securityService.logSecurityEvent('LOGIN_SUCCESS', {
            userId: user.id,
            ip: req.ip
        });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// 2FA verification endpoint
router.post('/verify-2fa', async (req, res) => {
    try {
        const { tempToken, code } = req.body;

        const verification = await securityService.verify2FA(tempToken, code);
        if (!verification.success) {
            return res.status(401).json({ error: 'Invalid 2FA code' });
        }

        const token = securityService.createSession(
            verification.userId,
            verification.userRole
        );

        res.json({
            token,
            user: {
                id: verification.userId,
                username: verification.username,
                role: verification.userRole
            }
        });
    } catch (error) {
        logger.error('2FA verification error:', error);
        res.status(500).json({ error: '2FA verification failed' });
    }
});

// Setup 2FA endpoint
router.post('/setup-2fa', async (req, res) => {
    try {
        const { userId } = req.body;
        const setup = await securityService.setup2FA(userId);

        res.json({
            secret: setup.secret,
            qrCode: setup.qrCode
        });
    } catch (error) {
        logger.error('2FA setup error:', error);
        res.status(500).json({ error: '2FA setup failed' });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            await securityService.terminateSession(token);
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// Password reset request
router.post('/reset-password-request', rateLimiters.login, async (req, res) => {
    try {
        const { email } = req.body;
        const resetToken = await securityService.createPasswordResetToken(email);

        // Send reset email (implementation would be in a separate email service)
        
        res.json({ message: 'Password reset instructions sent' });
    } catch (error) {
        logger.error('Password reset request error:', error);
        res.status(500).json({ error: 'Password reset request failed' });
    }
});

// Password reset
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const result = await securityService.resetPassword(token, newPassword);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        logger.error('Password reset error:', error);
        res.status(500).json({ error: 'Password reset failed' });
    }
});

// Get security audit logs
router.get('/audit-logs', async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        const logs = await securityService.getAuditLogs(startDate, endDate, type);
        res.json(logs);
    } catch (error) {
        logger.error('Audit logs retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve audit logs' });
    }
});

// Get active sessions
router.get('/active-sessions', async (req, res) => {
    try {
        const { userId } = req.query;
        const sessions = await securityService.getActiveSessions(userId);
        res.json(sessions);
    } catch (error) {
        logger.error('Active sessions retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve active sessions' });
    }
});

// Terminate specific session
router.post('/terminate-session', async (req, res) => {
    try {
        const { sessionId } = req.body;
        await securityService.terminateSession(sessionId);
        res.json({ message: 'Session terminated successfully' });
    } catch (error) {
        logger.error('Session termination error:', error);
        res.status(500).json({ error: 'Failed to terminate session' });
    }
});

module.exports = router;
