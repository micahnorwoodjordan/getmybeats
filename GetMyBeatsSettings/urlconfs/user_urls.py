from django.urls import path

from GetMyBeatsApp import views


urlpatterns = [
    path('user/experience', views.get_user_experience_report),
]
