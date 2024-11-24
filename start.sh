#!/bin/bash

<<<<<<< HEAD
set -e

# Navigate to the project directory
cd /home/user/dropshipv2

# Load environment variables
set -a
source .env
set +a

=======
# Navigate to the project directory
cd /home/user/dropshipv2

>>>>>>> origin/main
# Install requirements
pip3 install -r requirements.txt

# Run migrations
python3 dropship_project/manage.py migrate

<<<<<<< HEAD
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
=======
# Populate the database
python3 dropship_project/manage.py populate_db
>>>>>>> origin/main

# Collect static files
python3 dropship_project/manage.py collectstatic --no-input

<<<<<<< HEAD
# Start the scheduler in the background
python3 scheduler.py &

=======
>>>>>>> origin/main
# Start the development server
python3 dropship_project/manage.py runserver 0.0.0.0:8000
