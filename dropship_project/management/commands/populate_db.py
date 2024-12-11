from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from dropship_project.models import Product, Order, CartItem
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate the database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating database...')

        # Create users
        for i in range(5):
            username = f'user{i}'
            email = f'user{i}@example.com'
            password = 'password123'
            User.objects.create_user(username=username, email=email, password=password)

        # Create products
        products = [
            {'name': 'Laptop', 'description': 'High-performance laptop', 'price': 999.99, 'stock': 50},
            {'name': 'Smartphone', 'description': '5G-enabled smartphone', 'price': 699.99, 'stock': 100},
            {'name': 'Headphones', 'description': 'Noise-cancelling headphones', 'price': 199.99, 'stock': 200},
            {'name': 'Tablet', 'description': '10-inch tablet', 'price': 299.99, 'stock': 75},
            {'name': 'Smartwatch', 'description': 'Fitness tracking smartwatch', 'price': 149.99, 'stock': 150},
        ]
        for product in products:
            Product.objects.create(**product)

        # Create orders and cart items
        users = User.objects.all()
        products = Product.objects.all()

        for user in users:
            # Create an order
            order = Order.objects.create(user=user, total_price=0)
            total_price = 0

            # Add random products to the order
            for _ in range(random.randint(1, 3)):
                product = random.choice(products)
                quantity = random.randint(1, 3)
                CartItem.objects.create(user=user, product=product, quantity=quantity, order=order)
                total_price += product.price * quantity

            order.total_price = total_price
            order.save()

            # Add random products to the cart
            for _ in range(random.randint(0, 2)):
                product = random.choice(products)
                quantity = random.randint(1, 2)
                CartItem.objects.create(user=user, product=product, quantity=quantity)

        self.stdout.write(self.style.SUCCESS('Database populated successfully!'))
