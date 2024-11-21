
def calculate_profit_margin(cost_price, selling_price):
    profit = selling_price - cost_price
    margin = (profit / cost_price) * 100
    return round(margin, 2)

def suggest_selling_price(cost_price, target_margin=20):
    suggested_price = cost_price * (1 + target_margin / 100)
    return round(suggested_price, 2)
