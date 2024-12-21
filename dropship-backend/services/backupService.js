const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');

class BackupService {
    constructor() {
        this.backupConfig = {
            baseDir: path.join(__dirname, '../backups'),
            aiModels: path.join(__dirname, '../models'),
            services: path.join(__dirname, '../services'),
            maxBackups: 10,
            compressionLevel: 9
        };

        this.backupTypes = {
            FULL: 'full',
            INCREMENTAL: 'incremental',
            AI_MODELS: 'ai_models',
            SERVICES: 'services',
            CONFIGURATIONS: 'configurations'
        };

        // Initialize backup directory
        this.initializeBackupDirectory();
    }

    async initializeBackupDirectory() {
        try {
            await fs.mkdir(this.backupConfig.baseDir, { recursive: true });
            logger.info('Backup directory initialized');
        } catch (error) {
            logger.error('Error initializing backup directory:', error);
            throw error;
        }
    }

    // Create full backup
    async createFullBackup() {
        const backupId = uuidv4();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupConfig.baseDir, `full_backup_${timestamp}`);

        try {
            // Create backup directory
            await fs.mkdir(backupPath, { recursive: true });

            // Backup different components
            await Promise.all([
                this.backupAIModels(backupPath),
                this.backupServices(backupPath),
                this.backupConfigurations(backupPath)
            ]);

            // Create archive
            const archivePath = `${backupPath}.zip`;
            await this.createArchive(backupPath, archivePath);

            // Create backup manifest
            const manifest = await this.createBackupManifest(backupId, 'full', archivePath);

            // Clean up old backups
            await this.cleanupOldBackups();

            logger.info(`Full backup created: ${backupId}`);
            return manifest;
        } catch (error) {
            logger.error('Error creating full backup:', error);
            throw error;
        }
    }

    // Create incremental backup
    async createIncrementalBackup(lastBackupId) {
        const backupId = uuidv4();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupConfig.baseDir, `incremental_backup_${timestamp}`);

        try {
            // Create backup directory
            await fs.mkdir(backupPath, { recursive: true });

            // Get changes since last backup
            const changes = await this.getChangesSinceLastBackup(lastBackupId);

            // Backup changed files
            await this.backupChangedFiles(changes, backupPath);

            // Create archive
            const archivePath = `${backupPath}.zip`;
            await this.createArchive(backupPath, archivePath);

            // Create backup manifest
            const manifest = await this.createBackupManifest(backupId, 'incremental', archivePath, {
                lastBackupId,
                changes
            });

            logger.info(`Incremental backup created: ${backupId}`);
            return manifest;
        } catch (error) {
            logger.error('Error creating incremental backup:', error);
            throw error;
        }
    }

    // Backup AI models
    async backupAIModels(backupPath) {
        try {
            const modelsPath = path.join(backupPath, 'models');
            await fs.mkdir(modelsPath, { recursive: true });

            // Copy model files
            await this.copyDirectory(this.backupConfig.aiModels, modelsPath);

            // Save model metadata
            const metadata = await this.getModelsMetadata();
            await fs.writeFile(
                path.join(modelsPath, 'models_metadata.json'),
                JSON.stringify(metadata, null, 2)
            );

            logger.info('AI models backed up successfully');
        } catch (error) {
            logger.error('Error backing up AI models:', error);
            throw error;
        }
    }

    // Backup services
    async backupServices(backupPath) {
        try {
            const servicesPath = path.join(backupPath, 'services');
            await fs.mkdir(servicesPath, { recursive: true });

            // Copy service files
            await this.copyDirectory(this.backupConfig.services, servicesPath);

            // Save services metadata
            const metadata = await this.getServicesMetadata();
            await fs.writeFile(
                path.join(servicesPath, 'services_metadata.json'),
                JSON.stringify(metadata, null, 2)
            );

            logger.info('Services backed up successfully');
        } catch (error) {
            logger.error('Error backing up services:', error);
            throw error;
        }
    }

    // Backup configurations
    async backupConfigurations(backupPath) {
        try {
            const configPath = path.join(backupPath, 'configurations');
            await fs.mkdir(configPath, { recursive: true });

            // Save environment variables
            const envConfig = this.getEnvironmentConfig();
            await fs.writeFile(
                path.join(configPath, 'environment.json'),
                JSON.stringify(envConfig, null, 2)
            );

            // Save service configurations
            const serviceConfig = await this.getServiceConfigurations();
            await fs.writeFile(
                path.join(configPath, 'services.json'),
                JSON.stringify(serviceConfig, null, 2)
            );

            logger.info('Configurations backed up successfully');
        } catch (error) {
            logger.error('Error backing up configurations:', error);
            throw error;
        }
    }

    // Restore backup
    async restoreBackup(backupId) {
        try {
            const manifest = await this.getBackupManifest(backupId);
            const backupPath = manifest.archivePath;

            // Extract archive
            const extractPath = path.join(this.backupConfig.baseDir, 'temp_restore');
            await this.extractArchive(backupPath, extractPath);

            // Restore components
            await Promise.all([
                this.restoreAIModels(extractPath),
                this.restoreServices(extractPath),
                this.restoreConfigurations(extractPath)
            ]);

            // Clean up
            await fs.rmdir(extractPath, { recursive: true });

            logger.info(`Backup restored: ${backupId}`);
            return { success: true, backupId };
        } catch (error) {
            logger.error('Error restoring backup:', error);
            throw error;
        }
    }

    // Utility methods
    async createArchive(sourcePath, targetPath) {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(targetPath);
            const archive = archiver('zip', {
                zlib: { level: this.backupConfig.compressionLevel }
            });

            output.on('close', () => resolve());
            archive.on('error', reject);

            archive.pipe(output);
            archive.directory(sourcePath, false);
            archive.finalize();
        });
    }

    async extractArchive(archivePath, targetPath) {
        // Implementation for extracting archive
    }

    async copyDirectory(source, target) {
        const entries = await fs.readdir(source, { withFileTypes: true });

        await fs.mkdir(target, { recursive: true });

        for (const entry of entries) {
            const sourcePath = path.join(source, entry.name);
            const targetPath = path.join(target, entry.name);

            if (entry.isDirectory()) {
                await this.copyDirectory(sourcePath, targetPath);
            } else {
                await fs.copyFile(sourcePath, targetPath);
            }
        }
    }

    async getChangesSinceLastBackup(lastBackupId) {
        // Implementation for getting changes since last backup
        return [];
    }

    async createBackupManifest(backupId, type, archivePath, metadata = {}) {
        const manifest = {
            id: backupId,
            type,
            timestamp: new Date().toISOString(),
            archivePath,
            metadata
        };

        await fs.writeFile(
            path.join(this.backupConfig.baseDir, `${backupId}_manifest.json`),
            JSON.stringify(manifest, null, 2)
        );

        return manifest;
    }

    async getBackupManifest(backupId) {
        const manifestPath = path.join(this.backupConfig.baseDir, `${backupId}_manifest.json`);
        const content = await fs.readFile(manifestPath, 'utf8');
        return JSON.parse(content);
    }

    async cleanupOldBackups() {
        try {
            const backups = await this.listBackups();
            if (backups.length > this.backupConfig.maxBackups) {
                const toDelete = backups
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(this.backupConfig.maxBackups);

                await Promise.all(
                    toDelete.map(backup => this.deleteBackup(backup.id))
                );
            }
        } catch (error) {
            logger.error('Error cleaning up old backups:', error);
        }
    }

    async listBackups() {
        try {
            const files = await fs.readdir(this.backupConfig.baseDir);
            const manifests = await Promise.all(
                files
                    .filter(file => file.endsWith('_manifest.json'))
                    .map(async file => {
                        const content = await fs.readFile(
                            path.join(this.backupConfig.baseDir, file),
                            'utf8'
                        );
                        return JSON.parse(content);
                    })
            );

            return manifests;
        } catch (error) {
            logger.error('Error listing backups:', error);
            throw error;
        }
    }

    async deleteBackup(backupId) {
        try {
            const manifest = await this.getBackupManifest(backupId);
            await fs.unlink(manifest.archivePath);
            await fs.unlink(path.join(this.backupConfig.baseDir, `${backupId}_manifest.json`));
            logger.info(`Backup deleted: ${backupId}`);
        } catch (error) {
            logger.error(`Error deleting backup ${backupId}:`, error);
            throw error;
        }
    }

    getEnvironmentConfig() {
        // Implementation for getting environment configuration
        return {};
    }

    async getServiceConfigurations() {
        // Implementation for getting service configurations
        return {};
    }

    async getModelsMetadata() {
        // Implementation for getting models metadata
        return {};
    }

    async getServicesMetadata() {
        // Implementation for getting services metadata
        return {};
    }
}

module.exports = new BackupService();
