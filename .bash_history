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

EOF

echo "Updated admin.py with order statistics view"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << 'EOF' > /home/user/dropship_project/templates/admin/index.html
{% extends "admin/base_site.html" %}
{% load i18n static %}

{% block extrastyle %}
{{ block.super }}
<style>
    .dashboard-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-top: 20px;
    }
    .dashboard-card {
        flex-basis: calc(50% - 20px);
        margin-bottom: 20px;
        padding: 20px;
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .dashboard-card h2 {
        color: #007bff;
        margin-top: 0;
    }
    .dashboard-card p {
        font-size: 24px;
        font-weight: bold;
    }
    .admin-actions {
        margin-top: 20px;
    }
    .admin-actions a {
        display: inline-block;
        margin-right: 10px;
        padding: 10px 15px;
        background-color: #007bff;
        color: #fff;
        text-decoration: none;
        border-radius: 5px;
    }
    .admin-actions a:hover {
        background-color: #0056b3;
    }
</style>
{% endblock %}

{% block content %}
<div id="content-main">
    <h1>{% trans 'Dropship Admin Dashboard' %}</h1>
    <div class="dashboard-container">
        <div class="dashboard-card">
            <h2>{% trans 'Total Users' %}</h2>
            <p>{{ user_count }}</p>
        </div>
        <div class="dashboard-card">
            <h2>{% trans 'Total Products' %}</h2>
            <p>{{ product_count }}</p>
        </div>
        <div class="dashboard-card">
            <h2>{% trans 'Total Orders' %}</h2>
            <p>{{ order_count }}</p>
        </div>
        <div class="dashboard-card">
            <h2>{% trans 'Recent Orders' %}</h2>
            <ul>
                {% for order in recent_orders %}
                    <li>Order #{{ order.id }} - {{ order.user.username }} - ${{ order.total_price }}</li>
                {% endfor %}
            </ul>
        </div>
    </div>
    <div class="admin-actions">
        <a href="{% url 'admin:order_stats' %}">{% trans 'View Order Statistics' %}</a>
    </div>
</div>
{% endblock %}
EOF

echo "Updated admin/index.html template with link to order statistics"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/admin_filters.py
from django.contrib import admin
from django.utils import timezone
from datetime import datetime, timedelta

class DateRangeFilter(admin.SimpleListFilter):
    title = 'Date Range'
    parameter_name = 'date_range'

    def lookups(self, request, model_admin):
        return (
            ('today', 'Today'),
            ('yesterday', 'Yesterday'),
            ('this_week', 'This week'),
            ('last_week', 'Last week'),
            ('this_month', 'This month'),
            ('last_month', 'Last month'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'today':
            return queryset.filter(created_at__date=timezone.now().date())
        if self.value() == 'yesterday':
            return queryset.filter(created_at__date=timezone.now().date() - timedelta(days=1))
        if self.value() == 'this_week':
            return queryset.filter(created_at__date__gte=timezone.now().date() - timedelta(days=7))
        if self.value() == 'last_week':
            start_of_last_week = timezone.now().date() - timedelta(days=14)
            end_of_last_week = timezone.now().date() - timedelta(days=7)
            return queryset.filter(created_at__date__range=[start_of_last_week, end_of_last_week])
        if self.value() == 'this_month':
            return queryset.filter(created_at__date__gte=timezone.now().date().replace(day=1))
        if self.value() == 'last_month':
            last_month = timezone.now().date().replace(day=1) - timedelta(days=1)
            start_of_last_month = last_month.replace(day=1)
            return queryset.filter(created_at__date__range=[start_of_last_month, last_month])

EOF

echo "Created admin_filters.py with DateRangeFilter"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/admin_widgets.py
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from django.utils.html import format_html
from admin_tools.dashboard import modules

class QuickLinksWidget(modules.LinkList):
    title = _('Quick Links')

    def __init__(self, **kwargs):
        super(QuickLinksWidget, self).__init__(**kwargs)
        self.children = [
            {
                'title': _('Add New Product'),
                'url': reverse('admin:dropship_project_product_add'),
            },
            {
                'title': _('View Recent Orders'),
                'url': reverse('admin:dropship_project_order_changelist') + '?status__exact=pending',
            },
            {
                'title': _('User Statistics'),
                'url': reverse('admin:dropship_project_customuser_changelist'),
            },
        ]

class RecentOrdersWidget(modules.DashboardModule):
    title = _('Recent Orders')
    template = 'admin/widgets/recent_orders.html'

    def __init__(self, **kwargs):
        super(RecentOrdersWidget, self).__init__(**kwargs)
        self.limit = 5

    def init_with_context(self, context):
        from .models import Order
        self.children = Order.objects.order_by('-created_at')[:self.limit]

class SalesStatisticsWidget(modules.DashboardModule):
    title = _('Sales Statistics')
    template = 'admin/widgets/sales_statistics.html'

    def init_with_context(self, context):
        from .models import Order
        from django.db.models import Sum
        from django.utils import timezone

        today = timezone.now().date()
        this_month = today.replace(day=1)

        self.total_sales = Order.objects.aggregate(total=Sum('total_price'))['total'] or 0
        self.today_sales = Order.objects.filter(created_at__date=today).aggregate(total=Sum('total_price'))['total'] or 0
        self.month_sales = Order.objects.filter(created_at__date__gte=this_month).aggregate(total=Sum('total_price'))['total'] or 0

EOF

echo "Created admin_widgets.py with custom dashboard widgets"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.db.models import Count, F
from django.utils import timezone
from django.urls import path
from django.shortcuts import render
from .models import CustomUser, Product, Order, CartItem
from .admin_filters import DateRangeFilter
from .admin_widgets import QuickLinksWidget, RecentOrdersWidget, SalesStatisticsWidget
import json

class CustomAdminSite(admin.AdminSite):
    site_header = 'Dropship Admin'
    site_title = 'Dropship Admin Portal'
    index_title = 'Welcome to Dropship Admin Portal'
    login_template = 'admin/login.html'
    index_template = 'admin/dashboard.html'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('order-stats/', self.admin_view(self.order_stats_view), name='order_stats'),
        ]
        return custom_urls + urls

    def index(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['quick_links'] = QuickLinksWidget()
        extra_context['recent_orders'] = RecentOrdersWidget()
        extra_context['sales_statistics'] = SalesStatisticsWidget()
        return super().index(request, extra_context)

    def order_stats_view(self, request):
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
    list_filter = ('status', DateRangeFilter)
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

EOF

echo "Updated admin.py"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/admin_widgets.py
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from django.utils.html import format_html
from django.contrib.admin.widgets import AdminDateWidget
from django.forms.widgets import Media, MEDIA_TYPES

class QuickLinksWidget:
    title = _('Quick Links')
    template = 'admin/widgets/quick_links.html'

    def __init__(self):
        self.children = [
            {
                'title': _('Add New Product'),
                'url': reverse('admin:dropship_project_product_add'),
            },
            {
                'title': _('View Recent Orders'),
                'url': reverse('admin:dropship_project_order_changelist') + '?status__exact=pending',
            },
            {
                'title': _('User Statistics'),
                'url': reverse('admin:dropship_project_customuser_changelist'),
            },
        ]

class RecentOrdersWidget:
    title = _('Recent Orders')
    template = 'admin/widgets/recent_orders.html'

    def __init__(self):
        self.limit = 5

    def get_context(self):
        from .models import Order
        return {
            'orders': Order.objects.order_by('-created_at')[:self.limit]
        }

class SalesStatisticsWidget:
    title = _('Sales Statistics')
    template = 'admin/widgets/sales_statistics.html'

    def get_context(self):
        from .models import Order
        from django.db.models import Sum
        from django.utils import timezone

        today = timezone.now().date()
        this_month = today.replace(day=1)

        return {
            'total_sales': Order.objects.aggregate(total=Sum('total_price'))['total'] or 0,
            'today_sales': Order.objects.filter(created_at__date=today).aggregate(total=Sum('total_price'))['total'] or 0,
            'month_sales': Order.objects.filter(created_at__date__gte=this_month).aggregate(total=Sum('total_price'))['total'] or 0,
        }

EOF

echo "Updated admin_widgets.py"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/templates/admin/dashboard.html
{% extends "admin/base_site.html" %}
{% load i18n static %}

{% block extrastyle %}
{{ block.super }}
<style>
    .dashboard-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }
    .dashboard-widget {
        flex-basis: calc(33% - 20px);
        margin-bottom: 20px;
        padding: 20px;
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .dashboard-widget h2 {
        color: #007bff;
        margin-top: 0;
    }
</style>
{% endblock %}

{% block content %}
<div id="content-main">
    <h1>{% trans 'Dashboard' %}</h1>
    <div class="dashboard-container">
        <div class="dashboard-widget">
            {% include "admin/widgets/quick_links.html" with widget=quick_links %}
        </div>
        <div class="dashboard-widget">
            {% include "admin/widgets/recent_orders.html" with widget=recent_orders %}
        </div>
        <div class="dashboard-widget">
            {% include "admin/widgets/sales_statistics.html" with widget=sales_statistics %}
        </div>
    </div>
</div>
{% endblock %}
EOF

echo "Updated dashboard.html template"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/templates/admin/widgets/quick_links.html
<h2>{{ widget.title }}</h2>
<ul>
    {% for link in widget.children %}
        <li><a href="{{ link.url }}">{{ link.title }}</a></li>
    {% endfor %}
</ul>
EOF

echo "Created quick_links.html template"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
mkdir -p /home/user/dropship_project/templates/admin/widgets
echo "Created directory structure"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
pwd
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/templates/admin/widgets/quick_links.html
<h2>{{ widget.title }}</h2>
<ul>
    {% for link in widget.children %}
        <li><a href="{{ link.url }}">{{ link.title }}</a></li>
    {% endfor %}
</ul>
EOF

echo "Created quick_links.html template"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/templates/admin/widgets/recent_orders.html
<h2>{{ widget.title }}</h2>
<table>
    <thead>
        <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Total Price</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        {% for order in widget.get_context.orders %}
            <tr>
                <td>{{ order.id }}</td>
                <td>{{ order.user.username }}</td>
                <td>${{ order.total_price }}</td>
                <td>{{ order.status }}</td>
            </tr>
        {% endfor %}
    </tbody>
</table>
EOF

