
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import Order, Product

def get_sales_report(days=30):
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)
    
    orders = Order.objects.filter(created_at__range=[start_date, end_date], status='paid')
    
    total_sales = orders.aggregate(total=Sum('total_price'))['total'] or 0
    order_count = orders.count()
    
    top_products = Product.objects.filter(order__in=orders).annotate(
        total_sales=Sum('order__total_price'),
        quantity_sold=Count('order')
    ).order_by('-total_sales')[:5]
    
    return {
        'total_sales': total_sales,
        'order_count': order_count,
        'top_products': top_products,
        'start_date': start_date,
        'end_date': end_date
    }

def get_inventory_report():
    products = Product.objects.annotate(
        total_sales=Sum('order__total_price'),
        quantity_sold=Count('order')
    ).order_by('-quantity_sold')
    
    return {
        'products': products,
        'total_products': products.count(),
        'total_inventory_value': sum(product.cost_price * product.quantity for product in products)
    }
