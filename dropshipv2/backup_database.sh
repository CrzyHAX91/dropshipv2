#!/bin/bash

# Set variables
BACKUP_DIR="/path/to/backup/directory"
TIMESTAMP=20241120_122731
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

# Perform database backup
python manage.py dumpdata > $BACKUP_FILE

# Compress the backup file
gzip $BACKUP_FILE

echo "Database backup completed: ${BACKUP_FILE}.gz"

# Optional: Upload to a secure off-site location (e.g., AWS S3)
# aws s3 cp ${BACKUP_FILE}.gz s3://your-bucket-name/backups/

# Remove backups older than 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete
