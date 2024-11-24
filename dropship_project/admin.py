from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Order, CartItem, Product

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['email', 'username', 'is_staff', 'is_active']
    list_filter = ['is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone_number', 'address', 'date_of_birth')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('phone_number', 'address', 'date_of_birth')}),
    )

class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'created_at', 'total_price']
    list_filter = ['created_at']

class CartItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'quantity']

class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'stock']
    list_filter = ['price', 'stock']

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(CartItem, CartItemAdmin)
admin.site.register(Product, ProductAdmin)

