
from django.contrib import admin
from .models import Category, Product, Order, CartItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'cost_price', 'selling_price', 'stock')
    list_filter = ('category', 'name')
    search_fields = ('name', 'description')

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'total_price')
    list_filter = ('user', 'product')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_price', 'created_at', 'status', 'is_paid')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'id')
    actions = ['mark_as_processing', 'mark_as_shipped', 'mark_as_delivered']

    def is_paid(self, obj):
        return obj.is_paid
    is_paid.boolean = True

    def mark_as_processing(self, request, queryset):
        queryset.update(status='processing')
    mark_as_processing.short_description = "Mark selected orders as processing"

    def mark_as_shipped(self, request, queryset):
        queryset.update(status='shipped')
    mark_as_shipped.short_description = "Mark selected orders as shipped"

    def mark_as_delivered(self, request, queryset):
        queryset.update(status='delivered')
    mark_as_delivered.short_description = "Mark selected orders as delivered"
