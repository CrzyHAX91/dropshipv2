# Deployment Guide - Dropship Platform

## Prerequisites
- Docker and Docker Compose installed on your server
- Domain name (optional, but recommended)
- SSL certificate (recommended for production)

## Local Deployment

1. Clone the repository:
```bash
git clone <your-repository-url>
cd dropship-platform
```

2. Set up environment variables:
```bash
# Copy example env files
cp dropship-backend/.env.example dropship-backend/.env
cp dropship-frontend/.env.example dropship-frontend/.env

# Edit the .env files with your configuration
```

3. Build and start the containers:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost/api
- WebSocket: ws://localhost/ws

## Production Deployment

1. Server Setup:
   - Provision a server (AWS EC2, DigitalOcean Droplet, etc.)
   - Install Docker and Docker Compose
   - Configure firewall to allow ports 80 and 443

2. SSL Configuration:
   ```bash
   # Install certbot
   sudo apt-get update
   sudo apt-get install certbot
   
   # Get SSL certificate
   sudo certbot certonly --standalone -d yourdomain.com
   ```

3. Update nginx.conf:
   ```nginx
   server {
       listen 443 ssl;
       server_name yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

       # ... rest of the configuration
   }
   ```

4. Update docker-compose.yml:
   ```yaml
   frontend:
     environment:
       - REACT_APP_API_URL=https://yourdomain.com/api
       - REACT_APP_WS_URL=wss://yourdomain.com/ws
     volumes:
       - /etc/letsencrypt:/etc/letsencrypt:ro

   backend:
     environment:
       - FRONTEND_URL=https://yourdomain.com
   ```

5. Deploy:
   ```bash
   # Pull latest changes
   git pull

   # Build and start containers
   docker-compose -f docker-compose.yml up --build -d
   ```

## Monitoring and Maintenance

1. View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

2. Monitor containers:
```bash
docker-compose ps
```

3. Update application:
```bash
# Pull latest changes
git pull

# Rebuild and restart containers
docker-compose down
docker-compose up --build -d
```

4. Backup data:
```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /data/backup/

# Backup Redis
docker-compose exec redis redis-cli save
```

## Security Considerations

1. Environment Variables:
   - Use strong passwords and secrets
   - Never commit .env files to version control
   - Regularly rotate sensitive credentials

2. Firewall Rules:
   - Allow only necessary ports (80, 443)
   - Restrict SSH access to known IPs
   - Enable rate limiting

3. SSL/TLS:
   - Keep certificates up to date
   - Enable HTTP/2
   - Configure secure SSL parameters

4. Database Security:
   - Enable authentication
   - Regular security updates
   - Automated backups

## Scaling Considerations

1. Load Balancing:
   - Use multiple frontend instances
   - Configure nginx load balancing
   - Enable session persistence

2. Database Scaling:
   - MongoDB replication
   - Redis clustering
   - Regular performance monitoring

3. Container Orchestration:
   - Consider using Kubernetes for larger deployments
   - Implement auto-scaling
   - Use container health checks

## Troubleshooting

1. Container Issues:
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs -f [service_name]

# Restart specific service
docker-compose restart [service_name]
```

2. Database Issues:
```bash
# Access MongoDB shell
docker-compose exec mongodb mongo

# Access Redis CLI
docker-compose exec redis redis-cli
```

3. Network Issues:
```bash
# Check network connectivity
docker network ls
docker network inspect dropship-platform_default
```

## Support

For technical support or questions:
- Email: support@yourdomain.com
- Documentation: docs.yourdomain.com
- Issue Tracker: github.com/your-repo/issues
