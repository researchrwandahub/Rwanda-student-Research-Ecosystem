from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


class RMSJWTAuthentication(JWTAuthentication):

    def get_user(self, validated_token):

        user = super().get_user(
            validated_token
        )

        if not user.is_active:

            raise AuthenticationFailed(
                "Your RMSJ account has been suspended."
            )

        if hasattr(user, "account_status"):

            if user.account_status != "active":

                raise AuthenticationFailed(
                    "Your RMSJ account has been suspended."
                )

        return user