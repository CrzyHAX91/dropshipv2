from django.urls import path
from .views import post_product, product_detail, cart, checkout

urlpatterns = [
    path('post_product/', post_product, name='post_product'),
    path('product/<int:product_id>/', product_detail, name='product_detail'),
    path('cart/', cart, name='cart'),
    path('checkout/', checkout, name='checkout'),
]
