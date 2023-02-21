from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import AudioSerializer
from .models import Audio

@api_view(['GET'])
def home(request):
    serialized_instances = AudioSerializer(Audio.objects.all(), many=True).data
    context = {'audio': [dict(i) for i in serialized_instances]}
    return render(request, 'home.html', context=context)  # TODO: create wrapper around Django Response
