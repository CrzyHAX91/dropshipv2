# Dropship Platform

A modern dropshipping platform built with React, Node.js, and MongoDB.

## Features

- AI-driven dropshipping automation
- Real-time analytics and reporting
- Product management and synchronization
- Order processing and fulfillment
- Inventory management
- Customer relationship management
- Payment processing
- Shipping integration
- Email marketing automation
- Social media integration

## Tech Stack

### Frontend
- React 18
- Material-UI (MUI) v5
- Vite
- Socket.IO Client
- Chart.js
- Formik & Yup
- Framer Motion

### Backend
- Node.js
- Express
- MongoDB
- Redis
- Socket.IO
- JWT Authentication
- Winston Logger

### DevOps
- Docker
- Nginx
- GitHub Actions

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dropship-platform.git
cd dropship-platform
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
```bash
cp dropship-backend/.env.example dropship-backend/.env
cp dropship-frontend/.env.example dropship-frontend/.env
```

4. Start the development environment:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:3000

## Development

- Frontend development server: `cd dropship-frontend && npm run dev`
- Backend development server: `cd dropship-backend && npm run dev`
- Run tests: `npm test`
- Build for production: `npm run build`

## Documentation

- [API Documentation](API_DOCS.md)
- [Developer Guide](DEVELOPER_GUIDE.md)
- [Admin Guide](ADMIN_GUIDE.md)
- [Deployment Guide](DEPLOYMENT.md)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
