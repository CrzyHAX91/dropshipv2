
from django.core.mail import send_mail
from django.conf import settings

def send_order_confirmation_email(order):
    subject = f'Order Confirmation - Order #{order.id}'
    message = f'''
    Dear {order.user.username},

    Thank you for your order. Your order details are as follows:

    Order ID: {order.id}
    Total Amount: ${order.total_price}
    Status: {order.get_status_display()}

    We will notify you when your order has been shipped.

    Best regards,
    Your Dropshipping Team
    '''
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [order.user.email],
        fail_silently=False,
    )

def send_order_status_update_email(order):
    subject = f'Order Status Update - Order #{order.id}'
    message = f'''
    Dear {order.user.username},

    Your order status has been updated:

    Order ID: {order.id}
    New Status: {order.get_status_display()}

    {
    "Your order has been shipped." if order.status == 'shipped' else
    "Your order is being processed." if order.status == 'processing' else
    "Your order has been delivered." if order.status == 'delivered' else
    "There has been an update to your order."
    }

    Best regards,
    Your Dropshipping Team
    '''
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [order.user.email],
        fail_silently=False,
    )
