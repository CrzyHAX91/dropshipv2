from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from dropship_project.models import Product, Order, CartItem
from django.core.files import File
from django.conf import settings
import os
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate the database with sample data and add sample products'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating database with users and orders...')
        
        # Create users
        for i in range(5):
            username = f'user{i}'
            email = f'user{i}@example.com'
            password = 'password123'
            try:
                User.objects.create_user(username=username, email=email, password=password)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating user {username}: {e}'))

        # Create products
        products = [
            {'name': 'Laptop', 'description': 'High-performance laptop', 'price': 999.99, 'stock': 50},
            {'name': 'Smartphone', 'description': '5G-enabled smartphone', 'price': 699.99, 'stock': 100},
            {'name': 'Headphones', 'description': 'Noise-cancelling headphones', 'price': 199.99, 'stock': 200},
            {'name': 'Tablet', 'description': '10-inch tablet', 'price': 299.99, 'stock': 75},
            {'name': 'Smartwatch', 'description': 'Fitness tracking smartwatch', 'price': 149.99, 'stock': 150},
        ]

        for product in products:
            try:
                Product.objects.create(**product)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating product {product["name"]}: {e}'))

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

        # Add sample products with images
        self.stdout.write('Adding sample products with images...')
        sample_products = [
            {
                'name': 'Laptop',
                'description': 'High-performance laptop with 16GB RAM and 512GB SSD',
                'price': 999.99,
                'stock': 50,
                'image': 'laptop.jpg'
            },
            {
                'name': 'Smartphone',
                'description': '5G-enabled smartphone with 128GB storage',
                'price': 699.99,
                'stock': 100,
                'image': 'smartphone.jpg'
            },
            {
                'name': 'Wireless Headphones',
                'description': 'Noise-cancelling wireless headphones with 30-hour battery life',
                'price': 199.99,
                'stock': 200,
                'image': 'headphones.jpg'
            }
        ]

        for product_data in sample_products:
            product = Product.objects.create(
                name=product_data['name'],
                description=product_data['description'],
                price=product_data['price'],
                stock=product_data['stock']
            )
            image_path = os.path.join(settings.BASE_DIR, 'sample_images', product_data['image'])
            if os.path.exists(image_path):
                with open(image_path, 'rb') as f:
                    product.image.save(product_data['image'], File(f), save=True)
            self.stdout.write(self.style.SUCCESS(f'Successfully added product: {product.name}'))
