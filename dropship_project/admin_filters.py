from django.contrib import admin
from django.utils import timezone
from datetime import datetime, timedelta

class DateRangeFilter(admin.SimpleListFilter):
    title = 'Date Range'
    parameter_name = 'date_range'

    def lookups(self, request, model_admin):
        return (
            ('today', 'Today'),
            ('yesterday', 'Yesterday'),
            ('this_week', 'This week'),
            ('last_week', 'Last week'),
            ('this_month', 'This month'),
            ('last_month', 'Last month'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'today':
            return queryset.filter(created_at__date=timezone.now().date())
        if self.value() == 'yesterday':
            return queryset.filter(created_at__date=timezone.now().date() - timedelta(days=1))
        if self.value() == 'this_week':
            return queryset.filter(created_at__date__gte=timezone.now().date() - timedelta(days=7))
        if self.value() == 'last_week':
            start_of_last_week = timezone.now().date() - timedelta(days=14)
            end_of_last_week = timezone.now().date() - timedelta(days=7)
            return queryset.filter(created_at__date__range=[start_of_last_week, end_of_last_week])
        if self.value() == 'this_month':
            return queryset.filter(created_at__date__gte=timezone.now().date().replace(day=1))
        if self.value() == 'last_month':
            last_month = timezone.now().date().replace(day=1) - timedelta(days=1)
            start_of_last_month = last_month.replace(day=1)
            return queryset.filter(created_at__date__range=[start_of_last_month, last_month])

