
from django.db import models
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from .utils import calculate_profit_margin, suggest_selling_price

class EmailVerificationToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def create_token(cls, user):
        token = get_random_string(64)
        return cls.objects.create(user=user, token=token)

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    aliexpress_url = models.URLField()

    def save(self, *args, **kwargs):
        if not self.selling_price:
            self.selling_price = suggest_selling_price(self.cost_price)
        super().save(*args, **kwargs)

    @property
    def profit_margin(self):
        return calculate_profit_margin(self.cost_price, self.selling_price)

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending')

    def save(self, *args, **kwargs):
        self.total_price = self.product.selling_price * self.quantity
        super().save(*args, **kwargs)
