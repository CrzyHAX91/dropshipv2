from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from django.utils.html import format_html
from admin_tools.dashboard import modules

class QuickLinksWidget(modules.LinkList):
    title = _('Quick Links')

    def __init__(self, **kwargs):
        super(QuickLinksWidget, self).__init__(**kwargs)
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

class RecentOrdersWidget(modules.DashboardModule):
    title = _('Recent Orders')
    template = 'admin/widgets/recent_orders.html'

    def __init__(self, **kwargs):
        super(RecentOrdersWidget, self).__init__(**kwargs)
        self.limit = 5

    def init_with_context(self, context):
        from .models import Order
        self.children = Order.objects.order_by('-created_at')[:self.limit]

class SalesStatisticsWidget(modules.DashboardModule):
    title = _('Sales Statistics')
    template = 'admin/widgets/sales_statistics.html'

    def init_with_context(self, context):
        from .models import Order
        from django.db.models import Sum
        from django.utils import timezone

        today = timezone.now().date()
        this_month = today.replace(day=1)

        self.total_sales = Order.objects.aggregate(total=Sum('total_price'))['total'] or 0
        self.today_sales = Order.objects.filter(created_at__date=today).aggregate(total=Sum('total_price'))['total'] or 0
        self.month_sales = Order.objects.filter(created_at__date__gte=this_month).aggregate(total=Sum('total_price'))['total'] or 0

