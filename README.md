# Dropship V2

Dropship V2 is an e-commerce application built with Django.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/CrzyHAX91/dropshipv2.git
   cd dropshipv2
   ```

2. Run the start script:
   ```
   ./start.sh
   ```

3. Access the application at http://localhost:8000

## Features

- Product catalog
- Shopping cart
- User authentication
- Order management

## Admin Access

To access the admin panel:

1. Go to http://localhost:8000/admin
2. Login with the following credentials:
   - Username: admin
   - Password: adminpassword

## Running Tests

To run the tests, use the following command:
```
docker-compose exec web python dropship_project/manage.py test
```

## Stopping the Application

To stop the application, run:
```
docker-compose down
```

