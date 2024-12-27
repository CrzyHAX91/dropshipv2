from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.product_list, name='product_list'),
    path('product/<int:product_id>/', views.product_detail, name='product_detail'),
    path('cart/', views.cart, name='cart'),
    path('add-to-cart/<int:product_id>/', views.add_to_cart, name='add_to_cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('order-confirmation/<int:order_id>/', views.order_confirmation, name='order_confirmation'),
    path('accounts/', include('allauth.urls')),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('sync-products/', views.sync_aliexpress_products, name='sync_products'),
    path('helpdesk/', views.helpdesk, name='helpdesk'),
    path('api/helpdesk/', views.helpdesk_api, name='helpdesk_api'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
</write_to_file>
