import pytest

from accounts.models import User


@pytest.mark.django_db
class TestUserRoles:
    def test_full_admin_roles(self):
        for role in [
            User.ROLE_PRESIDENT,
            User.ROLE_TREASURER,
            User.ROLE_ACCOUNTANT,
            User.ROLE_FINANCIAL_SECRETARY,
        ]:
            user = User.objects.create_user(
                username=role.lower(), email=f"{role.lower()}@example.com", password="x", role=role
            )
            assert user.is_full_admin
            assert not user.is_read_only_admin
            assert user.is_admin_role
            assert not user.is_member_role

    def test_general_secretary_is_read_only(self):
        user = User.objects.create_user(
            username="gs", email="gs@example.com", password="x", role=User.ROLE_GENERAL_SECRETARY
        )
        assert user.is_read_only_admin
        assert not user.is_full_admin
        assert user.is_admin_role

    def test_member_role(self):
        user = User.objects.create_user(
            username="mem", email="mem@example.com", password="x", role=User.ROLE_MEMBER
        )
        assert user.is_member_role
        assert not user.is_admin_role
