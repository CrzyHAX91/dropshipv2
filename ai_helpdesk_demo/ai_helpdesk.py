import re
from fuzzywuzzy import fuzz
import random
import logging
from collections import defaultdict

logging.basicConfig(filename='helpdesk.log', level=logging.INFO, format='%(asctime)s - %(message)s')

class AdvancedAIHelpdesk:
    def __init__(self):
        self.context = defaultdict(list)
        self.feedback_scores = {}
        self.user_profiles = {}
        self.knowledge_base = self.load_knowledge_base()
    
    def load_knowledge_base(self):
        return {
            "track order": {
                "keywords": ["track", "order", "status", "where", "package"],
                "response": "To track your order, please follow these steps:\n1. Log in to your account on our website.\n2. Go to the 'Order History' section.\n3. Find your order and click on 'Track Order'.\n4. You'll see the current status and estimated delivery date of your order.",
                "follow_up": ["What if my order is delayed?", "How long does shipping usually take?"]
            },
            "shipping time": {
                "keywords": ["shipping", "delivery", "time", "how long", "when", "receive"],
                "response": "Shipping times vary depending on your location and the shipping method chosen. Typically, orders are processed within 1-2 business days, and shipping can take 3-7 business days for standard shipping, or 1-3 business days for express shipping.",
                "follow_up": ["Do you offer express shipping?", "How can I change my shipping method?"]
            },
            "return policy": {
                "keywords": ["return", "policy", "refund", "exchange", "send back"],
                "response": "Our return policy allows returns within 30 days of receiving your order. Please ensure the item is unused and in its original packaging. To initiate a return, log in to your account and go to the 'Returns' section.",
                "follow_up": ["How long does it take to process a refund?", "Can I exchange an item for a different size?"]
            },
            "cancel order": {
                "keywords": ["cancel", "order", "stop", "change"],
                "response": "To cancel your order:\n1. Log in to your account on our website.\n2. Go to 'Order History' and find the order you want to cancel.\n3. If the order hasn't been shipped yet, you should see a 'Cancel Order' button.\n4. Click the button and confirm the cancellation.\n5. If you don't see the cancel button, the order may have already been shipped. In this case, please contact our customer support team for assistance.",
                "follow_up": ["What if my order has already shipped?", "Can I change my order instead of cancelling it?"]
            },
            "payment methods": {
                "keywords": ["payment", "methods", "pay", "credit card", "paypal"],
                "response": "We accept various payment methods including credit/debit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay. You can select your preferred payment method during checkout.",
                "follow_up": ["Is it safe to use my credit card on your website?", "Can I pay with multiple payment methods?"]
            },
            "international shipping": {
                "keywords": ["international", "shipping", "worldwide", "countries"],
                "response": "Yes, we offer international shipping to many countries. Shipping costs and delivery times may vary depending on the destination. Please check our shipping information page or contact customer support for specific details about shipping to your country.",
                "follow_up": ["How much does international shipping cost?", "Do I have to pay customs fees?"]
            },
            "size guide": {
                "keywords": ["size", "guide", "fit", "measurement"],
                "response": "You can find our size guide on the product page of each item. Click on the 'Size Guide' link to view detailed measurements and find the best fit for you.",
                "follow_up": ["What if the size I need is not available?", "Do your sizes run small or large?"]
            },
            "product availability": {
                "keywords": ["available", "in stock", "out of stock", "backorder"],
                "response": "Product availability is shown on each item's page. If an item is out of stock, you can sign up for email notifications to be alerted when it's back in stock.",
                "follow_up": ["When will out-of-stock items be available again?", "Can I pre-order items that are out of stock?"]
            },
            "discount code": {
                "keywords": ["discount", "code", "coupon", "promo", "offer"],
                "response": "To use a discount code, enter it in the designated field during checkout. Make sure to check the terms and conditions of the coupon, as some may have restrictions or expiration dates.",
                "follow_up": ["Where can I find active discount codes?", "Why isn't my discount code working?"]
            }
        }

    def generate_response(self, prompt, user_id):
        logging.info(f"User {user_id} asked: {prompt}")
        prompt_lower = prompt.lower()
        best_match = None
        best_score = 0

        for key, data in self.knowledge_base.items():
            score = max(fuzz.token_set_ratio(keyword, prompt_lower) for keyword in data["keywords"])
            if score > best_score:
                best_score = score
                best_match = data

        if best_score >= 70:
            response = best_match["response"]
            self.context[user_id].append(key)
            follow_up = f"\n\nCan I help you with anything else? You might also want to know:\n" + "\n".join(best_match["follow_up"])
        elif self.context[user_id]:
            response = self.handle_follow_up(prompt_lower, user_id)
        else:
            response = "I'm sorry, I don't have specific information about that. Can you please rephrase your question or ask about something else?"
            follow_up = ""

        logging.info(f"Response to user {user_id}: {response}")
        return response + follow_up

    def handle_follow_up(self, prompt, user_id):
        last_context = self.context[user_id][-1]
        follow_up_questions = self.knowledge_base[last_context]["follow_up"]
        
        best_match = None
        best_score = 0
        for question in follow_up_questions:
            score = fuzz.token_set_ratio(question.lower(), prompt)
            if score > best_score:
                best_score = score
                best_match = question

        if best_score >= 70:
            return self.generate_response(best_match, user_id)
        else:
            return "I'm sorry, I don't have specific information about that follow-up question. Can you please ask a different question or provide more details?"

    def get_feedback(self, user_id, question_id, score):
        if user_id not in self.feedback_scores:
            self.feedback_scores[user_id] = {}
        self.feedback_scores[user_id][question_id] = score
        logging.info(f"Feedback received from user {user_id} for question {question_id}: {score}")

    def average_feedback(self):
        all_scores = [score for user_scores in self.feedback_scores.values() for score in user_scores.values()]
        if all_scores:
            return sum(all_scores) / len(all_scores)
        return 0
