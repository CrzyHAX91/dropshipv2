class RateLimitedLoginView(LoginView):
    authentication_form = CustomAuthenticationForm

    @method_decorator(ratelimit(key='ip', rate='5/m', method=['GET', 'POST']))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def form_valid(self, form):
        remember_me = form.cleaned_data.get('remember_me')
        if not remember_me:
            # Set session expiry to 0 seconds. So it will automatically close the session after the browser is closed.
            self.request.session.set_expiry(0)

        logger.info(f"Successful login for user: {form.get_user()}")
        return super().form_valid(form)

    def form_invalid(self, form):
        logger.warning(f"Failed login attempt for username: {form.data.get('username')}")
        return super().form_invalid(form)

class RateLimitedPasswordResetView(PasswordResetView):
    @method_decorator(ratelimit(key='ip', rate='3/h', method=['GET', 'POST']))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def form_valid(self, form):
        logger.info(f"Password reset requested for email: {form.cleaned_data['email']}")
        return super().form_valid(form)

@sensitive_post_parameters()
@csrf_protect
@never_cache
@ratelimit(key='ip', rate='5/h', method=['GET', 'POST'])
def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()
            from .models import EmailVerificationToken
            token = EmailVerificationToken.create_token(user)
            current_site = get_current_site(request)
            subject = 'Activate Your Account'
            message = render_to_string('emails/account_activation_email.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': token.token,
            })
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
            logger.info(f"New user registered: {user.username}")
            return render(request, 'registration/registration_done.html')
        else:
            logger.warning(f"Failed registration attempt: {form.errors}")
    else:
        form = UserRegistrationForm()
    return render(request, 'registration/register.html', {'form': form})

def activate_account(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = CustomUser.objects.get(pk=uid)
        from .models import EmailVerificationToken
        token_obj = EmailVerificationToken.objects.get(user=user, token=token)
    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist, EmailVerificationToken.DoesNotExist):
        user = None
        token_obj = None

    if user is not None and token_obj is not None:
        user.is_active = True
        user.save()
        token_obj.delete()
        login(request, user)
        logger.info(f"User account activated: {user.username}")
        return redirect('home')
    else:
        logger.warning(f"Invalid account activation attempt: {uidb64}")
        return render(request, 'registration/activation_invalid.html')

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
EOF

echo "Updated views.py file"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
python3 /home/user/dropship_project/manage.py check -v 2
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
pip install django-recaptcha
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
grep -A 20 "INSTALLED_APPS = \[" /home/user/dropship_project/settings.py
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
sed -i "s/'captcha',/'django_recaptcha',/" /home/user/dropship_project/settings.py
echo "Updated INSTALLED_APPS in settings.py"
grep -A 20 "INSTALLED_APPS = \[" /home/user/dropship_project/settings.py
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
git status
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
git push origin local_changes
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF >> /home/user/dropship_project/settings.py

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'dropship.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'dropship': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

EOF

echo "Updated logging configuration in settings.py"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/views.py
import logging
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, update_session_auth_hash
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages
from rest_framework import viewsets
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.debug import sensitive_post_parameters
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.views import PasswordResetView, LoginView
from django_ratelimit.decorators import ratelimit

from .models import Product, Order, CustomUser, EmailVerificationToken
from .serializers import ProductSerializer, OrderSerializer
from .forms import UserRegistrationForm, CustomPasswordChangeForm, UserProfileForm, CustomAuthenticationForm

logger = logging.getLogger('dropship')

@login_required
@sensitive_post_parameters()
@csrf_protect
@never_cache
def change_password(request):
    if request.method == 'POST':
        form = CustomPasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            logger.info(f"Password changed successfully for user: {user.username}")
            messages.success(request, 'Your password was successfully updated!')
            return redirect('change_password')
        else:
            logger.warning(f"Failed password change attempt for user: {request.user.username}")
            messages.error(request, 'Please correct the error below.')
    else:
        form = CustomPasswordChangeForm(request.user)
    return render(request, 'change_password.html', {'form': form})

@login_required
def user_profile(request):
    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            logger.info(f"Profile updated for user: {request.user.username}")
            messages.success(request, 'Your profile has been updated successfully.')
            return redirect('user_profile')
        else:
            logger.warning(f"Failed profile update attempt for user: {request.user.username}")
    else:
        form = UserProfileForm(instance=request.user)
    return render(request, 'user_profile.html', {'form': form})

class RateLimitedLoginView(LoginView):
    authentication_form = CustomAuthenticationForm

    @method_decorator(ratelimit(key='ip', rate='5/m', method=['GET', 'POST']))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def form_valid(self, form):
        remember_me = form.cleaned_data.get('remember_me')
        if not remember_me:
            self.request.session.set_expiry(0)
        logger.info(f"Successful login for user: {form.get_user().username}")
        return super().form_valid(form)

    def form_invalid(self, form):
        logger.warning(f"Failed login attempt for username: {form.data.get('username')}")
        return super().form_invalid(form)

class RateLimitedPasswordResetView(PasswordResetView):
    @method_decorator(ratelimit(key='ip', rate='3/h', method=['GET', 'POST']))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def form_valid(self, form):
        logger.info(f"Password reset requested for email: {form.cleaned_data['email']}")
        return super().form_valid(form)

@sensitive_post_parameters()
@csrf_protect
@never_cache
@ratelimit(key='ip', rate='5/h', method=['GET', 'POST'])
def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()
            token = EmailVerificationToken.create_token(user)
            current_site = get_current_site(request)
            subject = 'Activate Your Account'
            message = render_to_string('emails/account_activation_email.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': token.token,
            })
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
            logger.info(f"New user registered: {user.username}")
            return render(request, 'registration/registration_done.html')
        else:
            logger.warning(f"Failed registration attempt: {form.errors}")
    else:
        form = UserRegistrationForm()
    return render(request, 'registration/register.html', {'form': form})

def activate_account(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = CustomUser.objects.get(pk=uid)
        token_obj = EmailVerificationToken.objects.get(user=user, token=token)
    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist, EmailVerificationToken.DoesNotExist):
        user = None
        token_obj = None

    if user is not None and token_obj is not None:
        user.is_active = True
        user.save()
        token_obj.delete()
        login(request, user)
        logger.info(f"User account activated: {user.username}")
        return redirect('home')
    else:
        logger.warning(f"Invalid account activation attempt: {uidb64}")
        return render(request, 'registration/activation_invalid.html')

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

EOF

echo "Updated views.py with logging statements"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/admin.py
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

EOF

echo "Created custom admin.py"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
mkdir -p /home/user/dropship_project/templates/admin
echo "Created admin templates directory"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
pwd
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/templates/admin/dashboard.html
{% extends "admin/base_site.html" %}
{% load i18n static %}

{% block extrastyle %}{{ block.super }}
<style>
    .dashboard-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }
    .dashboard-card {
        flex-basis: calc(50% - 20px);
        margin-bottom: 20px;
        padding: 20px;
        background-color: #f8f9fa;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .dashboard-card h2 {
        margin-top: 0;
        color: #333;
    }
    .metric {
        font-size: 24px;
        font-weight: bold;
        color: #007bff;
    }
    .recent-orders {
        margin-top: 20px;
    }
    .recent-orders table {
        width: 100%;
        border-collapse: collapse;
    }
    .recent-orders th, .recent-orders td {
        padding: 10px;
        border-bottom: 1px solid #ddd;
        text-align: left;
    }
</style>
{% endblock %}

{% block content %}
<div class="dashboard-container">
    <div class="dashboard-card">
        <h2>Total Sales</h2>
        <p class="metric">${{ total_sales|floatformat:2 }}</p>
    </div>
    <div class="dashboard-card">
        <h2>New Users (Last 7 Days)</h2>
        <p class="metric">{{ new_users }}</p>
    </div>
    <div class="dashboard-card">
        <h2>Pending Orders</h2>
        <p class="metric">{{ pending_orders }}</p>
    </div>
    <div class="dashboard-card">
        <h2>Quick Actions</h2>
        <p><a href="{% url 'admin:dropship_project_product_add' %}" class="button">Add New Product</a></p>
        <p><a href="{% url 'admin:dropship_project_order_changelist' %}?status__exact=pending" class="button">View Pending Orders</a></p>
    </div>
</div>

<div class="recent-orders">
    <h2>Recent Orders</h2>
    <table>
        <thead>
            <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            {% for order in recent_orders %}
            <tr>
                <td><a href="{% url 'admin:dropship_project_order_change' order.id %}">{{ order.id }}</a></td>
                <td>{{ order.user.username }}</td>
                <td>${{ order.total_price|floatformat:2 }}</td>
                <td>{{ order.status }}</td>
                <td>{{ order.created_at|date:"Y-m-d H:i" }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
</div>
{% endblock %}
EOF

