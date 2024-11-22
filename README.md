# Dropship V2

Dropship V2 is a Django-based e-commerce platform for dropshipping. It includes features for product management, user authentication, shopping cart functionality, order processing, and integration with various third-party services.

## Key Features

1. User authentication and registration (including social auth and two-factor authentication)
2. Product listing and management
3. Shopping cart functionality
4. Checkout process with payment integration
5. Order management for administrators
6. Inventory management with stock tracking
7. Email notifications for order updates
8. Responsive design using Bootstrap
9. API with OAuth2 authentication

## Technology Stack

- Backend: Django 5.1.3
- Database: PostgreSQL
- Frontend: HTML, CSS (Bootstrap), JavaScript
- Authentication: django-allauth 65.2.0, django-two-factor-auth
- API: Django REST framework 3.15.2
- Security: django-axes 7.0.0
- OAuth2: django-oauth-toolkit 3.0.1

## Setup

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Set up environment variables (see `.env.example`)
4. Run migrations: `python manage.py migrate`
5. Create a superuser: `python manage.py createsuperuser`
6. Start the development server: `python manage.py runserver`

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

