const securityService = require('../services/securityService');
const logger = require('../logger');

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const session = securityService.validateSession(token);
        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        // Attach user info to request
        req.user = {
            id: session.userId,
            role: session.role,
            sessionId: session.sessionId
        };

        // Log access
        securityService.logSecurityEvent('ACCESS', {
            userId: session.userId,
            path: req.path,
            method: req.method,
            ip: req.ip
        });

        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// Authorization middleware factory
const authorize = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const hasPermission = securityService.validatePermissions(
                req.user.role,
                requiredPermissions
            );

            if (!hasPermission) {
                securityService.logSecurityEvent('UNAUTHORIZED_ACCESS', {
                    userId: req.user.id,
                    path: req.path,
                    method: req.method,
                    requiredPermissions
                });
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            next();
        } catch (error) {
            logger.error('Authorization error:', error);
            res.status(403).json({ error: 'Authorization failed' });
        }
    };
};

// 2FA verification middleware
const require2FA = async (req, res, next) => {
    try {
        const { token } = req.body;
        const user = req.user;

        if (!token) {
            return res.status(400).json({ error: '2FA token required' });
        }

        const isValid = await securityService.verify2FA(user.id, token);
        if (!isValid) {
            securityService.logSecurityEvent('2FA_FAILED', {
                userId: user.id,
                ip: req.ip
            });
            return res.status(401).json({ error: 'Invalid 2FA token' });
        }

        next();
    } catch (error) {
        logger.error('2FA verification error:', error);
        res.status(401).json({ error: '2FA verification failed' });
    }
};

// Rate limiting middleware configurations
const rateLimiters = {
    // API rate limiter
    api: securityService.createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // 100 requests per windowMs
    }),

    // Login rate limiter
    login: securityService.createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // 5 attempts per hour
        message: 'Too many login attempts, please try again later'
    }),

    // Export rate limiter
    export: securityService.createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10 // 10 exports per hour
    })
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    try {
        // Sanitize body
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                if (typeof req.body[key] === 'string') {
                    req.body[key] = securityService.sanitizeInput(req.body[key]);
                }
            });
        }

        // Sanitize query parameters
        if (req.query) {
            Object.keys(req.query).forEach(key => {
                if (typeof req.query[key] === 'string') {
                    req.query[key] = securityService.sanitizeInput(req.query[key]);
                }
            });
        }

        next();
    } catch (error) {
        logger.error('Input sanitization error:', error);
        res.status(400).json({ error: 'Invalid input' });
    }
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Set security headers
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'",
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    next();
};

// Error handling middleware
const handleSecurityError = (err, req, res, next) => {
    logger.error('Security error:', err);
    
    securityService.logSecurityEvent('SECURITY_ERROR', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id
    });

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired' });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
    }

    res.status(500).json({ error: 'Security error occurred' });
};

module.exports = {
    authenticate,
    authorize,
    require2FA,
    rateLimiters,
    sanitizeInput,
    securityHeaders,
    handleSecurityError
};
