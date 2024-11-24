from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.db.models import F, Sum
from .models import Product, CartItem, Order
from .aliexpress_integration import sync_products

def is_admin(user):
    return user.is_staff or user.is_superuser

def product_list(request):
    products = Product.objects.all()
    return render(request, 'product_list.html', {'products': products})

def product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    return render(request, 'product_detail.html', {'product': product})

@login_required
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    cart_item, created = CartItem.objects.get_or_create(user=request.user, product=product)
    if not created:
        cart_item.quantity = F('quantity') + 1
        cart_item.save()
    return redirect('cart')

@login_required
def cart(request):
    cart_items = CartItem.objects.filter(user=request.user).select_related('product')
    total = cart_items.aggregate(total=Sum(F('product__selling_price') * F('quantity')))['total'] or 0
    return render(request, 'cart.html', {'cart_items': cart_items, 'total': total})

@login_required
def checkout(request):
    cart_items = CartItem.objects.filter(user=request.user).select_related('product')
    total = cart_items.aggregate(total=Sum(F('product__selling_price') * F('quantity')))['total'] or 0
    if request.method == 'POST':
        order = Order.objects.create(user=request.user, total_price=total)
        order.items.set(cart_items)
        cart_items.delete()
        success = order.process_order()
        if success:
            return redirect('order_confirmation', order_id=order.id)
        else:
            return render(request, 'order_failed.html', {'order': order})
    return render(request, 'checkout.html', {'cart_items': cart_items, 'total': total})

@login_required
def order_confirmation(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return render(request, 'order_confirmation.html', {'order': order})

@user_passes_test(is_admin)
def admin_dashboard(request):
    recent_orders = Order.objects.all().order_by('-created_at')[:10]
    total_sales = Order.objects.aggregate(total=Sum('total_price'))['total'] or 0
    return render(request, 'admin_dashboard.html', {
        'recent_orders': recent_orders,
        'total_sales': total_sales
    })

@user_passes_test(is_admin)
def sync_aliexpress_products(request):
    sync_products()
    return JsonResponse({'status': 'success', 'message': 'Products synced successfully'})

