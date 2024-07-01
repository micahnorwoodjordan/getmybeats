"""getmybeats URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from GetMyBeatsApp import views

urlpatterns = [
    path('', views.public_landing_page),
]

player_patterns = [
    path('player/', views.player_public_access),
    path('player/internal/<str:access_key>/<str:access_secret>', views.player_private_access),
]

internal_patterns = [
    path('internal/sys/admin/', admin.site.urls),
]

v2_api_patterns = [
    path('api/v2/health-check/', views.health_check, name='health_check'),
    path('api/v2/audio-filenames/', views.audio_filenames),
    path('api/v2/releases/<str:release_id>/', views.get_release)
]

urlpatterns += player_patterns
urlpatterns += internal_patterns
urlpatterns += v2_api_patterns
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

handler404 = 'GetMyBeatsApp.views.handler404'
handler500 = 'GetMyBeatsApp.views.handler500'
