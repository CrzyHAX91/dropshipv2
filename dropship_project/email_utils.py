
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_order_confirmation_email(order):
    subject = f'Order Confirmation - Order #{order.id}'
    html_message = render_to_string('emails/order_confirmation.html', {'order': order})
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [order.user.email],
        html_message=html_message,
        fail_silently=False,
    )

def send_order_status_update_email(order):
    subject = f'Order Status Update - Order #{order.id}'
    html_message = render_to_string('emails/order_status_update.html', {'order': order})
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [order.user.email],
        html_message=html_message,
        fail_silently=False,
    )
