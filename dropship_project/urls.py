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

