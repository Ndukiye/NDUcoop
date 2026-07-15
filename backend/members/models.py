from django.conf import settings
from django.db import models


class Member(models.Model):
    """
    A cooperative member's profile and cached balances.

    Balance fields here are a *cache*, not the source of truth -- the only
    permitted writer is ledger.services.post_entry(), which updates these
    fields and writes an immutable LedgerEntry in the same transaction.
    A nightly reconciliation task (core.tasks) recomputes these from the
    ledger and flags/corrects drift. Total asset is deliberately not stored:
    it's always derived so it can never drift from its own inputs.
    """

    STATUS_ACTIVE = "ACTIVE"
    STATUS_INACTIVE = "INACTIVE"
    STATUS_RETIRED = "RETIRED"
    STATUS_SUSPENDED = "SUSPENDED"
    STATUS_TERMINATED = "TERMINATED"
    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_INACTIVE, "Inactive"),
        (STATUS_RETIRED, "Retired"),
        (STATUS_SUSPENDED, "Suspended"),
        (STATUS_TERMINATED, "Terminated"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="member"
    )
    membership_id = models.CharField(max_length=30, unique=True, db_index=True)
    staff_number = models.CharField(max_length=30, blank=True, default="")
    department_unit = models.CharField(max_length=120, blank=True, default="")
    phone = models.CharField(max_length=30, blank=True, default="")
    bank_name = models.CharField(max_length=120, blank=True, default="")
    bank_account_number = models.CharField(max_length=30, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)

    # Cached balances -- see docstring. Never write these directly outside
    # ledger.services.post_entry().
    shares_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    welfare_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    compulsory_savings_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    deposit_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["status"]),
        ]
        ordering = ["membership_id"]

    def __str__(self):
        return f"{self.membership_id} - {self.user.get_full_name() or self.user.email}"

    @property
    def total_asset(self):
        """Shares + Compulsory Savings + Deposits. Welfare is explicitly excluded."""
        return self.shares_balance + self.compulsory_savings_balance + self.deposit_balance

    @property
    def is_active_member(self):
        return self.status == self.STATUS_ACTIVE
