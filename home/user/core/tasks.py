
from celery import shared_task
from django.utils import timezone
from .models import Product, Order, User, EmailVerificationToken
import random

@shared_task
def update_product_prices():
    products = Product.objects.all()
    for product in products:
        # Simulate market fluctuations
        change = random.uniform(-0.05, 0.05)  # -5% to +5% change
        product.cost_price *= (1 + change)
        product.selling_price *= (1 + change)
        product.save()

@shared_task
def auto_buy_products():
    users = User.objects.filter(is_active=True)
    products = Product.objects.all()
    
    for user in users:
        if random.random() < 0.1:  # 10% chance of buying
            product = random.choice(products)
            quantity = random.randint(1, 5)
            Order.objects.create(
                user=user,
                product=product,
                quantity=quantity,
                total_price=product.selling_price * quantity,
                status='processing'
            )

@shared_task
def process_orders():
    orders = Order.objects.filter(status='processing')
    for order in orders:
        # Simulate order processing
        if random.random() < 0.8:  # 80% chance of successful processing
            order.status = 'shipped'
        else:
            order.status = 'cancelled'
        order.save()

@shared_task
def clean_expired_tokens():
    EmailVerificationToken.objects.filter(expires_at__lt=timezone.now()).delete()
