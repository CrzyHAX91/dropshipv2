# Dropship V2

Dropship V2 is an automated dropshipping application that integrates with AliExpress.

## Features

- Automatic product syncing with AliExpress
- User registration and authentication
- Shopping cart functionality
- Automated order processing
- Admin dashboard for managing orders and sales

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/dropshipv2.git
   cd dropshipv2
   ```

2. Create a .env file in the project root and add the following:
   ```
   DJANGO_SECRET_KEY=your_django_secret_key_here
   DEBUG=False
   ALLOWED_HOSTS=localhost,127.0.0.1
   ALIEXPRESS_APP_KEY=your_aliexpress_app_key_here
   ALIEXPRESS_APP_SECRET=your_aliexpress_app_secret_here
   ```
   Replace the placeholder values with your actual secret key and AliExpress API credentials.

## Running the Application

1. Run the start script:
   ```
   ./start.sh
   ```

2. Access the application at http://localhost:8000

## Admin Access

The start script automatically creates a superuser if one doesn't exist.

- Username: admin
- Email: admin@example.com
- Password: adminpassword

To access the admin dashboard:
1. Log in at http://localhost:8000/admin/
2. Navigate to http://localhost:8000/admin-dashboard/

## Automated Tasks

- Product syncing with AliExpress occurs daily at midnight.
- Orders are automatically processed upon checkout.

## Security

- Only admin users can access the admin dashboard and manage orders/sales.
- Regular users can only view products, add to cart, and place orders.
- Sensitive information is stored in environment variables.

## Customization

To customize the application, you can modify the following files:
- settings.py: For Django settings and configuration
- views.py: For application logic
- models.py: For database schema
- templates/*.html: For HTML templates
- static/css/custom.css: For custom styling

