from django.contrib import admin
from django.urls import path
from django.shortcuts import render
from django.db.models import Sum, Count
from django.utils import timezone
from .models import CustomUser, Product, Order, CartItem

class CustomAdminSite(admin.AdminSite):
    site_header = 'Dropship Admin'
    site_title = 'Dropship Admin Portal'
    index_title = 'Welcome to Dropship Admin Portal'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('dashboard/', self.admin_view(self.dashboard_view), name='dashboard'),
        ]
        return custom_urls + urls

    def dashboard_view(self, request):
        # Fetch key metrics
        total_sales = Order.objects.aggregate(total=Sum('total_price'))['total'] or 0
        new_users = CustomUser.objects.filter(date_joined__gte=timezone.now() - timezone.timedelta(days=7)).count()
        pending_orders = Order.objects.filter(status='pending').count()

        # Recent orders
        recent_orders = Order.objects.order_by('-created_at')[:5]

        context = {
            'total_sales': total_sales,
            'new_users': new_users,
            'pending_orders': pending_orders,
            'recent_orders': recent_orders,
        }
        return render(request, 'admin/dashboard.html', context)

admin_site = CustomAdminSite(name='customadmin')

@admin.register(CustomUser, site=admin_site)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'date_joined', 'is_staff')
    search_fields = ('username', 'email')

@admin.register(Product, site=admin_site)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock', 'category')
    list_filter = ('category',)
    search_fields = ('name', 'description')

@admin.register(Order, site=admin_site)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'user__email')

@admin.register(CartItem, site=admin_site)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity')
    list_filter = ('user', 'product')

