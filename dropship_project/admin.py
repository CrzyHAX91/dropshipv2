from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.db.models import Count
from django.utils import timezone
from .models import CustomUser, Product, Order, CartItem

class CustomAdminSite(admin.AdminSite):
    site_header = 'Dropship Admin'
    site_title = 'Dropship Admin Portal'
    index_title = 'Welcome to Dropship Admin Portal'
    login_template = 'admin/login.html'
    index_template = 'admin/index.html'

    def index(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['user_count'] = CustomUser.objects.count()
        extra_context['product_count'] = Product.objects.count()
        extra_context['order_count'] = Order.objects.count()
        extra_context['recent_orders'] = Order.objects.order_by('-created_at')[:5]
        return super().index(request, extra_context)

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

