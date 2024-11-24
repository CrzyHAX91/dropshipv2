from django.core.management.base import BaseCommand
from dropship_project.models import Product
from django.core.files import File
from django.conf import settings
import os

class Command(BaseCommand):
    help = 'Adds sample products to the database'

    def handle(self, *args, **kwargs):
        products = [
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

        for product_data in products:
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

