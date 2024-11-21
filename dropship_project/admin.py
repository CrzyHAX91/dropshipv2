from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.db.models import Count, F
from django.utils import timezone
from django.urls import path
from django.shortcuts import render
from .models import CustomUser, Product, Order, CartItem
import json

class CustomAdminSite(admin.AdminSite):
    site_header = 'Dropship Admin'
    site_title = 'Dropship Admin Portal'
    index_title = 'Welcome to Dropship Admin Portal'
    login_template = 'admin/login.html'
    index_template = 'admin/index.html'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('order-stats/', self.admin_view(self.order_stats_view), name='order_stats'),
        ]
        return custom_urls + urls

    def index(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['user_count'] = CustomUser.objects.count()
        extra_context['product_count'] = Product.objects.count()
        extra_context['order_count'] = Order.objects.count()
        extra_context['recent_orders'] = Order.objects.order_by('-created_at')[:5]
        return super().index(request, extra_context)

    def order_stats_view(self, request):
        # Get order counts for the last 7 days
        end_date = timezone.now().date()
        start_date = end_date - timezone.timedelta(days=6)
        order_data = Order.objects.filter(created_at__date__range=[start_date, end_date])             .values('created_at__date')             .annotate(count=Count('id'))             .order_by('created_at__date')

        labels = [(start_date + timezone.timedelta(days=i)).strftime('%Y-%m-%d') for i in range(7)]
        data = [0] * 7

        for item in order_data:
            index = (item['created_at__date'] - start_date).days
            data[index] = item['count']

        context = {
            'labels': json.dumps(labels),
            'data': json.dumps(data),
        }
        return render(request, 'admin/order_stats.html', context)

admin_site = CustomAdminSite(name='customadmin')

@admin.register(CustomUser, site=admin_site)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone_number', 'address')}),
    )

@admin.register(Product, site=admin_site)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock', 'category')
    list_filter = ('category',)
    search_fields = ('name', 'description')
    actions = ['increase_stock', 'decrease_stock']

    def increase_stock(self, request, queryset):
        updated = queryset.update(stock=F('stock') + 10)
        self.message_user(request, f'Successfully increased stock for {updated} products.')
    increase_stock.short_description = "Increase stock by 10"

    def decrease_stock(self, request, queryset):
        updated = queryset.update(stock=F('stock') - 10)
        self.message_user(request, f'Successfully decreased stock for {updated} products.')
    decrease_stock.short_description = "Decrease stock by 10"

@admin.register(Order, site=admin_site)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'user__email')
    actions = ['mark_as_shipped']

    def mark_as_shipped(self, request, queryset):
        updated = queryset.update(status='shipped', shipped_at=timezone.now())
        self.message_user(request, f'{updated} orders were successfully marked as shipped.')
    mark_as_shipped.short_description = "Mark selected orders as shipped"

@admin.register(CartItem, site=admin_site)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity')
    list_filter = ('user', 'product')

