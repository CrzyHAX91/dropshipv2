#!/bin/bash

# Navigate to the project directory
cd /home/user/dropshipv2

# Activate virtual environment (if you're using one)
# source /path/to/your/virtualenv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run setup script
python setup.py

# Run the development server
python dropship_project/manage.py runserver 0.0.0.0:8000
