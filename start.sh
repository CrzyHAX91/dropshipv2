#!/bin/bash

# Navigate to the project directory
cd /home/user/dropshipv2

# Install requirements
pip3 install -r requirements.txt

# Run migrations
python3 dropship_project/manage.py migrate

# Populate the database
python3 dropship_project/manage.py populate_db

# Collect static files
python3 dropship_project/manage.py collectstatic --no-input

# Start the development server
python3 dropship_project/manage.py runserver 0.0.0.0:8000
