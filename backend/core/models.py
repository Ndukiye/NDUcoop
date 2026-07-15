import uuid

from django.conf import settings
from django.db import models


class UUIDModel(models.Model):
    """Abstract base for tables that should use UUID primary keys (financial records)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class ApprovableMixin(models.Model):
    """
    Shared submit -> pending -> admin approve/reject fields for
    DepositRequest, WithdrawalRequest, Loan, and CommodityApplication.

    Each concrete model still owns its own table and its own on_approve()/
    on_reject() side effects (ledger writes, stock decrements, disbursement,
    schedule creation) -- only the state-transition shape is shared here.
    See core/services.py::decide() for the template-method that drives this.
    """

    STATUS_PENDING = "PENDING"
    STATUS_APPROVED = "APPROVED"
    STATUS_REJECTED = "REJECTED"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    submitted_at = models.DateTimeField(auto_now_add=True)
    decided_at = models.DateTimeField(null=True, blank=True)
    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="+",
    )
    decision_note = models.TextField(blank=True, default="")

    class Meta:
        abstract = True

    @property
    def is_pending(self):
        return self.status == self.STATUS_PENDING

    def on_approve(self, admin_user):
        """Override in each concrete model to perform domain side effects."""
        raise NotImplementedError

    def on_reject(self, admin_user):
        """Override to perform any domain side effects on rejection (usually none)."""
        return None
