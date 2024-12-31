from django.db import models
from django.contrib.auth.models import AbstractUser
from .aliexpress_integration import place_aliexpress_order

class CustomUser(AbstractUser):
    """Custom user model extending the default AbstractUser."""
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)

class Product(models.Model):
    """Model representing a product in the store."""
    name = models.CharField(max_length=200)
    description = models.TextField()
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)

    def clean(self):
        """Ensure that selling_price is greater than cost_price."""
        if self.selling_price <= self.cost_price:
            raise models.ValidationError("Selling price must be greater than cost price.")
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    aliexpress_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

class CartItem(models.Model):
    """Model representing an item in the shopping cart."""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

class Order(models.Model):
    """Model representing an order placed by a user."""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    items = models.ManyToManyField(CartItem)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

    def process_order(self):
        for item in self.items.all():
            success = place_aliexpress_order(item.product, item.quantity, self.user)
            if not success:
                self.status = 'cancelled'
                self.save()
                return False
        self.status = 'processing'
        self.save()
        return True
</write_to_file>
