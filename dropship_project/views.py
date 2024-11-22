from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import Order, CartItem, Product

@login_required
def user_dashboard(request):
    user = request.user
    recent_orders = Order.objects.filter(user=user).order_by('-created_at')[:5]
    cart_items = CartItem.objects.filter(user=user)
    available_products = Product.objects.filter(stock__gt=0)[:10]  # Show 10 available products
    
    context = {
        'user': user,
        'recent_orders': recent_orders,
        'cart_items': cart_items,
        'available_products': available_products,
    }
    return render(request, 'user_dashboard.html', context)

