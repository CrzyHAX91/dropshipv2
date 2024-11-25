from ai_helpdesk import AdvancedAIHelpdesk
import uuid

def main():
    helpdesk = AdvancedAIHelpdesk()
    
    test_scenarios = [
        ["How can I track my package?", "What if my order is delayed?"],
        ["Tell me about shipping times", "Do you offer express shipping?"],
        ["What's your return policy?", "How long does it take to process a refund?"],
        ["Can I cancel my order?", "What if my order has already shipped?"],
        ["What payment methods do you accept?", "Is it safe to use my credit card on your website?"],
        ["Do you ship internationally?", "How much does international shipping cost?"],
        ["Where can I find size information?", "What if the size I need is not available?"],
        ["Is this product in stock?", "When will out-of-stock items be available again?"],
        ["How do I use a discount code?", "Why isn't my discount code working?"],
        ["What if my question isn't answered here?", "Can I speak to a human?"]
    ]
    
    for i, scenario in enumerate(test_scenarios):
        user_id = f"test_user_{uuid.uuid4().hex[:8]}"
        
        for j, question in enumerate(scenario):
            question_id = f"q_{i+1}_{j+1}"
            
            print(f"User {user_id} - Question: {question}")
            response = helpdesk.generate_response(question, user_id)
            print(f"Response: {response}")
            
            # Simulate user feedback (random score between 1 and 5)
            feedback_score = random.randint(1, 5)
            helpdesk.get_feedback(user_id, question_id, feedback_score)
            print(f"Feedback score: {feedback_score}")
            print("-" * 50)
    
    print(f"Average feedback score: {helpdesk.average_feedback():.2f}")

if __name__ == "__main__":
    main()
