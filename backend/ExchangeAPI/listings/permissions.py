from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsOwnerOrAdminOrReadOnly(BasePermission):
    def has_object_permission(self, request, _view, obj):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_staff or obj.user_id == request.user.id
