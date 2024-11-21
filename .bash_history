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

echo "Created recent_orders.html template"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << 'EOF' > /home/user/dropship_project/templates/admin/widgets/sales_statistics.html
<h2>{{ widget.title }}</h2>
<ul>
    <li>Total Sales: ${{ widget.get_context.total_sales|floatformat:2 }}</li>
    <li>Today's Sales: ${{ widget.get_context.today_sales|floatformat:2 }}</li>
    <li>This Month's Sales: ${{ widget.get_context.month_sales|floatformat:2 }}</li>
</ul>
EOF

echo "Created sales_statistics.html template"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF >> /home/user/dropship_project/settings.py

# Custom admin settings
TEMPLATES[0]['DIRS'] += [BASE_DIR / 'templates']

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / "static",
]
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Admin site configuration
ADMIN_SITE_HEADER = "Dropship Admin"
ADMIN_SITE_TITLE = "Dropship Admin Portal"
ADMIN_INDEX_TITLE = "Welcome to Dropship Admin Portal"

EOF

echo "Updated settings.py with custom admin and static file configurations"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
echo "Contents of dashboard.html:"
cat /home/user/dropship_project/templates/admin/dashboard.html
echo -e "\nContents of quick_links.html:"
cat /home/user/dropship_project/templates/admin/widgets/quick_links.html
echo -e "\nContents of recent_orders.html:"
cat /home/user/dropship_project/templates/admin/widgets/recent_orders.html
echo -e "\nContents of sales_statistics.html:"
cat /home/user/dropship_project/templates/admin/widgets/sales_statistics.html
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
echo "Contents of dashboard.html:"
cat /home/user/dropship_project/templates/admin/dashboard.html
echo -e "\nContents of quick_links.html:"
cat /home/user/dropship_project/templates/admin/widgets/quick_links.html
echo -e "\nContents of recent_orders.html:"
cat /home/user/dropship_project/templates/admin/widgets/recent_orders.html
echo -e "\nContents of sales_statistics.html:"
cat /home/user/dropship_project/templates/admin/widgets/sales_statistics.html
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << 'EOF' > /home/user/dropship_project/templates/admin/widgets/recent_orders.html
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

echo "Created recent_orders.html template"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
git commit -m "Implemented custom admin dashboard with widgets and improved UI"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
git push origin local_changes
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
git push origin local_changes
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF >> /home/user/dropship_project/views.py

from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import Order, CartItem

@login_required
def user_dashboard(request):
    user = request.user
    recent_orders = Order.objects.filter(user=user).order_by('-created_at')[:5]
    cart_items = CartItem.objects.filter(user=user)
    
    context = {
        'user': user,
        'recent_orders': recent_orders,
        'cart_items': cart_items,
    }
    return render(request, 'user_dashboard.html', context)

EOF

echo "Added user_dashboard view to views.py"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF >> /home/user/dropship_project/views.py

from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import Order, CartItem

@login_required
def user_dashboard(request):
    user = request.user
    recent_orders = Order.objects.filter(user=user).order_by('-created_at')[:5]
    cart_items = CartItem.objects.filter(user=user)
    
    context = {
        'user': user,
        'recent_orders': recent_orders,
        'cart_items': cart_items,
    }
    return render(request, 'user_dashboard.html', context)

EOF

echo "Added user_dashboard view to views.py"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/urls.py
from django.urls import path, include
from django.contrib.auth import views as auth_views
from rest_framework.routers import DefaultRouter
from two_factor.urls import urlpatterns as tf_urls
from .views import ProductViewSet, OrderViewSet, register, activate_account, RateLimitedPasswordResetView, user_profile, user_dashboard
from .admin import admin_site

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('admin/', admin_site.urls),
    path('', include(router.urls)),
    path('', include(tf_urls)),
    path('register/', register, name='register'),
    path('activate/<str:uidb64>/<str:token>/', activate_account, name='activate_account'),
    path('password_reset/', RateLimitedPasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path('profile/', user_profile, name='user_profile'),
    path('dashboard/', user_dashboard, name='user_dashboard'),
    path('accounts/', include('allauth.urls')),
]
EOF

echo "Updated urls.py with user dashboard URL"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/templates/user_dashboard.html
{% extends "base.html" %}
{% load static %}

{% block content %}
<div class="container mt-4">
    <h1>Welcome, {{ user.username }}!</h1>
    
    <div class="row mt-4">
        <div class="col-md-6">
            <h2>Recent Orders</h2>
            {% if recent_orders %}
                <ul class="list-group">
                {% for order in recent_orders %}
                    <li class="list-group-item">
                        Order #{{ order.id }} - ${{ order.total_price }} - {{ order.status }}
                    </li>
                {% endfor %}
                </ul>
            {% else %}
                <p>You haven't placed any orders yet.</p>
            {% endif %}
        </div>
        
        <div class="col-md-6">
            <h2>Cart Items</h2>
            {% if cart_items %}
                <ul class="list-group">
                {% for item in cart_items %}
                    <li class="list-group-item">
                        {{ item.product.name }} - Quantity: {{ item.quantity }}
                    </li>
                {% endfor %}
                </ul>
            {% else %}
                <p>Your cart is empty.</p>
            {% endif %}
        </div>
    </div>
</div>
{% endblock %}
EOF

