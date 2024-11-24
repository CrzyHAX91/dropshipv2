from django.shortcuts import render, redirect, get_object_or_404
<<<<<<< HEAD
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.db.models import F, Sum
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import Product, CartItem, Order
from .aliexpress_integration import sync_products
import json

def is_admin(user):
    return user.is_staff or user.is_superuser
=======
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Product, CartItem, Order
from django.db.models import F, Sum
>>>>>>> origin/main

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
<<<<<<< HEAD
    total = cart_items.aggregate(total=Sum(F('product__selling_price') * F('quantity')))['total'] or 0
=======
    total = cart_items.aggregate(total=Sum(F('product__price') * F('quantity')))['total'] or 0
>>>>>>> origin/main
    return render(request, 'cart.html', {'cart_items': cart_items, 'total': total})

@login_required
def checkout(request):
    cart_items = CartItem.objects.filter(user=request.user).select_related('product')
<<<<<<< HEAD
    total = cart_items.aggregate(total=Sum(F('product__selling_price') * F('quantity')))['total'] or 0
=======
    total = cart_items.aggregate(total=Sum(F('product__price') * F('quantity')))['total'] or 0
>>>>>>> origin/main
    if request.method == 'POST':
        order = Order.objects.create(user=request.user, total_price=total)
        order.items.set(cart_items)
        cart_items.delete()
<<<<<<< HEAD
        success = order.process_order()
        if success:
            return redirect('order_confirmation', order_id=order.id)
        else:
            return render(request, 'order_failed.html', {'order': order})
=======
        return redirect('order_confirmation', order_id=order.id)
>>>>>>> origin/main
    return render(request, 'checkout.html', {'cart_items': cart_items, 'total': total})

@login_required
def order_confirmation(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return render(request, 'order_confirmation.html', {'order': order})

<<<<<<< HEAD
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

def helpdesk(request):
    return render(request, 'helpdesk.html')

@csrf_exempt
@require_http_methods(["POST"])
def helpdesk_api(request):
    data = json.loads(request.body)
    user_message = data.get('message', '')
    
    # Here you would typically send the user_message to an AI model and get a response
    # For now, we'll just echo the message back
    ai_response = f"You said: {user_message}"
    
    return JsonResponse({'response': ai_response})
=======
@login_required
def user_dashboard(request):
    recent_orders = Order.objects.filter(user=request.user).order_by('-created_at')[:5]
    total_orders = Order.objects.filter(user=request.user).count()
    total_spent = Order.objects.filter(user=request.user).aggregate(total=Sum('total_price'))['total'] or 0
    context = {
        'recent_orders': recent_orders,
        'total_orders': total_orders,
        'total_spent': total_spent,
    }
    return render(request, 'user_dashboard.html', context)

@login_required
def user_profile(request):
    if request.method == 'POST':
        user = request.user
        user.email = request.POST.get('email')
        user.first_name = request.POST.get('first_name')
        user.last_name = request.POST.get('last_name')
        user.save()
        return JsonResponse({'success': True, 'message': 'Profile updated successfully.'})
    return render(request, 'user_profile.html')
>>>>>>> origin/main

