const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const logger = require('../logger');
const dataManagementService = require('../services/dataManagementService');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.csv', '.json'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only CSV and JSON files are allowed.'));
        }
    }
});

// Export data
router.post('/export', async (req, res) => {
    try {
        const { type, format } = req.body;
        const result = await dataManagementService.exportData(type, format);

        // Stream the file to the client
        res.download(result.filePath, result.fileName, (err) => {
            if (err) {
                logger.error('Error sending file:', err);
            }
            // Clean up the temporary file
            fs.unlink(result.filePath).catch(err => {
                logger.error('Error deleting temporary file:', err);
            });
        });
    } catch (error) {
        logger.error('Export error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Import data
router.post('/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = await dataManagementService.bulkImport(
            req.file.path,
            req.body.type,
            {
                mode: req.body.mode || 'merge'
            }
        );

        // Clean up the uploaded file
        fs.unlink(req.file.path).catch(err => {
            logger.error('Error deleting uploaded file:', err);
        });

        res.json(result);
    } catch (error) {
        logger.error('Import error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create backup
router.post('/backup', async (req, res) => {
    try {
        const result = await dataManagementService.createBackup();
        res.json(result);
    } catch (error) {
        logger.error('Backup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Restore backup
router.post('/backup/restore', async (req, res) => {
    try {
        const { backupId } = req.body;
        const result = await dataManagementService.restoreBackup(backupId);
        res.json(result);
    } catch (error) {
        logger.error('Restore error:', error);
        res.status(500).json({ error: error.message });
    }
});

// List backups
router.get('/backups', async (req, res) => {
    try {
        const backups = await fs.readdir(dataManagementService.backupDir);
        const backupDetails = await Promise.all(
            backups.map(async backup => {
                const manifestPath = path.join(dataManagementService.backupDir, backup, 'manifest.json');
                try {
                    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
                    return {
                        id: backup,
                        ...manifest
                    };
                } catch (error) {
                    return null;
                }
            })
        );

        res.json(backupDetails.filter(backup => backup !== null));
    } catch (error) {
        logger.error('Error listing backups:', error);
        res.status(500).json({ error: error.message });
    }
});

// Data cleanup
router.post('/cleanup', async (req, res) => {
    try {
        const result = await dataManagementService.cleanupData(req.body);
        res.json(result);
    } catch (error) {
        logger.error('Cleanup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get cleanup status
router.get('/cleanup/status', async (req, res) => {
    try {
        const stats = await dataManagementService.getCleanupStats();
        res.json(stats);
    } catch (error) {
        logger.error('Error getting cleanup status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Validate data
router.post('/validate', async (req, res) => {
    try {
        const { data, type } = req.body;
        const validationResult = await dataManagementService.validateData(data, type);
        res.json(validationResult);
    } catch (error) {
        logger.error('Validation error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
