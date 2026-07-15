from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsFullAdmin(BasePermission):
    """President/Treasurer/Accountant/Financial Secretary -- full read/write."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_full_admin)


class IsReadOnlyAdmin(BasePermission):
    """General Secretary -- view everything, write nothing."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated and user.is_read_only_admin):
            return False
        return request.method in SAFE_METHODS


class IsAnyAdmin(BasePermission):
    """Full admin for writes; any admin (incl. read-only) for safe methods."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated and user.is_admin_role):
            return False
        if request.method in SAFE_METHODS:
            return True
        return user.is_full_admin


class IsMember(BasePermission):
    """Member-facing endpoints -- must have a linked Member profile."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_member_role
            and hasattr(user, "member")
        )
