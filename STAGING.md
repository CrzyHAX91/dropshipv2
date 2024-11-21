# Setting Up a Staging Environment for Dropship V2

This guide outlines the process of setting up a staging environment for the Dropship V2 project. A staging environment allows you to test changes in a production-like setting before deploying to the live site.

## Prerequisites

- A separate server or hosting environment for staging (e.g., a separate Heroku app)
- Access to a staging database (can be a separate database on the same server as production)

## Steps to Set Up Staging

1. Clone the repository on your staging server:
   ```
   git clone https://github.com/CrzyHAX91/dropshipv2.git
   cd dropshipv2
   ```

2. Create a new branch for staging:
   ```
   git checkout -b staging
   ```

3. Set up environment variables for staging:
   Create a .env file in the project root and add the following variables:
   ```
   DEBUG=False
   SECRET_KEY=your_staging_secret_key_here
   DATABASE_URL=your_staging_database_url
   ALLOWED_HOSTS=your-staging-domain.com
   ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run database migrations:
   ```
   python manage.py migrate
   ```

6. Collect static files:
   ```
   python manage.py collectstatic
   ```

7. Set up a process manager (e.g., Gunicorn) to run the application.

8. Configure your web server (e.g., Nginx) to serve the application.

## Deploying to Staging

1. Push changes to the staging branch:
   ```
   git push origin staging
   ```

2. On your staging server, pull the changes:
   ```
   git pull origin staging
   ```

3. Restart your application server.

## Testing in Staging

- Perform thorough testing of all features in the staging environment.
- Test with a copy of production data (be sure to anonymize sensitive information).
- Verify that all third-party integrations work correctly in the staging environment.

## Promoting Staging to Production

Once testing in staging is complete and successful:

1. Merge the staging branch into main:
   ```
   git checkout main
   git merge staging
   git push origin main
   ```

2. Deploy the main branch to your production environment.

Remember to always test thoroughly in staging before deploying to production.
