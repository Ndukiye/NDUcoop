from django.urls import path

from members import views

app_name = "members"

urlpatterns = [
    path("me/", views.MyProfileView.as_view(), name="my-profile"),
    path("me/bank-details/", views.UpdateMyBankDetailsView.as_view(), name="my-bank-details"),
    path("admin/", views.AdminMemberListView.as_view(), name="admin-list"),
    path("admin/onboard/", views.AdminOnboardMemberView.as_view(), name="admin-onboard"),
    path("admin/<int:pk>/", views.AdminMemberDetailView.as_view(), name="admin-detail"),
]
