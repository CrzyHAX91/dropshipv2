# Deployment Guide

This guide explains how to deploy the Dropship Platform in various environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
  - [Docker Deployment](#docker-deployment)
  - [Manual Deployment](#manual-deployment)
  - [Cloud Deployment](#cloud-deployment)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18 or later
- MongoDB 6.0 or later
- Redis 7.0 or later
- Docker and Docker Compose (for containerized deployment)
- Nginx (for production deployment)
- SSL certificate (for HTTPS)

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dropship-platform.git
cd dropship-platform
```

2. Set up environment variables:
```bash
# Backend
cp dropship-backend/.env.example dropship-backend/.env

# Frontend
cp dropship-frontend/.env.example dropship-frontend/.env
```

3. Configure environment variables according to your deployment environment.

## Deployment Options

### Docker Deployment

1. Build and start containers:
```bash
./start-services.sh docker
```

2. Verify deployment:
```bash
docker-compose ps
```

3. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:3000

### Manual Deployment

1. Install dependencies:
```bash
./start-services.sh clean  # Clean any existing builds
npm run install-all       # Install all dependencies
```

2. Build the frontend:
```bash
cd dropship-frontend
npm run build
```

3. Configure Nginx:
```nginx
# /etc/nginx/sites-available/dropship
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/dropship-frontend/build;
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
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

4. Start the services:
```bash
# Start MongoDB
mongod --quiet --logpath /dev/null &

# Start Redis
redis-server --daemonize yes

# Start Backend
cd dropship-backend
NODE_ENV=production npm start

# Start Frontend (if not using Nginx)
cd dropship-frontend
npm start
```

### Cloud Deployment

#### AWS Deployment

1. Set up AWS resources:
- EC2 instances for frontend and backend
- MongoDB Atlas or DocumentDB for database
- ElastiCache for Redis
- Route 53 for DNS
- ACM for SSL certificates
- ALB for load balancing

2. Configure CI/CD:
- Update `.github/workflows/deploy.yml` with AWS credentials
- Configure AWS CodeDeploy
- Set up monitoring with CloudWatch

#### Digital Ocean Deployment

1. Create Droplets:
- Application Droplet (2GB RAM minimum)
- MongoDB Droplet (2GB RAM minimum)
- Redis Droplet (1GB RAM minimum)

2. Configure Firewall:
```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 27017/tcp  # MongoDB
ufw allow 6379/tcp   # Redis
```

## Configuration

### Security Configuration

1. SSL Setup:
```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d your-domain.com
```

2. Firewall Configuration:
```bash
# Allow only necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### Performance Optimization

1. Enable Nginx caching:
```nginx
# /etc/nginx/nginx.conf
http {
    proxy_cache_path /path/to/cache levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m use_temp_path=off;
}
```

2. Configure PM2 for Node.js:
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

## Monitoring

1. Set up monitoring:
```bash
# Install monitoring tools
npm install -g pm2
pm2 install pm2-logrotate
pm2 install pm2-server-monit
```

2. Configure logging:
```bash
# Backend logging
winston.configure({
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

## Troubleshooting

### Common Issues

1. Connection Issues:
```bash
# Check service status
systemctl status mongodb
systemctl status redis
pm2 status

# Check logs
tail -f /var/log/nginx/error.log
pm2 logs
```

2. Performance Issues:
```bash
# Monitor system resources
htop
iostat
netstat -tulpn
```

3. Database Issues:
```bash
# MongoDB
mongosh
> db.adminCommand({ ping: 1 })
> db.serverStatus()

# Redis
redis-cli
> PING
> INFO
```

### Backup and Recovery

1. Database Backup:
```bash
# MongoDB
mongodump --out /backup/$(date +%Y%m%d)

# Redis
redis-cli SAVE
```

2. Application Backup:
```bash
# Backup uploads and configurations
tar -czf backup.tar.gz uploads/ .env config/
```

For more detailed information about specific deployment scenarios or troubleshooting, please refer to the [Admin Guide](ADMIN_GUIDE.md).
