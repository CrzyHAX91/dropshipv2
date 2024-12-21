# API Documentation - Dropship Platform

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response:
{
  "token": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "username": "string",
    "role": "string"
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}

Response:
{
  "token": "string"
}
```

## Products

### Get Products
```http
GET /api/products
Authorization: Bearer {token}
Query Parameters:
- page (number)
- limit (number)
- sort (string)
- category (string)
- search (string)

Response:
{
  "products": [
    {
      "id": "string",
      "name": "string",
      "price": number,
      "description": "string",
      "stock": number,
      "category": "string",
      "images": ["string"]
    }
  ],
  "total": number,
  "page": number,
  "pages": number
}
```

### Get Top Products
```http
GET /api/products/top
Authorization: Bearer {token}
Query Parameters:
- limit (number)
- period (string: "day", "week", "month")

Response:
{
  "products": [
    {
      "id": "string",
      "name": "string",
      "price": number,
      "sales": number,
      "rating": number
    }
  ]
}
```

### Create Product
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "string",
  "price": number,
  "description": "string",
  "category": "string",
  "stock": number,
  "images": ["string"]
}

Response:
{
  "id": "string",
  "name": "string",
  "price": number,
  "description": "string",
  "category": "string",
  "stock": number,
  "images": ["string"]
}
```

## Orders

### Get Orders
```http
GET /api/orders
Authorization: Bearer {token}
Query Parameters:
- page (number)
- limit (number)
- status (string)
- startDate (string)
- endDate (string)

Response:
{
  "orders": [
    {
      "id": "string",
      "customer": {
        "id": "string",
        "name": "string",
        "email": "string"
      },
      "products": [
        {
          "id": "string",
          "quantity": number,
          "price": number
        }
      ],
      "total": number,
      "status": "string",
      "createdAt": "string"
    }
  ],
  "total": number,
  "page": number,
  "pages": number
}
```

### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer": {
    "name": "string",
    "email": "string",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zip": "string",
      "country": "string"
    }
  },
  "products": [
    {
      "id": "string",
      "quantity": number
    }
  ]
}

Response:
{
  "id": "string",
  "status": "string",
  "total": number,
  "trackingNumber": "string"
}
```

## Analytics

### Get Sales Analytics
```http
GET /api/analytics/sales
Authorization: Bearer {token}
Query Parameters:
- startDate (string)
- endDate (string)
- groupBy (string: "day", "week", "month")

Response:
{
  "data": [
    {
      "date": "string",
      "sales": number,
      "orders": number,
      "revenue": number
    }
  ],
  "summary": {
    "totalSales": number,
    "totalOrders": number,
    "totalRevenue": number,
    "growth": number
  }
}
```

### Get Customer Analytics
```http
GET /api/analytics/customers
Authorization: Bearer {token}
Query Parameters:
- period (string: "day", "week", "month", "year")

Response:
{
  "newCustomers": number,
  "activeCustomers": number,
  "customerRetention": number,
  "segments": [
    {
      "name": "string",
      "count": number,
      "revenue": number
    }
  ]
}
```

## Automation

### Get Automation Rules
```http
GET /api/automation/rules
Authorization: Bearer {token}
Query Parameters:
- type (string: "pricing", "inventory", "marketing")

Response:
{
  "rules": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "conditions": [],
      "actions": [],
      "status": "string"
    }
  ]
}
```

### Create Automation Rule
```http
POST /api/automation/rules
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "string",
  "type": "string",
  "conditions": [
    {
      "field": "string",
      "operator": "string",
      "value": "any"
    }
  ],
  "actions": [
    {
      "type": "string",
      "parameters": {}
    }
  ]
}

Response:
{
  "id": "string",
  "status": "active"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters",
  "details": {
    "field": "error message"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "requestId": "string"
}
```

## Rate Limiting

- Rate limit: 100 requests per minute per IP
- Rate limit headers:
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset

## Webhooks

### Order Status Updates
```http
POST {webhook_url}
Content-Type: application/json

{
  "event": "order.status_updated",
  "data": {
    "orderId": "string",
    "status": "string",
    "timestamp": "string"
  }
}
```

### Inventory Updates
```http
POST {webhook_url}
Content-Type: application/json

{
  "event": "inventory.updated",
  "data": {
    "productId": "string",
    "stock": number,
    "timestamp": "string"
  }
}
```

## Best Practices

1. Authentication
- Always use HTTPS
- Include token in Authorization header
- Refresh tokens before expiry

2. Rate Limiting
- Implement exponential backoff
- Cache responses when possible
- Monitor rate limit headers

3. Error Handling
- Check error responses
- Implement retry logic
- Log failed requests

4. Performance
- Use pagination
- Request only needed fields
- Batch operations when possible

## Support

- API Status: status.dropship-platform.com
- Documentation: docs.dropship-platform.com
- Support Email: api-support@dropship-platform.com
