    """_summary_
    """def generate_response(self, prompt, user_id):
    """Generate a response based on the user's query."""
    prompt_lower = prompt.lower()
    best_match = None
    best_score = 0
    threshold = 60  # minimum score to consider a match

    for pattern, response in self.knowledge_base.items():
        if re.search(pattern, prompt_lower):
            score = fuzz.token_sort_ratio(prompt_lower, pattern)
            if score > best_score and score >= threshold:
                best_match = response
                best_score = score

    if best_match is None:
        best_match = "Sorry, I didn't understand your question. Please try rephrasing it."
        # log the unknown prompt for future improvement
        self.unknown_prompts.append(prompt)

    return best_match