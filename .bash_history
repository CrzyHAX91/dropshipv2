pip install django-password-validation
echo "Installed django-password-validation"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import CustomUser

class UserRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password1', 'password2')

    def clean_password1(self):
        password1 = self.cleaned_data.get('password1')
        try:
            validate_password(password1, self.instance)
        except ValidationError as error:
            self.add_error('password1', error)
        return password1

class CustomAuthenticationForm(AuthenticationForm):
    remember_me = forms.BooleanField(required=False, initial=False)

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'first_name', 'last_name')

    def clean_email(self):
        email = self.cleaned_data['email']
        if CustomUser.objects.filter(email=email).exclude(pk=self.instance.pk).exists():
            raise forms.ValidationError('This email address is already in use.')
        return email

EOF

echo "Updated forms.py with password validation in UserRegistrationForm"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/templates/registration/register.html
{% extends "base.html" %}
{% load i18n %}

{% block content %}
<h2>{% trans "Register" %}</h2>
<form method="post">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit">{% trans "Register" %}</button>
</form>

<div class="password-requirements mt-3">
    <h4>{% trans "Password Requirements:" %}</h4>
    <ul>
        <li>{% trans "Minimum length: 10 characters" %}</li>
        <li>{% trans "At least 5 unique characters" %}</li>
        <li>{% trans "At least 1 lowercase letter" %}</li>
        <li>{% trans "At least 1 uppercase letter" %}</li>
        <li>{% trans "At least 1 number" %}</li>
        <li>{% trans "At least 1 special character" %}</li>
    </ul>
</div>

<p>{% trans "Already have an account?" %} <a href="{% url 'account_login' %}">{% trans "Log in" %}</a></p>
{% endblock %}
EOF

echo "Created/Updated registration template with password requirements"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/templates/base.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Dropship V2{% endblock %}</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <style>
        #password-strength-meter {
            height: 5px;
            width: 0;
            transition: width 0.3s, background-color 0.3s;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="/">Dropship V2</a>
        <div class="navbar-nav ml-auto">
            {% if user.is_authenticated %}
                <a class="nav-item nav-link" href="{% url 'user_profile' %}">Profile</a>
                <a class="nav-item nav-link" href="{% url 'account_logout' %}">Logout</a>
            {% else %}
                <a class="nav-item nav-link" href="{% url 'account_login' %}">Login</a>
                <a class="nav-item nav-link" href="{% url 'account_signup' %}">Register</a>
            {% endif %}
        </div>
    </nav>
    <div class="container mt-4">
        {% block content %}
        {% endblock %}
    </div>
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.3/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script src="/static/js/password_strength.js"></script>
</body>
</html>
EOF

echo "Updated base.html with password strength meter styles and JavaScript"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF >> /home/user/dropship_project/settings.py

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / "static",
]
STATIC_ROOT = BASE_DIR / 'staticfiles'

EOF

echo "Updated settings.py with static files configuration"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
pip install sendgrid
echo "Installed SendGrid library"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF >> /home/user/dropship_project/settings.py

# Email configuration
EMAIL_BACKEND = 'sendgrid_backend.SendgridBackend'
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
DEFAULT_FROM_EMAIL = 'noreply@yourdomain.com'  # Replace with your domain
SENDGRID_SANDBOX_MODE_IN_DEBUG = True

EOF

echo "Updated settings.py with SendGrid configuration"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF >> /home/user/dropship_project/settings.py

# django-allauth configuration
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

INSTALLED_APPS += [
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.facebook',
]

SITE_ID = 1

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    },
    'facebook': {
        'METHOD': 'oauth2',
        'SCOPE': ['email', 'public_profile'],
        'AUTH_PARAMS': {'auth_type': 'reauthenticate'},
        'INIT_PARAMS': {'cookie': True},
        'FIELDS': [
            'id',
            'email',
            'name',
            'first_name',
            'last_name',
            'verified',
            'locale',
            'timezone',
            'link',
            'gender',
            'updated_time',
        ],
        'EXCHANGE_TOKEN': True,
        'LOCALE_FUNC': lambda request: 'en_US',
        'VERIFIED_EMAIL': False,
        'VERSION': 'v7.0',
    }
}

ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'

EOF

echo "Updated settings.py with django-allauth configuration"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/urls.py
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from .views import CustomLoginView, register, activate_account, user_profile

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('accounts/', include('allauth.urls')),
    path('login/', CustomLoginView.as_view(), name='account_login'),
    path('register/', register, name='account_signup'),
    path('activate/<str:uidb64>/<str:token>/', activate_account, name='activate_account'),
    path('profile/', user_profile, name='user_profile'),
]

EOF

echo "Updated urls.py with allauth URLs"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
mkdir -p /home/user/dropship_project/templates/admin
echo "Created custom admin templates directory"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
pwd
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/templates/admin/login.html
{% extends "admin/base_site.html" %}
{% load i18n static %}

{% block extrastyle %}
{{ block.super }}
<style>
    body {
        background-color: #f8f9fa;
    }
    #login-form {
        max-width: 400px;
        margin: 100px auto;
        padding: 30px;
        background-color: #ffffff;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .login-header {
        text-align: center;
        margin-bottom: 30px;
    }
    .login-header h1 {
        color: #007bff;
    }
    .form-row {
        margin-bottom: 20px;
    }
    .submit-row {
        text-align: center;
    }
    .submit-row input {
        width: 100%;
        padding: 10px;
        background-color: #007bff;
        color: #ffffff;
        border: none;
        border-radius: 3px;
        cursor: pointer;
    }
    .submit-row input:hover {
        background-color: #0056b3;
    }
</style>
{% endblock %}

{% block content %}
<div id="login-form">
    <div class="login-header">
        <h1>{% trans 'Dropship Admin' %}</h1>
    </div>
    {% if form.errors and not form.non_field_errors %}
    <p class="errornote">
        {% blocktrans count counter=form.errors.items|length %}Please correct the error below.{% plural %}Please correct the errors below.{% endblocktrans %}
    </p>
    {% endif %}

    {% if form.non_field_errors %}
    {% for error in form.non_field_errors %}
    <p class="errornote">
        {{ error }}
    </p>
    {% endfor %}
    {% endif %}

    <form action="{{ app_path }}" method="post" id="login-form">{% csrf_token %}
        <div class="form-row">
            {{ form.username.errors }}
            {{ form.username.label_tag }} {{ form.username }}
        </div>
        <div class="form-row">
            {{ form.password.errors }}
            {{ form.password.label_tag }} {{ form.password }}
            <input type="hidden" name="next" value="{{ next }}" />
        </div>
        {% url 'admin_password_reset' as password_reset_url %}
        {% if password_reset_url %}
        <div class="password-reset-link">
            <a href="{{ password_reset_url }}">{% trans 'Forgotten your password or username?' %}</a>
        </div>
        {% endif %}
        <div class="submit-row">
            <input type="submit" value="{% trans 'Log in' %}">
        </div>
    </form>
</div>
{% endblock %}
EOF

echo "Created custom admin login template"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Product, Order, CartItem

class CustomAdminSite(admin.AdminSite):
    site_header = 'Dropship Admin'
    site_title = 'Dropship Admin Portal'
    index_title = 'Welcome to Dropship Admin Portal'
    login_template = 'admin/login.html'

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

@admin.register(CartItem, site=admin_site)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity')
    list_filter = ('user', 'product')

EOF

echo "Updated admin.py with custom AdminSite class"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/urls.py
from django.urls import path, include
from django.contrib.auth import views as auth_views
from rest_framework.routers import DefaultRouter
from two_factor.urls import urlpatterns as tf_urls
from .views import ProductViewSet, OrderViewSet, register, activate_account, RateLimitedPasswordResetView, user_profile, CustomLoginView
from .admin import admin_site

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('', include(tf_urls)),
    path('admin/', admin_site.urls),
    path('', include(router.urls)),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('register/', register, name='register'),
    path('activate/<str:uidb64>/<str:token>/', activate_account, name='activate_account'),
    path('password_reset/', RateLimitedPasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path('profile/', user_profile, name='user_profile'),
    path('accounts/', include('allauth.urls')),
]

EOF

echo "Updated urls.py to use custom admin site"
{ echo $?; } 2>/dev/null
import os
os.environ["JUPYTER_PWD"] = "/home/user/"
{ echo $?; } 2>/dev/null
cat << EOF > /home/user/dropship_project/templates/admin/index.html
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
</div>
{% endblock %}
EOF

