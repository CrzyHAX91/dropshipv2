
from django.db import models
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from django.core.validators import MinValueValidator
from decimal import Decimal

def suggest_selling_price(cost_price):
    # Add a 30% markup to the cost price
    return cost_price * Decimal('1.3')

def calculate_profit_margin(cost_price, selling_price):
    if cost_price == 0:
        return 0
    return ((selling_price - cost_price) / cost_price) * 100

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

from django.utils import timezone
from datetime import timedelta

class EmailVerificationToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    @classmethod
    def create_token(cls, user):
        token = get_random_string(64)
        expires_at = timezone.now() + timedelta(hours=24)  # Token expires after 24 hours
        return cls.objects.create(user=user, token=token, expires_at=expires_at)

    def is_valid(self):
        return timezone.now() <= self.expires_at

    def __str__(self):
        return f"Verification token for {self.user.username}"

class Product(models.Model):
    name = models.CharField(max_length=200, db_index=True)
    description = models.TextField()
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    aliexpress_url = models.URLField()

    def save(self, *args, **kwargs):
        if not self.selling_price:
            self.selling_price = suggest_selling_price(self.cost_price)
        super().save(*args, **kwargs)

    @property
    def profit_margin(self):
        return calculate_profit_margin(self.cost_price, self.selling_price)

    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def save(self, *args, **kwargs):
        self.total_price = self.product.selling_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.id} - {self.user.username} - {self.status}"
