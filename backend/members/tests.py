from decimal import Decimal

import pytest

from members.services import onboard_member, update_bank_details


@pytest.mark.django_db
class TestOnboardMember:
    def test_creates_linked_user_and_member(self):
        member = onboard_member(
            email="jane@example.com",
            first_name="Jane",
            last_name="Doe",
            membership_id="NDU-0042",
            password="Passw0rd!23",
        )
        assert member.user.email == "jane@example.com"
        assert member.membership_id == "NDU-0042"
        assert member.status == member.STATUS_ACTIVE

    def test_total_asset_excludes_welfare(self):
        member = onboard_member(
            email="john@example.com",
            first_name="John",
            last_name="Smith",
            membership_id="NDU-0043",
            password="Passw0rd!23",
        )
        member.shares_balance = Decimal("70000")
        member.welfare_balance = Decimal("2000")
        member.compulsory_savings_balance = Decimal("30000")
        member.deposit_balance = Decimal("15000")
        member.save()
        member.refresh_from_db()
        assert member.total_asset == Decimal("115000")


@pytest.mark.django_db
def test_update_bank_details():
    member = onboard_member(
        email="amy@example.com",
        first_name="Amy",
        last_name="Bello",
        membership_id="NDU-0044",
        password="Passw0rd!23",
    )
    update_bank_details(member, bank_name="GTBank", bank_account_number="0123456789")
    member.refresh_from_db()
    assert member.bank_name == "GTBank"
    assert member.bank_account_number == "0123456789"
