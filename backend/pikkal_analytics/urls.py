from django.contrib import admin
from django.urls import path, include
from django.conf.urls import url
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from core.views import MyTokenObtainPairView, CurrentUserView
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.core import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls
from django.conf import settings
from django.conf.urls.static import static
from blog.api import api_router

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from core.views import PasswordTokenCheckAPI, RequestPasswordResetEmail, SetNewPasswordAPIView
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope

schema_view = get_schema_view(
   openapi.Info(
      title="Snippets API",
      default_version='v1',
      description="Test description",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@snippets.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', include('smuggler.urls')),  # before admin url patterns!
    path('admin/', admin.site.urls),
    path('podminer/', include('podminer.urls')),
    path('auth/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/current/', CurrentUserView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/reset-password', RequestPasswordResetEmail.as_view(),
         name="request-reset-email"),
    path('auth/reset-password/validate/<uidb64>/<token>/',
         PasswordTokenCheckAPI.as_view(), name='password-reset-confirm'),
    path('auth/reset-password/confirm', SetNewPasswordAPIView.as_view(),
         name='password-reset-complete'),
    path('signin/',include('core.urls')),
    path('', include('core.urls')),
    path("o/", include('oauth2_provider.urls', namespace='oauth2_provider')),
    url(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    url(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    url(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    path('blog/', include(wagtailadmin_urls)),
    path('documents/', include(wagtaildocs_urls)),
    path('pages/', include(wagtail_urls)),
    path('api/v2/', api_router.urls),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
