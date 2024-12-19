import os
import requests
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_content_with_gemini(query):
    """Generate content using the Gemini API based on the provided query."""
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        logger.error("GEMINI_API_KEY is not set.")
        raise EnvironmentError("GEMINI_API_KEY must be set in environment variables.")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    headers = {
        'Content-Type': 'application/json',
    }
    
    data = {
        "contents": [{
            "parts": [{"text": query}]
        }]
    }
    
    logger.info(f"Sending request to Gemini API with query: {query}")
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        logger.info("Request successful.")
        return response.json()
    else:
        logger.error(f"Error: {response.status_code} - {response.text}")
        raise Exception(f"Error: {response.status_code} - {response.text}")
