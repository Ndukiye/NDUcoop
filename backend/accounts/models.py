from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user. Login is by email (username kept for Django-admin compatibility
    but not used as the primary login field). No public self-registration in v1 --
    every account is admin-onboarded (see members.services.onboard_member).
    """

    ROLE_PRESIDENT = "PRESIDENT"
    ROLE_TREASURER = "TREASURER"
    ROLE_ACCOUNTANT = "ACCOUNTANT"
    ROLE_FINANCIAL_SECRETARY = "FINANCIAL_SECRETARY"
    ROLE_GENERAL_SECRETARY = "GENERAL_SECRETARY"
    ROLE_MEMBER = "MEMBER"

    ROLE_CHOICES = [
        (ROLE_PRESIDENT, "President"),
        (ROLE_TREASURER, "Treasurer"),
        (ROLE_ACCOUNTANT, "Accountant"),
        (ROLE_FINANCIAL_SECRETARY, "Financial Secretary"),
        (ROLE_GENERAL_SECRETARY, "General Secretary"),
        (ROLE_MEMBER, "Member"),
    ]

    # These four titles are functionally one permission tier (full read/write,
    # all approvals) -- the distinct titles are kept only for audit-log labeling
    # ("approved by Financial Secretary" vs "President"), per the proposal.
    FULL_ADMIN_ROLES = {
        ROLE_PRESIDENT,
        ROLE_TREASURER,
        ROLE_ACCOUNTANT,
        ROLE_FINANCIAL_SECRETARY,
    }
    READ_ONLY_ADMIN_ROLES = {ROLE_GENERAL_SECRETARY}
    ADMIN_ROLES = FULL_ADMIN_ROLES | READ_ONLY_ADMIN_ROLES

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default=ROLE_MEMBER)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    @property
    def is_full_admin(self):
        return self.role in self.FULL_ADMIN_ROLES

    @property
    def is_read_only_admin(self):
        return self.role in self.READ_ONLY_ADMIN_ROLES

    @property
    def is_admin_role(self):
        return self.role in self.ADMIN_ROLES

    @property
    def is_member_role(self):
        return self.role == self.ROLE_MEMBER

    def __str__(self):
        return f"{self.get_full_name() or self.email} ({self.get_role_display()})"
