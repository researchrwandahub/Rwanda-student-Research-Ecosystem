from rest_framework import permissions


class IsAdministratorForDelete(permissions.BasePermission):
    """
    Allows normal access according to the view's existing permissions,
    but requires an administrator for DELETE requests.
    """

    def has_permission(self, request, view):

        # Only apply this restriction to DELETE.
        if request.method != "DELETE":
            return True

        # DELETE is allowed only for authenticated administrators.
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "administrator"
        )