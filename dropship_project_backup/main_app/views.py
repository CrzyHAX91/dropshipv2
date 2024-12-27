from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.db.models import F, Sum
from django.views.decorators.http import require_http_methods
import json
from .models import Product, CartItem, Order
from .utils import calculate_total_price
from .aliexpress_integration import sync_products
from aliexpress_product import post_product_with_forecasting
from django.views.decorators.csrf import csrf_exempt

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
    try:
        product = get_object_or_404(Product, id=product_id)
        cart_item, created = CartItem.objects.get_or_create(user=request.user, product=product)
        if not created:
            cart_item.quantity = F('quantity') + 1
            cart_item.save()
        return redirect('cart')
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def cart(request):
    cart_items = CartItem.objects.filter(user=request.user).select_related('product')
    total = calculate_total_price(cart_items)
    return render(request, 'cart.html', {'cart_items': cart_items, 'total': total})

@login_required
def checkout(request):
    cart_items = CartItem.objects.filter(user=request.user).select_related('product')
    total = calculate_total_price(cart_items)
    if request.method == 'POST':
        order = Order.objects.create(user=request.user, total_price=total)
        order.items.set(cart_items)
        cart_items.delete()
        return redirect('order_confirmation', order_id=order.id)
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
    try:
        sync_products()
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'success', 'message': 'Products synced successfully'})

def helpdesk(request):
    return render(request, 'helpdesk.html')

@require_http_methods(["POST"])
def helpdesk_api(request):
    try:
        data = json.loads(request.body)
        user_message = data.get('message', '')
        if not user_message:
            return JsonResponse({'error': 'Message is required.'}, status=400)

        ai_response = f"You said: {user_message}"
        return JsonResponse({'response': ai_response})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def user_dashboard(request):
    recent_orders = Order.objects.filter(user=request.user).order_by('-created_at')[:5]
    total_orders = Order.objects.filter(user=request.user).count()
    total_spent = Order.objects.filter(user=request.user).aggregate(total=Sum('total_price'))['total'] or 0
    context = {
        'recent_orders': recent_orders,
        'total_orders': total_orders,
        'total_spent': total_spent
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

@csrf_exempt
def post_product(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            api_key = "YOUR_API_KEY"  # Replace with your actual API key
            product_details = {
                "title": data.get("title"),
                "description": data.get("description"),
                "price": data.get("price"),
                "tags": data.get("tags").split(",")  # Assuming tags are sent as a comma-separated string
            }
            response = post_product_with_forecasting(api_key, product_details)
            return JsonResponse(response, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
