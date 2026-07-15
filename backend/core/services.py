from django.db import transaction
from django.utils import timezone

from core.exceptions import InvalidStateTransitionError
from core.models import ApprovableMixin


def approve(instance: ApprovableMixin, admin_user, note: str = ""):
    """
    Template method shared by deposits/withdrawals/loans/commodities approval flows.

    Each concrete model supplies its own on_approve() side effects (ledger write,
    stock decrement, disbursement, schedule creation). Callers are responsible for
    audit-logging the outcome (kept out of core to avoid core depending on audit).
    """
    if not instance.is_pending:
        raise InvalidStateTransitionError(f"{instance} is not pending (status={instance.status})")

    with transaction.atomic():
        instance.on_approve(admin_user)
        instance.status = ApprovableMixin.STATUS_APPROVED
        instance.decided_at = timezone.now()
        instance.decided_by = admin_user
        instance.decision_note = note
        instance.save()
    return instance


def reject(instance: ApprovableMixin, admin_user, note: str = ""):
    if not instance.is_pending:
        raise InvalidStateTransitionError(f"{instance} is not pending (status={instance.status})")

    with transaction.atomic():
        instance.on_reject(admin_user)
        instance.status = ApprovableMixin.STATUS_REJECTED
        instance.decided_at = timezone.now()
        instance.decided_by = admin_user
        instance.decision_note = note
        instance.save()
    return instance
