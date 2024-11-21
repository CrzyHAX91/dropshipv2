

import csv
from django.contrib import admin
from django.http import HttpResponse
from .models import Category, Product, Order, CartItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'cost_price', 'selling_price', 'profit_margin')
    list_filter = ('category', 'name')
    search_fields = ('name', 'description')

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_price', 'created_at', 'status', 'is_paid')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username',)
    inlines = [CartItemInline]
    actions = ['export_to_csv']

    def is_paid(self, obj):
        return obj.is_paid
    is_paid.boolean = True

    def export_to_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="orders.csv"'
        writer = csv.writer(response)
        writer.writerow(['Order ID', 'User', 'Total Price', 'Created At', 'Status', 'Is Paid'])
        for order in queryset:
            writer.writerow([order.id, order.user.username, order.total_price, order.created_at, order.status, order.is_paid])
        return response
    export_to_csv.short_description = "Export selected orders to CSV"

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'total_price')
    list_filter = ('user', 'product')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'cost_price', 'selling_price', 'profit_margin')
    list_filter = ('category', 'name')
    search_fields = ('name', 'description')

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'total_price')
    list_filter = ('user', 'product')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_price', 'created_at', 'status', 'is_paid')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username',)

    def is_paid(self, obj):
        return obj.is_paid
    is_paid.boolean = True
