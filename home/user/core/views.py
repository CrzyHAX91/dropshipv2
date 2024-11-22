
import logging
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Sum, Count, Q
from django.core.paginator import Paginator
from django.views.generic import TemplateView, FormView, UpdateView
from django.utils.decorators import method_decorator
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.cache import never_cache
from django.contrib.auth.views import LoginView, PasswordResetView
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ratelimit.decorators import ratelimit
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from .models import Product, Order, Cart, CartItem, EmailVerificationToken, User
from .serializers import ProductSerializer, OrderSerializer
from .forms import UserRegistrationForm, UserProfileForm

logger = logging.getLogger(__name__)

@login_required
@method_decorator(ratelimit(key='user', rate='3/h', method=['GET', 'POST']), name='dispatch')
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Important!
            messages.success(request, 'Your password was successfully updated!')
            return redirect('dashboard')
        else:
            messages.error(request, 'Please correct the error below.')
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'change_password.html', {
        'form': form
    })

@ratelimit(key='ip', rate='3/h', method=['GET', 'POST'])
def resend_activation_email(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        try:
            user = User.objects.get(email=email, is_active=False)
            if EmailVerificationToken.objects.filter(user=user).exists():
                token = EmailVerificationToken.objects.get(user=user)
                if not token.is_valid():
                    token.delete()
                    token = EmailVerificationToken.create_token(user)
            else:
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
            messages.success(request, 'Activation email has been resent. Please check your email.')
        except User.DoesNotExist:
            messages.error(request, 'No inactive user found with this email address.')
        return redirect('login')
    return render(request, 'resend_activation_email.html')

class UserProfileView(LoginRequiredMixin, UpdateView):
    form_class = UserProfileForm
    template_name = 'user_profile.html'
    success_url = reverse_lazy('user_profile')

    def get_object(self, queryset=None):
        return self.request.user

    def form_valid(self, form):
        response = super().form_valid(form)
        logger.info(f"User profile updated: {self.request.user.username}")
        messages.success(self.request, 'Your profile has been updated successfully.')
        return response

# Rate-limited login view to prevent brute-force attacks
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

# Rate-limited password reset view to prevent abuse
class RateLimitedPasswordResetView(PasswordResetView):
    @method_decorator(ratelimit(key='ip', rate='3/h', method=['GET', 'POST']))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def form_valid(self, form):
        logger.info(f"Password reset requested for email: {form.cleaned_data['email']}")
        return super().form_valid(form)

# User registration view with rate limiting and CSRF protection
class RegisterView(FormView):
    form_class = UserRegistrationForm
    template_name = 'registration/register.html'
    success_url = reverse_lazy('registration_done')

    @method_decorator(sensitive_post_parameters())
    @method_decorator(csrf_protect)
    @method_decorator(never_cache)
    @method_decorator(ratelimit(key='ip', rate='5/h', method=['GET', 'POST']))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def form_valid(self, form):
        try:
            user = form.save(commit=False)
            password = form.cleaned_data.get('password1')
            validate_password(password, user)
        except ValidationError as e:
            form.add_error('password1', e)
            return self.form_invalid(form)

        user.is_active = False
        user.save()

        try:
            token = EmailVerificationToken.create_token(user)
            current_site = get_current_site(self.request)
            subject = 'Activate Your Account'
            message = render_to_string('emails/account_activation_email.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': token.token,
            })
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
            logger.info(f"New user registered: {user.username}")
        except Exception as e:
            logger.error(f"Failed to create token or send activation email to {user.email}: {str(e)}")
            messages.error(self.request, "Failed to send activation email. Please try again later.")
            user.delete()
            return self.form_invalid(form)

        messages.success(self.request, 'Please check your email to activate your account.')
        return super().form_valid(form)

    def form_invalid(self, form):
        logger.warning(f"Failed registration attempt: {form.errors}")
        return super().form_invalid(form)

class ActivateAccountView(TemplateView):
    template_name = 'registration/activation_invalid.html'

    @method_decorator(ratelimit(key='ip', rate='5/h', method=['GET']))
    def get(self, request, *args, **kwargs):
        try:
            uid = force_str(urlsafe_base64_decode(kwargs['uidb64']))
            user = User.objects.get(pk=uid)
            token_obj = EmailVerificationToken.objects.get(user=user, token=kwargs['token'])
            if token_obj.is_valid():
                user.is_active = True
                user.save()
                token_obj.delete()
                login(request, user)
                logger.info(f"User account activated: {user.username}")
                messages.success(request, "Your account has been successfully activated. Welcome!")
                return redirect('home')
            else:
                logger.warning(f"Expired activation attempt: uidb64={kwargs['uidb64']}, token={kwargs['token']}")
                messages.error(request, "The activation link has expired. Please request a new one.")
        except (TypeError, ValueError, OverflowError, User.DoesNotExist, EmailVerificationToken.DoesNotExist) as e:
            logger.warning(f"Invalid activation attempt: uidb64={kwargs['uidb64']}, token={kwargs['token']}, error={str(e)}")
            messages.error(request, "The activation link is invalid. Please try registering again.")
        return super().get(request, *args, **kwargs)

@method_decorator(ratelimit(key='ip', rate='10/m', method=['GET']), name='dispatch')
def home(request):
    featured_products = Product.objects.all()[:3]  # Get the first 3 products as featured
    return render(request, 'home.html', {'featured_products': featured_products})

@login_required
@method_decorator(ratelimit(key='user', rate='30/m', method=['GET']), name='dispatch')
def dashboard(request):
    user_orders = Order.objects.filter(user=request.user).order_by('-created_at')
    paginator = Paginator(user_orders, 5)  # Show 5 orders per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    total_orders = user_orders.count()
    total_spent = user_orders.aggregate(Sum('total_price'))['total_price__sum'] or 0
    
    product_count = Product.objects.count()
    top_products = Product.objects.annotate(order_count=Count('order')).order_by('-order_count')[:5]

    context = {
        'page_obj': page_obj,
        'total_orders': total_orders,
        'total_spent': total_spent,
        'product_count': product_count,
        'top_products': top_products,
    }
    return render(request, 'dashboard.html', context)

@login_required
@method_decorator(ratelimit(key='user', rate='30/m', method=['GET']), name='dispatch')
def all_orders(request):
    user_orders = Order.objects.filter(user=request.user).order_by('-created_at')
    paginator = Paginator(user_orders, 10)  # Show 10 orders per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
    }
    return render(request, 'all_orders.html', context)

@method_decorator(ratelimit(key='ip', rate='30/m', method=['GET']), name='dispatch')
def browse_products(request):
    query = request.GET.get('q')
    products = Product.objects.all()

    if query:
        products = products.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )

    paginator = Paginator(products, 12)  # Show 12 products per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'query': query,
    }
    return render(request, 'browse_products.html', context)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

@login_required
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_item, item_created = CartItem.objects.get_or_create(cart=cart, product=product)
    
    if not item_created:
        cart_item.quantity += 1
        cart_item.save()

    messages.success(request, f"{product.name} has been added to your cart.")
    return redirect('browse_products')

@login_required
def view_cart(request):
    try:
        cart = Cart.objects.get(user=request.user)
        cart_items = cart.items.all()
    except Cart.DoesNotExist:
        cart_items = []

    total = sum(item.product.selling_price * item.quantity for item in cart_items)

    context = {
        'cart_items': cart_items,
        'total': total,
    }
    return render(request, 'cart.html', context)
