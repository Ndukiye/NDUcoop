from django.db import transaction

from accounts.models import User
from members.models import Member


@transaction.atomic
def onboard_member(
    *,
    email: str,
    first_name: str,
    last_name: str,
    membership_id: str,
    password: str,
    role: str = User.ROLE_MEMBER,
    staff_number: str = "",
    department_unit: str = "",
    phone: str = "",
    bank_name: str = "",
    bank_account_number: str = "",
) -> Member:
    """
    Admin-led onboarding: creates the User + Member profile together.
    There is no public self-registration in v1 -- only an authorized admin
    calls this (see members.permissions / views for the access check).
    """
    user = User.objects.create_user(
        username=membership_id,
        email=email,
        first_name=first_name,
        last_name=last_name,
        password=password,
        role=role,
    )
    return Member.objects.create(
        user=user,
        membership_id=membership_id,
        staff_number=staff_number,
        department_unit=department_unit,
        phone=phone,
        bank_name=bank_name,
        bank_account_number=bank_account_number,
    )


def update_bank_details(member: Member, *, bank_name: str, bank_account_number: str) -> Member:
    """Members can edit their own bank account details per the proposal."""
    member.bank_name = bank_name
    member.bank_account_number = bank_account_number
    member.save(update_fields=["bank_name", "bank_account_number", "updated_at"])
    return member


def set_status(member: Member, *, status: str) -> Member:
    """Tag a member inactive/retired/suspended/terminated -- never delete the record."""
    member.status = status
    member.save(update_fields=["status", "updated_at"])
    return member
