from django.contrib import admin

from members.models import Member


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ["membership_id", "user", "status", "shares_balance", "deposit_balance"]
    list_filter = ["status"]
    search_fields = ["membership_id", "user__email", "user__first_name", "user__last_name"]
    readonly_fields = [
        "shares_balance",
        "welfare_balance",
        "compulsory_savings_balance",
        "deposit_balance",
    ]
