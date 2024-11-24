# Use an official Python runtime as the base image
FROM python:3.9

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Copy the project files into the container
COPY . /app/

# Install project dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Run the setup script
RUN python setup.py

# Expose the port the app runs on
EXPOSE 8000

# Start the application
CMD ["python", "dropship_project/manage.py", "runserver", "0.0.0.0:8000"]
