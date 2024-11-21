import logging
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages
from rest_framework import viewsets
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.debug import sensitive_post_parameters
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.views import PasswordResetView, LoginView
from django_ratelimit.decorators import ratelimit
from two_factor.utils import default_device

from .models import Product, Order, CustomUser, EmailVerificationToken
from .serializers import ProductSerializer, OrderSerializer
from .forms import UserRegistrationForm, CustomPasswordChangeForm, UserProfileForm, CustomAuthenticationForm

logger = logging.getLogger('dropship')

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
        user = CustomUser.objects.get(pk=uid)
        token_obj = EmailVerificationToken.objects.get(user=user, token=token)
    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist, EmailVerificationToken.DoesNotExist):
        user = None
        token_obj = None

    if user is not None and token_obj is not None:
        user.is_active = True
        user.save()
        token_obj.delete()
        login(request, user)
        logger.info(f"User account activated: {user.username}")
        return redirect('two_factor:setup')
    else:
        logger.warning(f"Invalid account activation attempt: {uidb64}")
        return render(request, 'registration/activation_invalid.html')

@login_required
def user_profile(request):
    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            logger.info(f"User profile updated: {request.user.username}")
            messages.success(request, 'Your profile has been updated successfully.')
            return redirect('user_profile')
        else:
            logger.warning(f"Failed profile update attempt for user: {request.user.username}")
    else:
        form = UserProfileForm(instance=request.user)
    
    default_device_obj = default_device(request.user)
    return render(request, 'user_profile.html', {
        'form': form,
        'default_device': default_device_obj,
    })

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


from two_factor.views import LoginView

class CustomLoginView(LoginView):
    template_name = 'two_factor/core/login.html'


from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import Order, CartItem

@login_required
def user_dashboard(request):
    user = request.user
    recent_orders = Order.objects.filter(user=user).order_by('-created_at')[:5]
    cart_items = CartItem.objects.filter(user=user)
    
    context = {
        'user': user,
        'recent_orders': recent_orders,
        'cart_items': cart_items,
    }
    return render(request, 'user_dashboard.html', context)

