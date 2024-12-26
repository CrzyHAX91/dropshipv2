
from django.contrib import admin
from django.utils.html import format_html
from .models import Product, Order

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'cost_price', 'selling_price', 'colored_profit_margin')
    list_filter = ('name',)
    search_fields = ('name', 'description')
    readonly_fields = ('profit_margin',)

    def colored_profit_margin(self, obj):
        margin = obj.profit_margin
        if margin < 10:
            color = 'red'
        elif 10 <= margin < 20:
            color = 'orange'
        else:
            color = 'green'
        return format_html('<span style="color: {};">{:.2f}%</span>', color, margin)
    colored_profit_margin.short_description = 'Profit Margin'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'product', 'quantity', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'product__name')
    readonly_fields = ('total_price',)
    actions = ['mark_as_shipped', 'mark_as_delivered']

    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return self.readonly_fields + ('user', 'product', 'quantity')
        return self.readonly_fields

    @admin.action(description='Mark selected orders as shipped')
    def mark_as_shipped(self, request, queryset):
        updated = queryset.update(status='shipped')
        self.message_user(request, f'{updated} orders were successfully marked as shipped.')

    @admin.action(description='Mark selected orders as delivered')
    def mark_as_delivered(self, request, queryset):
        updated = queryset.update(status='delivered')
        self.message_user(request, f'{updated} orders were successfully marked as delivered.')
