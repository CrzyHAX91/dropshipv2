# API Documentation

This document provides detailed information about the Dropship Platform's API endpoints.

## Base URL
```
Production: https://api.your-domain.com
Development: http://localhost:3000
```

## Authentication

### JWT Authentication
All API endpoints except `/auth/login` and `/auth/register` require JWT authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

Response:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password",
  "name": "John Doe"
}
```

## Products API

### List Products
```http
GET /api/products
Query Parameters:
- page (optional, default: 1)
- limit (optional, default: 20)
- sort (optional, default: "-createdAt")
- search (optional)
- category (optional)
- minPrice (optional)
- maxPrice (optional)
```

Response:
```json
{
  "products": [
    {
      "id": "product_id",
      "name": "Product Name",
      "description": "Product Description",
      "price": 99.99,
      "images": ["url1", "url2"],
      "category": "category_name",
      "stock": 100,
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

### Get Product
```http
GET /api/products/:id
```

### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "images": ["url1", "url2"],
  "category": "category_name",
  "stock": 100
}
```

### Update Product
```http
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 89.99
}
```

### Delete Product
```http
DELETE /api/products/:id
```

## Orders API

### List Orders
```http
GET /api/orders
Query Parameters:
- page (optional, default: 1)
- limit (optional, default: 20)
- status (optional)
- startDate (optional)
- endDate (optional)
```

Response:
```json
{
  "orders": [
    {
      "id": "order_id",
      "user": {
        "id": "user_id",
        "email": "user@example.com"
      },
      "items": [
        {
          "product": "product_id",
          "quantity": 2,
          "price": 99.99
        }
      ],
      "total": 199.98,
      "status": "pending",
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "pages": 3
}
```

### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "items": [
    {
      "product": "product_id",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zip": "12345",
    "country": "Country"
  }
}
```

### Get Order
```http
GET /api/orders/:id
```

### Update Order Status
```http
PATCH /api/orders/:id/status
Content-Type: application/json

{
  "status": "shipped"
}
```

## Analytics API

### Get Dashboard Stats
```http
GET /api/analytics/dashboard
Query Parameters:
- period (optional, default: "month")
```

Response:
```json
{
  "revenue": {
    "value": 10000,
    "trend": 5
  },
  "orders": {
    "value": 200,
    "trend": -2
  },
  "customers": {
    "value": 150,
    "trend": 10
  },
  "conversion": {
    "value": 2.5,
    "trend": 0.5
  }
}
```

### Get Sales Report
```http
GET /api/analytics/sales
Query Parameters:
- startDate (required)
- endDate (required)
- groupBy (optional, default: "day")
```

## Data Management API

### Create Backup
```http
POST /api/data/backup
```

### Restore Backup
```http
POST /api/data/restore/:backupId
```

### Import Data
```http
POST /api/data/import
Content-Type: multipart/form-data

file: [file]
```

### Export Data
```http
GET /api/data/export
Query Parameters:
- format (required: "csv" | "json" | "xlsx")
```

## WebSocket Events

Connect to WebSocket:
```javascript
const socket = io('wss://api.your-domain.com', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events

#### Order Updates
```javascript
// Listen for order updates
socket.on('order:update', (data) => {
  console.log('Order updated:', data);
});

// Listen for new orders
socket.on('order:new', (data) => {
  console.log('New order:', data);
});
```

#### Inventory Updates
```javascript
// Listen for stock updates
socket.on('inventory:update', (data) => {
  console.log('Stock updated:', data);
});

// Listen for low stock alerts
socket.on('inventory:alert', (data) => {
  console.log('Low stock alert:', data);
});
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication is required
- `INVALID_CREDENTIALS`: Invalid email or password
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `PERMISSION_DENIED`: User doesn't have required permissions
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Unprocessable Entity
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1623456789
```

## Pagination

All list endpoints support pagination using the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 5,
    "limit": 20
  }
}
```

## Versioning

The API version is included in the URL:
```
https://api.your-domain.com/v1/endpoint
```

Current versions:
- v1: Current stable version
- v2: Beta version (available for testing)

For more information about deployment and administration, please refer to:
- [Deployment Guide](DEPLOYMENT.md)
- [Admin Guide](ADMIN_GUIDE.md)
