
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import Product, Order, EmailVerificationToken
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class ViewTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='testpass123')
        self.product = Product.objects.create(name='Test Product', description='Test Description', cost_price=10, selling_price=20)

    def test_home_view(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'home.html')

    def test_dashboard_view(self):
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'dashboard.html')

    def test_register_view(self):
        response = self.client.post(reverse('register'), {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'newpassword123',
            'password2': 'newpassword123',
        })
        self.assertEqual(response.status_code, 302)  # Redirect after successful registration
        self.assertEqual(User.objects.count(), 2)
        self.assertFalse(User.objects.get(username='newuser').is_active)  # User should be inactive until email verification

    def test_activate_account_view(self):
        user = User.objects.create_user(username='inactiveuser', email='inactive@example.com', password='testpass123')
        user.is_active = False
        user.save()
        token = EmailVerificationToken.create_token(user)
        response = self.client.get(reverse('activate_account', kwargs={'uidb64': token.user.pk, 'token': token.token}))
        self.assertEqual(response.status_code, 302)  # Redirect after successful activation
        user.refresh_from_db()
        self.assertTrue(user.is_active)

    def test_browse_products_view(self):
        response = self.client.get(reverse('browse_products'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'browse_products.html')
        self.assertContains(response, self.product.name)

    def test_all_orders_view(self):
        self.client.login(username='testuser', password='testpass123')
        Order.objects.create(user=self.user, product=self.product, quantity=1, total_price=20, status='processing')
        response = self.client.get(reverse('all_orders'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'all_orders.html')
        self.assertContains(response, self.product.name)

    def test_expired_token_cleanup(self):
        user = User.objects.create_user(username='expireduser', email='expired@example.com', password='testpass123')
        token = EmailVerificationToken.create_token(user)
        token.expires_at = timezone.now() - timedelta(hours=1)
        token.save()
        
        from .tasks import clean_expired_tokens
        clean_expired_tokens()
        
        self.assertFalse(EmailVerificationToken.objects.filter(user=user).exists())
