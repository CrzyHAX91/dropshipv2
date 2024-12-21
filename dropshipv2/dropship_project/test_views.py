from django.test import TestCase, Client, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model

# Remove AxesBackend from AUTHENTICATION_BACKENDS for testing
TEST_AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

@override_settings(AUTHENTICATION_BACKENDS=TEST_AUTHENTICATION_BACKENDS)
class ViewsTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = get_user_model().objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpassword'
        )

    def test_home_view(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Welcome to Dropship V2')

    def test_dashboard_view(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse('user_dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'User Dashboard')

    def test_profile_view(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse('user_profile'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'User Profile')

    def test_login_required_dashboard(self):
        response = self.client.get(reverse('user_dashboard'))
        self.assertRedirects(response, f'{reverse("account_login")}?next={reverse("user_dashboard")}')

    def test_login_required_profile(self):
        response = self.client.get(reverse('user_profile'))
        self.assertRedirects(response, f'{reverse("account_login")}?next={reverse("user_profile")}')

