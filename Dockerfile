# Use an official Python runtime as the base image
FROM python:3.9-slim AS base

# Set environment variables for Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    APP_HOME=/app

# Set the working directory in the container
WORKDIR $APP_HOME

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy only requirements for better caching
COPY requirements.txt $APP_HOME/

# Install Python dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the rest of the project files into the container
COPY . $APP_HOME/

# Use a non-root user
RUN adduser --disabled-password appuser && chown -R appuser $APP_HOME
USER appuser

# Expose the port (configurable)
EXPOSE 8000

# Default command to run the application
CMD ["python", "dropship_project/manage.py", "runserver", "0.0.0.0:8000"]

