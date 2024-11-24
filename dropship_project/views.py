from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db import models
from .models import Order

@login_required
def user_dashboard(request):
    # Fetch recent orders for the user
    recent_orders = Order.objects.filter(user=request.user).order_by('-created_at')[:5]
    
    # Calculate total orders and total spent
    total_orders = Order.objects.filter(user=request.user).count()
    total_spent = Order.objects.filter(user=request.user).aggregate(total=models.Sum('total_price'))['total'] or 0

    context = {
        'recent_orders': recent_orders,
        'total_orders': total_orders,
        'total_spent': total_spent,
    }
    return render(request, 'user_dashboard.html', context)

@login_required
def user_profile(request):
    if request.method == 'POST':
        # Handle form submission to update user profile
        user = request.user
        user.email = request.POST.get('email')
        user.first_name = request.POST.get('first_name')
        user.last_name = request.POST.get('last_name')
        user.save()
        return JsonResponse({'success': True, 'message': 'Profile updated successfully.'})
    
    return render(request, 'user_profile.html')

@login_required
def search_orders(request):
    query = request.GET.get('q', '')
    orders = Order.objects.filter(user=request.user, id__icontains=query).values('id', 'created_at', 'total_price')
    return JsonResponse(list(orders), safe=False)
