from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from django.utils.html import format_html
from django.contrib.admin.widgets import AdminDateWidget
from django.forms.widgets import Media, MEDIA_TYPES

class QuickLinksWidget:
    title = _('Quick Links')
    template = 'admin/widgets/quick_links.html'

    def __init__(self):
        self.children = [
            {
                'title': _('Add New Product'),
                'url': reverse('admin:dropship_project_product_add'),
            },
            {
                'title': _('View Recent Orders'),
                'url': reverse('admin:dropship_project_order_changelist') + '?status__exact=pending',
            },
            {
                'title': _('User Statistics'),
                'url': reverse('admin:dropship_project_customuser_changelist'),
            },
        ]

class RecentOrdersWidget:
    title = _('Recent Orders')
    template = 'admin/widgets/recent_orders.html'

    def __init__(self):
        self.limit = 5

    def get_context(self):
        from .models import Order
        return {
            'orders': Order.objects.order_by('-created_at')[:self.limit]
        }

class SalesStatisticsWidget:
    title = _('Sales Statistics')
    template = 'admin/widgets/sales_statistics.html'

    def get_context(self):
        from .models import Order
        from django.db.models import Sum
        from django.utils import timezone

        today = timezone.now().date()
        this_month = today.replace(day=1)

        return {
            'total_sales': Order.objects.aggregate(total=Sum('total_price'))['total'] or 0,
            'today_sales': Order.objects.filter(created_at__date=today).aggregate(total=Sum('total_price'))['total'] or 0,
            'month_sales': Order.objects.filter(created_at__date__gte=this_month).aggregate(total=Sum('total_price'))['total'] or 0,
        }

