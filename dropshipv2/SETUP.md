# Setting Up the Development Environment for Dropship V2

This guide will walk you through the process of setting up a development environment for the Dropship V2 project.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- virtualenv (recommended for creating isolated Python environments)
- Git

## Step-by-Step Setup

1. Clone the repository:
   ```
   git clone https://github.com/CrzyHAX91/dropshipv2.git
   cd dropshipv2
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use 
   ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a .env file in the project root and add the following variables:
   ```
   DEBUG=True
   SECRET_KEY=your_secret_key_here
   DATABASE_URL=sqlite:///db.sqlite3
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

5. Run database migrations:
   ```
   python manage.py migrate
   ```

6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```
   python manage.py runserver
   ```

8. Access the application at http://localhost:8000

## Running Tests

To run the test suite:
```
python manage.py test
```

## Additional Configuration

- For setting up social authentication, you'll need to configure the respective provider keys in the Django admin.
- To enable two-factor authentication, make sure you've set up the necessary settings in settings.py.

## Troubleshooting

If you encounter any issues during setup, please check the following:
- Ensure all required system dependencies are installed.
- Verify that your Python version is compatible (3.8+).
- Make sure all environment variables are set correctly.

If problems persist, please open an issue on the GitHub repository.
