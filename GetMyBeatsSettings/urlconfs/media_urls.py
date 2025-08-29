from django.urls import path

from GetMyBeatsApp import views


urlpatterns = [
    path('media/audio/hash/<str:filename_hash>', views.get_encrypted_audio_by_hash),
    path('media/image/hash/<str:filename_hash>', views.get_audio_artwork_by_hash),
    path('media/context/', views.get_site_audio_context),
]
