"""
Middleware for handling exceptions globally in the Django application and adding security headers.
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
        # Handle real client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            request.META['REMOTE_ADDR'] = x_forwarded_for.split(',')[0]

        # Set security headers
        response = self.get_response(request)
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response['Content-Security-Policy'] = "default-src 'self';"

        try:
            return response
        except Exception as e:
            logger.error(f"Unhandled exception: {str(e)}")
            return JsonResponse({'error': 'An unexpected error occurred.'}, status=500)