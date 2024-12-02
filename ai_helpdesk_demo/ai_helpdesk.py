import logging
import re
from rapidfuzz import fuzz
from textblob import TextBlob

# Configure logging
logging.basicConfig(
    filename="advanced_helpdesk.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

class AdvancedAIHelpdesk:
    def __init__(self):
        self.context = {}
        self.feedback_scores = []
        self.user_profiles = {}
        self.knowledge_base = self.load_knowledge_base()

    def load_knowledge_base(self):
        """Load a predefined knowledge base with regex-like keys."""
        return {
            r"track|tracking|find|locate order": "To track your order, please follow these steps:\n1. Log in to your account on our website.\n2. Go to the 'Order History' section.\n3. Find your order and click on 'Track Order'.\n4. You'll see the current status and estimated delivery date of your order.",
            r"delay|delayed|late order": "If your order is delayed, please follow these steps:\n1. Check your order status on our website.\n2. If it's been more than 7 days past the estimated delivery date, please contact our customer support team.\n3. Provide your order number when contacting us for faster assistance.",
            r"cancel|cancellation|stop order": "To cancel your order:\n1. Log in to your account on our website.\n2. Go to 'Order History' and find the order you want to cancel.\n3. If the order hasn't been shipped yet, you should see a 'Cancel Order' button.\n4. Click the button and confirm the cancellation.\n5. If you don't see the cancel button, the order may have already been shipped. In this case, please contact our customer support team for assistance.",
            r"return policy|returns|refund": "Our return policy allows returns within 30 days of receiving your order. Please ensure the item is unused and in its original packaging. To initiate a return, log in to your account and go to the 'Returns' section.",
            r"shipping time|delivery time|how long|when will I receive": "Shipping times vary depending on your location and the shipping method chosen. Typically, orders are processed within 1-2 business days, and shipping can take 3-7 business days for standard shipping, or 1-3 business days for express shipping.",
            r"international shipping|ship to other countries": "Yes, we offer international shipping to many countries. Shipping costs and delivery times may vary depending on the destination. Please check our shipping information page or contact customer support for specific details about shipping to your country.",
            r"payment methods|how to pay": "We accept various payment methods including credit/debit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay. You can select your preferred payment method during checkout.",
            r"size guide|sizing": "You can find our size guide on the product page of each item. Click on the 'Size Guide' link to view detailed measurements and find the best fit for you.",
            r"product availability|in stock": "Product availability is shown on each item's page. If an item is out of stock, you can sign up for email notifications to be alerted when it's back in stock.",
            r"discount|coupon|promo code": "To use a discount or promo code, enter it in the designated field during checkout. Make sure to check the terms and conditions of the coupon, as some may have restrictions or expiration dates."
        }

    def generate_response(self, prompt, user_id):
        """Generate a response based on the user's query."""
        prompt_lower = prompt.lower()
        best_match = None
        best_score = 0

        for pattern, response in self.knowledge_base.items():
            if re.search(pattern, prompt_lower):
                score = fuzz
