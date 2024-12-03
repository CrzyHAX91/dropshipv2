import re
from fuzzywuzzy import fuzz
import random
from textblob import TextBlob

class AdvancedAIHelpdesk:
    def __init__(self):
        self.context = []
        self.feedback_scores = []
        self.user_profiles = {}
        self.knowledge_base = self.load_knowledge_base()
    
    def load_knowledge_base(self):
        # Placeholder for loading a more comprehensive knowledge base
        return {
            "track|tracking|find|locate order": "To track your order, please follow these steps:\n1. Log in to your account on our website.\n2. Go to the 'Order History' section.\n3. Find your order and click on 'Track Order'.\n4. You'll see the current status and estimated delivery date of your order.",
            "delay|delayed|late order": "If your order is delayed, please follow these steps:\n1. Check your order status on our website.\n2. If it's been more than 7 days past the estimated delivery date, please contact our customer support team.\n3. Provide your order number when contacting us for faster assistance.",
            "cancel|cancellation|stop order": "To cancel your order:\n1. Log in to your account on our website.\n2. Go to 'Order History' and find the order you want to cancel.\n3. If the order hasn't been shipped yet, you should see a 'Cancel Order' button.\n4. Click the button and confirm the cancellation.\n5. If you don't see the cancel button, the order may have already been shipped. In this case, please contact our customer support team for assistance.",
            "return policy|returns|refund": "Our return policy allows returns within 30 days of receiving your order. Please ensure the item is unused and in its original packaging. To initiate a return, log in to your account and go to the 'Returns' section.",
            "shipping time|delivery time|how long|when will I receive": "Shipping times vary depending on your location and the shipping method chosen. Typically, orders are processed within 1-2 business days, and shipping can take 3-7 business days for standard shipping, or 1-3 business days for express shipping.",
            "international shipping|ship to other countries": "Yes, we offer international shipping to many countries. Shipping costs and delivery times may vary depending on the destination. Please check our shipping information page or contact customer support for specific details about shipping to your country.",
            "payment methods|how to pay": "We accept various payment methods including credit/debit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay. You can select your preferred payment method during checkout.",
            "size guide|sizing": "You can find our size guide on the product page of each item. Click on the 'Size Guide' link to view detailed measurements and find the best fit for you.",
            "product availability|in stock": "Product availability is shown on each item's page. If an item is out of stock, you can sign up for email notifications to be alerted when it's back in stock.",
            "discount|coupon|promo code": "To use a discount or promo code, enter it in the designated field during checkout. Make sure to check the terms and conditions of the coupon, as some may have restrictions or expiration dates."
        }

    def generate_response(self, prompt, user_id):
        prompt_lower = prompt.lower()
        best_match = None
        best_score = 0

        for key, response in self.knowledge_base.items():
            for k in key.split('|'):
                score = fuzz.partial_ratio(k, prompt_lower)
                if score > best_score:
                    best_score = score
                    best_match = response

        if best_score >= 80:
            self.context.append(prompt)
            response = self.personalize_response(best_match, user_id)
            follow_up = self.generate_follow_up(prompt_lower)
            return f"{response}\n\n{follow_up}"
        elif self.context:
            return self.handle_follow_up(prompt_lower, user_id)
        else:
            return "I apologize, but I don't have specific information about that. Would you like me to connect you with a human customer service representative?"

    def personalize_response(self, response, user_id):
        if user_id in self.user_profiles:
            if "shipping" in response.lower() and "location" in self.user_profiles[user_id]:
                response += f"\n\nBased on your location in {self.user_profiles[user_id]['location']}, shipping might take an additional 1-2 days."
        return response

    def generate_follow_up(self, prompt):
        if "track" in prompt:
            return "Would you like to know about our shipping times as well?"
        elif "return" in prompt:
            return "Do you need any information about our refund process?"
        elif "shipping" in prompt:
            return "Would you like to know about our international shipping options?"
        else:
            return "Is there anything else I can help you with?"

    def handle_follow_up(self, prompt, user_id):
        prev_context = self.context[-1].lower()
        if "track" in prev_context and "shipping" in prompt:
            return self.personalize_response(self.knowledge_base["shipping time|delivery time|how long|when will I receive"], user_id)
        elif "return" in prev_context and "refund" in prompt:
            return "Refunds are typically processed within 5-10 business days after we receive the returned item. The refund will be issued to the original payment method."
        else:
            return f"Regarding your previous question about '{prev_context}', could you please provide more specific information about what you'd like to know?"

    def get_feedback(self):
        score = random.randint(1, 5)  # Simulating user feedback
        self.feedback_scores.append(score)
        return score

    def average_feedback(self):
        if self.feedback_scores:
            return sum(self.feedback_scores) / len(self.feedback_scores)
        return 0

    def analyze_sentiment(self, prompt):
        analysis = TextBlob(prompt)
        if analysis.sentiment.polarity < -0.3:  # Lowered threshold
            return "I apologize for any inconvenience. Would you like me to connect you with a human customer service representative?"
        return None

    def set_user_profile(self, user_id, profile):
        self.user_profiles[user_id] = profile

# Usage example
if __name__ == "__main__":
    helpdesk = AdvancedAIHelpdesk()
    helpdesk.set_user_profile("user123", {"location": "California"})

    test_prompts = [
        "How can I track my order?",
        "Yes, tell me about shipping times.",
        "What's your return policy?",
        "Yes, I need information about refunds.",
        "Do you offer international shipping?",
        "This is frustrating, I can't find my order!",
        "I'm not happy with the service.",
    ]

    for prompt in test_prompts:
        sentiment_response = helpdesk.analyze_sentiment(prompt)
        if sentiment_response:
            print(f"Prompt: {prompt}")
            print(f"Response: {sentiment_response}")
        else:
            response = helpdesk.generate_response(prompt, "user123")
            print(f"Prompt: {prompt}")
            print(f"Response: {response}")
        feedback = helpdesk.get_feedback()
        print(f"Feedback score: {feedback}")
        print("-" * 50)

    print(f"Average feedback score: {helpdesk.average_feedback():.2f}")
