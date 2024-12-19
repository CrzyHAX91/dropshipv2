import os
import unittest
from unittest.mock import patch
from ai_helpdesk import generate_content_with_gemini

class TestGeminiIntegration(unittest.TestCase):
    
    @patch('ai_helpdesk.requests.post')
    def test_generate_content(self, mock_post):
        os.environ['GEMINI_API_KEY'] = 'test_api_key'  # Mock the API key for testing
        query = "Explain how AI works"
        
        # Mock the response from the API
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'contents': [{'parts': [{'text': 'AI works by...'}]}]
        }
        
        response = generate_content_with_gemini(query)
        
        self.assertIn('contents', response)  # Check if 'contents' is in the response
        self.assertIsInstance(response['contents'], list)  # Ensure 'contents' is a list

if __name__ == '__main__':
    unittest.main()
