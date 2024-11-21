
import logging
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import viewsets
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.debug import sensitive_post_parameters
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.views import LoginView, PasswordResetView
from ratelimit.decorators import ratelimit
from .models import Product, Order, EmailVerificationToken
from .serializers import ProductSerializer, OrderSerializer
from .forms import UserRegistrationForm

logger = logging.getLogger('dropship')

class RateLimitedLoginView(LoginView):
    @method_decorator(ratelimit(key='ip', rate='5/m', method=['GET', 'POST']))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def form_valid(self, form):
        logger.info(f"Successful login for user: {form.get_user()}")
        return super().form_valid(form)

    def form_invalid(self, form):
        logger.warning(f"Failed login attempt for username: {form.data.get('username')}")
        return super().form_invalid(form)

class RateLimitedPasswordResetView(PasswordResetView):
    @method_decorator(ratelimit(key='ip', rate='3/h', method=['GET', 'POST']))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def form_valid(self, form):
        logger.info(f"Password reset requested for email: {form.cleaned_data['email']}")
        return super().form_valid(form)

@sensitive_post_parameters()
@csrf_protect
@never_cache
@ratelimit(key='ip', rate='5/h', method=['GET', 'POST'])
def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()
            token = EmailVerificationToken.create_token(user)
            current_site = get_current_site(request)
            subject = 'Activate Your Account'
            message = render_to_string('emails/account_activation_email.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': token.token,
            })
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
            logger.info(f"New user registered: {user.username}")
            return render(request, 'registration/registration_done.html')
        else:
            logger.warning(f"Failed registration attempt: {form.errors}")
    else:
        form = UserRegistrationForm()
    return render(request, 'registration/register.html', {'form': form})

def activate_account(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        token_obj = EmailVerificationToken.objects.get(user=user, token=token)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist, EmailVerificationToken.DoesNotExist):
        user = None
        token_obj = None

    if user is not None and token_obj is not None:
        user.is_active = True
        user.save()
        token_obj.delete()
        login(request, user)
        logger.info(f"User account activated: {user.username}")
        return redirect('home')
    else:
        logger.warning(f"Invalid account activation attempt: {uidb64}")
        return render(request, 'registration/activation_invalid.html')

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
