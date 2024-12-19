"""
Middleware for handling exceptions globally in the Django application.
"""

import logging
from django.http import JsonResponse

logger = logging.getLogger(__name__)

class ExceptionMiddleware:
    """
    Middleware to catch exceptions and return a JSON response.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            logger.error(f"Unhandled exception: {str(e)}")
            return JsonResponse({'error': 'An unexpected error occurred.'}, status=500)
