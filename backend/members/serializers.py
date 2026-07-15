from rest_framework import serializers

from accounts.models import User
from members.models import Member


class MemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    total_asset = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = Member
        fields = [
            "id",
            "membership_id",
            "email",
            "first_name",
            "last_name",
            "staff_number",
            "department_unit",
            "phone",
            "bank_name",
            "bank_account_number",
            "status",
            "shares_balance",
            "welfare_balance",
            "compulsory_savings_balance",
            "deposit_balance",
            "total_asset",
        ]
        read_only_fields = [
            "id",
            "membership_id",
            "status",
            "shares_balance",
            "welfare_balance",
            "compulsory_savings_balance",
            "deposit_balance",
            "total_asset",
        ]


class MemberOnboardSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    membership_id = serializers.CharField(max_length=30)
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default=User.ROLE_MEMBER)
    staff_number = serializers.CharField(max_length=30, required=False, allow_blank=True)
    department_unit = serializers.CharField(max_length=120, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    bank_name = serializers.CharField(max_length=120, required=False, allow_blank=True)
    bank_account_number = serializers.CharField(max_length=30, required=False, allow_blank=True)

    def validate_membership_id(self, value):
        if Member.objects.filter(membership_id=value).exists():
            raise serializers.ValidationError("A member with this membership ID already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class UpdateBankDetailsSerializer(serializers.Serializer):
    bank_name = serializers.CharField(max_length=120)
    bank_account_number = serializers.CharField(max_length=30)
