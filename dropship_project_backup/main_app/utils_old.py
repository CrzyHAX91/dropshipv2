def calculate_total_price(cart_items):
    """
    Calculate the total price of the cart items.
    """
    return cart_items.aggregate(total=Sum(F('product__price') * F('quantity')))['total'] or 0
