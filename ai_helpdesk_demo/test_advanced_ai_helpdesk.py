import random
import uuid
import csv
from ai_helpdesk import AdvancedAIHelpdesk

def main():
    # Initialize the helpdesk system
    helpdesk = AdvancedAIHelpdesk()
    
    # Define test scenarios
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
    
    # Prepare CSV for test results
    with open("helpdesk_test_results.csv", "w", newline="") as csvfile:
        fieldnames = ["user_id", "question", "response", "feedback_score"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        # Run tests
        for i, scenario in enumerate(test_scenarios):
            # Generate a unique user ID for each scenario
            user_id = f"test_user_{uuid.uuid4().hex[:8]}"
            
            for j, question in enumerate(scenario):
                print(f"User {user_id} - Question: {question}")
                
                # Generate response
                response = helpdesk.generate_response(question, user_id)
                print(f"Response: {response}")
                
                # Simulate feedback score (1-5)
                feedback_score = random.randint(1, 5)
                helpdesk.collect_feedback(user_id, feedback_score)
                print(f"Feedback score: {feedback_score}")
                print("-" * 50)
                
                # Log results to CSV
                writer.writerow({
                    "user_id": user_id,
                    "question": question,
                    "response": response,
                    "feedback_score": feedback_score
                })

        # Display average feedback score
        avg_score = helpdesk.average_feedback()
        print(f"Average feedback score: {avg_score:.2f}")

if __name__ == "__main__":
    main()
