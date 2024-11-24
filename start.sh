#!/bin/bash

set -e

# Navigate to the project directory
cd /home/user/dropshipv2

# Load environment variables
set -a
source .env
set +a

# Install requirements
pip3 install -r requirements.txt

# Run migrations
python3 dropship_project/manage.py migrate

# Create a superuser if it doesn't exist
python3 dropship_project/manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'adminpassword')
    print("Superuser created.")
else:
    print("Superuser already exists.")
END

# Collect static files
python3 dropship_project/manage.py collectstatic --no-input

# Start the scheduler in the background
python3 scheduler.py &

# Start the development server
python3 dropship_project/manage.py runserver 0.0.0.0:8000
