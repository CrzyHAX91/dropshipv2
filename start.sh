#!/bin/bash

# Author: [CrazyHxs]
# Navigate to the project directory
cd /home/user/dropshipv2
# Run the script
python3 start.sh
# Install requirements
pip3 install -r requirements.txt

# Run migrations
python3 dropship_project/manage.py migrate




# Create a superuser if it doesn't exist
python3 dropship_project/manage.py shell << END
# Create a superuser if it doesn't existpython3 dropship_project/manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'adminpassword')
    print("Superuser created.")
else:
    print("Superuser already exists.")
END
# Run the development server
python3 dropship_project/manage.py runserver 0.0.0.0:8000




# Function to create a superuser if one doesn't exist
# Create a superuser if one doesn't exist
    # """
    # This function attempts to create a superuser for the Django project if one does not already exist.
    # It retrieves the user model using Django's get_user_model function and runs a Python command
    # within the manage.py shell to check for the existence of a superuser. If no superuser is found,
    # a new superuser is created with predefined credentials.
    # """
create_superuser() -> None {
    """Create a superuser for the Django project if one does not already exist.
    This function retrieves the user model using Django's get_user_model function
    and runs a Python command within the manage.py shell to check for the
    existence of a superuser. If no superuser is found, a new superuser is
    created with predefined credentials.
    """
    local user_model: str
    user_model=$(python3 -c 'from django.contrib.auth import get_user_model; print(get_user_model().__module__ + "." + get_user_model().__qualname__)')
    python3 dropship_project/manage.py shell << END
        # Import the user model
        from ${user_model} import ${user_model##*.}
        from ${user_model} import ${user_model##*.}
        # Check if a superuser exists
        if not ${user_model##*.}.objects.filter(is_superuser=True).exists():
            # Create a superuser
            ${user_model##*.}.objects.create_superuser('admin', 'admin@example.com', 'adminpassword')
        if not ${user_model##*.}.objects.filter(is_superuser=True).exists():
            ${user_model##*.}.objects.create_superuser('admin', 'admin@example.com', 'adminpassword')
    END
END
}
# Main script execution
create_superuser
# Collect static files
python3 dropship_project/manage.py collectstatic --no-input


# Start the scheduler in the background
python3 scheduler.py &

# Run the development server
python3 dropship_project/manage.py runserver 0.0.0.0:8000
# Start the development server
python3 dropship_project/manage.py runserver 0.0.0.0:8000








