from django.urls import path
from .views import (
    ProductListView,
    ProductDetailView,
    add_to_cart,
    cart,
    checkout,
    order_confirmation,
    AdminDashboardView,
    SyncAliexpressProductsView,
    get_product_details_view,
    search_products_view,
)

urlpatterns = [
    path('', ProductListView.as_view(), name='product_list'),
    path('product/<int:product_id>/', ProductDetailView.as_view(), name='product_detail'),
    path('add_to_cart/<int:product_id>/', add_to_cart, name='add_to_cart'),
    path('cart/', cart, name='cart'),
    path('checkout/', checkout, name='checkout'),
    path('order_confirmation/<int:order_id>/', order_confirmation, name='order_confirmation'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('admin/sync_aliexpress/', SyncAliexpressProductsView.as_view(), name='sync_aliexpress'),
    # Removed duplicate path for get_product_details_view
    path('search/', search_products_view, name='search_products'),
]
