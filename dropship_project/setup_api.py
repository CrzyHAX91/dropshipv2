
import os

# Create views.py
views_content = '''
from rest_framework import viewsets
from .models import Product, Order
from .serializers import ProductSerializer, OrderSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
'''

with open('dropship_project/api/views.py', 'w') as f:
    f.write(views_content)

# Create serializers.py
serializers_content = '''
from rest_framework import serializers
from .models import Product, Order

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'
'''

with open('dropship_project/api/serializers.py', 'w') as f:
    f.write(serializers_content)

print("Views and serializers created successfully.")

# Create urls.py for API routing
urls_content = '''
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
'''

with open('dropship_project/api/urls.py', 'w') as f:
    f.write(urls_content)

print("API URLs configuration created successfully.")
