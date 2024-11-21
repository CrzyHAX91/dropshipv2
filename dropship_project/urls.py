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

