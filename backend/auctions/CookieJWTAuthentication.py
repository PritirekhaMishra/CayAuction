from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User

class CookieJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get("access_token")

        if not token:
            return None

        try:
            access_token = AccessToken(token)
            user_id = access_token.get('user_id')

            user = User.objects.filter(id=user_id).first()

            if not user:
                return None   # ✅ prevent crash

            return (user, None)

        except Exception:
            return None   # ✅ safe fallback