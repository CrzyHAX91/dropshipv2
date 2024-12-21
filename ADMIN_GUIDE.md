# Administrator Guide

This guide provides detailed information for system administrators managing the Dropship Platform.

## Table of Contents
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Security](#security)
- [Maintenance](#maintenance)
- [Monitoring](#monitoring)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Hardware Requirements
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD
- Network: 100Mbps

### Recommended Hardware Requirements
- CPU: 8 cores
- RAM: 16GB
- Storage: 100GB SSD
- Network: 1Gbps

### Software Requirements
- Operating System: Ubuntu 20.04 LTS or later
- Node.js 18.x or later
- MongoDB 6.0 or later
- Redis 7.0 or later
- Nginx 1.18 or later
- Docker 24.0 or later
- Docker Compose 2.x or later

## Installation

### System Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install system dependencies
sudo apt install -y curl build-essential git

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
sudo apt install -y mongodb

# Install Redis
sudo apt install -y redis-server

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Install Nginx
sudo apt install -y nginx
```

### Application Installation
```bash
# Clone repository
git clone https://github.com/yourusername/dropship-platform.git
cd dropship-platform

# Install dependencies
./start-services.sh clean
npm run install-all

# Build application
cd dropship-frontend && npm run build
cd ../dropship-backend && npm run build
```

## Configuration

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Database
MONGODB_URI=mongodb://localhost:27017/dropship
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRY=24h
CORS_ORIGIN=https://your-domain.com

# External Services
ALIEXPRESS_API_KEY=your_api_key
ALIEXPRESS_API_SECRET=your_api_secret

# Email
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com
VITE_ENABLE_ANALYTICS=true
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/dropship
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;

    # Frontend
    location / {
        root /var/www/dropship/frontend;
        try_files $uri $uri/ /index.html;
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security

### SSL/TLS Configuration
```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Firewall Configuration
```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Check status
sudo ufw status verbose
```

### Database Security
```bash
# MongoDB authentication
mongosh
> use admin
> db.createUser({
    user: "admin",
    pwd: "secure_password",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

# Redis password
sudo sed -i 's/# requirepass foobared/requirepass your_secure_password/' /etc/redis/redis.conf
sudo systemctl restart redis
```

## Maintenance

### Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
npm audit fix
npm update

# Update Docker images
docker-compose pull
docker-compose up -d
```

### Log Rotation
```bash
# Install logrotate
sudo apt install -y logrotate

# Configure log rotation
sudo nano /etc/logrotate.d/dropship
/var/log/dropship/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload nginx
    endscript
}
```

## Monitoring

### System Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor system resources
htop
iotop
nethogs

# Monitor disk usage
df -h
du -sh /*
```

### Application Monitoring
```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Monitor application
pm2 monit
pm2 logs
```

### Performance Monitoring
```bash
# Check Nginx status
nginx -t
systemctl status nginx

# Check MongoDB status
mongosh --eval "db.serverStatus()"

# Check Redis status
redis-cli info
```

## Backup & Recovery

### Database Backup
```bash
# MongoDB backup
mongodump --out /backup/mongodb/$(date +%Y%m%d)

# Redis backup
redis-cli SAVE
cp /var/lib/redis/dump.rdb /backup/redis/dump.rdb.$(date +%Y%m%d)
```

### Application Backup
```bash
# Backup application files
tar -czf /backup/app/dropship-$(date +%Y%m%d).tar.gz /var/www/dropship

# Backup configuration
tar -czf /backup/config/config-$(date +%Y%m%d).tar.gz /etc/nginx/sites-available/dropship .env*
```

### Recovery Procedures
```bash
# MongoDB restore
mongorestore --drop /backup/mongodb/YYYYMMDD

# Redis restore
systemctl stop redis
cp /backup/redis/dump.rdb.YYYYMMDD /var/lib/redis/dump.rdb
systemctl start redis

# Application restore
tar -xzf /backup/app/dropship-YYYYMMDD.tar.gz -C /var/www/
```

## Troubleshooting

### Common Issues

#### Application Not Starting
1. Check logs:
```bash
pm2 logs
tail -f /var/log/nginx/error.log
```

2. Check permissions:
```bash
ls -la /var/www/dropship
sudo chown -R www-data:www-data /var/www/dropship
```

#### Database Connection Issues
1. Check MongoDB status:
```bash
systemctl status mongodb
mongosh --eval "db.runCommand({ping:1})"
```

2. Check Redis status:
```bash
systemctl status redis
redis-cli ping
```

#### Performance Issues
1. Check system resources:
```bash
top
free -h
df -h
```

2. Check network:
```bash
netstat -tulpn
ss -s
```

### Emergency Procedures

#### Service Recovery
```bash
# Restart all services
sudo systemctl restart mongodb redis nginx
pm2 restart all

# Clear cache
redis-cli FLUSHALL
pm2 flush
```

#### Data Recovery
```bash
# Restore from latest backup
./scripts/restore-backup.sh latest

# Verify data integrity
mongosh --eval "db.runCommand({dbCheck: 1})"
```

For more detailed deployment information, please refer to the [Deployment Guide](DEPLOYMENT.md).
