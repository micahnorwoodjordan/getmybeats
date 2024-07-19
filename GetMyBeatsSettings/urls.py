from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from GetMyBeatsApp import views
from GetMyBeatsSettings.user.user_urls import urlpatterns as user_url_patterns


urlpatterns = [
    path('admin/', admin.site.urls),
    path('home/', views.home, name='home'),
    path('', views.home, name='home'),
    path('health-check', views.health_check, name='health_check'),
    path('audio-filenames', views.audio_filenames),
    path('media/hash/<str:filename_hash>', views.get_audio_by_hash),
    path('media/context/', views.get_site_audio_context),
    path('releases/<str:release_id>/', views.get_release),
]

urlpatterns += user_url_patterns

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

handler404 = 'GetMyBeatsApp.views.handler404'
handler500 = 'GetMyBeatsApp.views.handler500'
