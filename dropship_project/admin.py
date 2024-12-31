from django.contrib import admin, messages
from .models import CustomUser, Product, CartItem, Order
from .aliexpress_integration import sync_products

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    """Admin interface for managing custom users."""
    list_display = ('username', 'email', 'is_staff')
    list_filter = ('is_staff', 'is_superuser')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin interface for managing products."""
    list_display = ('name', 'cost_price', 'selling_price', 'stock')
    list_filter = ('stock',)
    search_fields = ('name',)
    actions = ['sync_with_aliexpress']

    def sync_with_aliexpress(self, request, queryset):
        """Sync selected products with AliExpress."""
        sync_products()
        self.message_user(request, "Products synced with AliExpress successfully.",
                          messages.SUCCESS)
    sync_with_aliexpress.short_description = "Sync selected products with AliExpress"

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """Admin interface for managing cart items."""
    list_display = ('user', 'product', 'quantity')
    list_filter = ('user',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin interface for managing orders."""
    list_display = ('id', 'user', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'id')
    readonly_fields = ('user', 'items', 'total_price', 'created_at')
    actions = ['process_orders']

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def process_orders(self, request, queryset):
        """Process selected orders."""
        for order in queryset:
            if order.status == 'pending':
                success = order.process_order()
                if success:
                    self.message_user(request, f"Order #{order.id} processed successfully.", messages.SUCCESS)
                else:
                    self.message_user(request, f"Failed to process Order #{order.id}.", messages.ERROR)
            else:
                self.message_user(request, f"Order #{order.id} is not in pending status.", messages.WARNING)
    process_orders.short_description = "Process selected orders"
