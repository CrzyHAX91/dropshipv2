const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const rateLimit = require('express-rate-limit');
const logger = require('../logger');

class SecurityService {
    constructor() {
        this.roles = {
            ADMIN: 'admin',
            MANAGER: 'manager',
            STAFF: 'staff'
        };

        this.permissions = {
            VIEW_DASHBOARD: 'view_dashboard',
            MANAGE_PRODUCTS: 'manage_products',
            MANAGE_ORDERS: 'manage_orders',
            MANAGE_USERS: 'manage_users',
            MANAGE_SETTINGS: 'manage_settings',
            MANAGE_DATA: 'manage_data'
        };

        this.rolePermissions = {
            [this.roles.ADMIN]: Object.values(this.permissions),
            [this.roles.MANAGER]: [
                this.permissions.VIEW_DASHBOARD,
                this.permissions.MANAGE_PRODUCTS,
                this.permissions.MANAGE_ORDERS
            ],
            [this.roles.STAFF]: [
                this.permissions.VIEW_DASHBOARD,
                this.permissions.MANAGE_ORDERS
            ]
        };

        // Store active sessions and rate limiting data
        this.activeSessions = new Map();
        this.failedLoginAttempts = new Map();
    }

    // Two-Factor Authentication
    async setup2FA(userId) {
        const secret = speakeasy.generateSecret({
            name: 'Dropship Admin'
        });

        // Generate QR code
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);

        // Store secret temporarily until verified
        await this.storeTemporary2FASecret(userId, secret.base32);

        return {
            secret: secret.base32,
            qrCode
        };
    }

    verify2FA(userId, token, secret) {
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 1 // Allow 30 seconds clock skew
        });
    }

    // Role-based Access Control
    hasPermission(userRole, requiredPermission) {
        const permissions = this.rolePermissions[userRole] || [];
        return permissions.includes(requiredPermission);
    }

    validatePermissions(userRole, requiredPermissions) {
        if (!Array.isArray(requiredPermissions)) {
            requiredPermissions = [requiredPermissions];
        }
        return requiredPermissions.every(permission => this.hasPermission(userRole, permission));
    }

    // Rate Limiting
    createRateLimiter(options = {}) {
        return rateLimit({
            windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
            max: options.max || 100, // Limit each IP to 100 requests per windowMs
            message: options.message || 'Too many requests, please try again later.',
            handler: (req, res) => {
                this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
                    ip: req.ip,
                    path: req.path
                });
                res.status(429).json({
                    error: 'Too many requests',
                    retryAfter: Math.ceil(options.windowMs / 1000)
                });
            }
        });
    }

    // Session Management
    createSession(userId, userRole) {
        const sessionId = crypto.randomBytes(32).toString('hex');
        const token = jwt.sign(
            { userId, role: userRole, sessionId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        this.activeSessions.set(sessionId, {
            userId,
            role: userRole,
            createdAt: new Date(),
            lastActivity: new Date()
        });

        return token;
    }

    validateSession(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const session = this.activeSessions.get(decoded.sessionId);

            if (!session) {
                return false;
            }

            // Update last activity
            session.lastActivity = new Date();
            this.activeSessions.set(decoded.sessionId, session);

            return decoded;
        } catch (error) {
            return false;
        }
    }

    terminateSession(sessionId) {
        this.activeSessions.delete(sessionId);
    }

    // Security Audit Logging
    logSecurityEvent(eventType, details) {
        const event = {
            type: eventType,
            timestamp: new Date(),
            details
        };

        logger.info('Security Event:', event);

        // Store security event in database
        return this.storeSecurityEvent(event);
    }

    async storeSecurityEvent(event) {
        // Implementation for storing security events in the database
        // This would typically use a database service to store the event
    }

    // Password Security
    async hashPassword(password) {
        return new Promise((resolve, reject) => {
            const salt = crypto.randomBytes(16).toString('hex');
            crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
                if (err) reject(err);
                resolve({
                    hash: derivedKey.toString('hex'),
                    salt
                });
            });
        });
    }

    async verifyPassword(password, hash, salt) {
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
                if (err) reject(err);
                resolve(derivedKey.toString('hex') === hash);
            });
        });
    }

    // Login Security
    async handleLoginAttempt(userId, success) {
        const attempts = this.failedLoginAttempts.get(userId) || 0;

        if (success) {
            this.failedLoginAttempts.delete(userId);
            return true;
        }

        this.failedLoginAttempts.set(userId, attempts + 1);

        if (attempts + 1 >= 5) {
            await this.lockAccount(userId);
            return false;
        }

        return true;
    }

    async lockAccount(userId) {
        // Implementation for locking user account
        // This would typically update a user's status in the database
        this.logSecurityEvent('ACCOUNT_LOCKED', { userId });
    }

    // Security Utilities
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    sanitizeInput(input) {
        // Implementation for input sanitization
        // This would typically use a library like validator.js
        return input;
    }
}

module.exports = new SecurityService();
