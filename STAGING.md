# Setting Up a Staging Environment for Dropship V2

This guide outlines the process of setting up a staging environment for the Dropship V2 project.

## Prerequisites

- A separate server or hosting environment for staging
- Access to a staging database

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

3. Set up environment variables for staging.

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

7. Set up a process manager to run the application.

8. Configure your web server to serve the application.

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
- Test with a copy of production data (anonymize sensitive information).
- Verify that all third-party integrations work correctly.

## Promoting Staging to Production

Once testing in staging is complete and successful:

1. Merge the staging branch into main:
   ```
   git checkout main
   git merge staging
   git push origin main
   ```

2. Deploy the main branch to your production environment.

Always test thoroughly in staging before deploying to production.
