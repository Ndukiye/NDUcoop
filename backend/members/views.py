from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAnyAdmin, IsFullAdmin, IsMember
from members.models import Member
from members.serializers import (
    MemberOnboardSerializer,
    MemberSerializer,
    UpdateBankDetailsSerializer,
)
from members.services import onboard_member, update_bank_details


class MyProfileView(APIView):
    permission_classes = [IsMember]

    def get(self, request):
        return Response(MemberSerializer(request.user.member).data)


class UpdateMyBankDetailsView(APIView):
    permission_classes = [IsMember]

    def post(self, request):
        serializer = UpdateBankDetailsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member = update_bank_details(request.user.member, **serializer.validated_data)
        return Response(MemberSerializer(member).data)


class AdminMemberListView(ListAPIView):
    permission_classes = [IsAnyAdmin]
    serializer_class = MemberSerializer
    queryset = Member.objects.select_related("user").all()
    filterset_fields = ["status"]
    search_fields = ["membership_id", "user__first_name", "user__last_name", "user__email"]


class AdminMemberDetailView(RetrieveAPIView):
    permission_classes = [IsAnyAdmin]
    serializer_class = MemberSerializer
    queryset = Member.objects.select_related("user").all()
    lookup_field = "pk"


class AdminOnboardMemberView(APIView):
    permission_classes = [IsFullAdmin]

    def post(self, request):
        serializer = MemberOnboardSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member = onboard_member(**serializer.validated_data)
        return Response(MemberSerializer(member).data, status=status.HTTP_201_CREATED)
