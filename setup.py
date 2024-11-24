import os
import django
from django.core.management import call_command

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dropship_project.settings")
django.setup()

def setup_project():
    print("Setting up the Dropship V2 project...")
    
    # Run migrations
    call_command('makemigrations')
    call_command('migrate')
    
    # Create superuser
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'adminpassword')
        print("Superuser created.")
    
    # Populate database with sample data
    call_command('populate_db')
    
    # Collect static files
    call_command('collectstatic', interactive=False)
    
    print("Setup complete!")

if __name__ == "__main__":
    setup_project()
