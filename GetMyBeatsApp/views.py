from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.template import RequestContext

from .serializers import AudioSerializer
from .models import Audio
from .services.s3_service import S3AudioService


def handler404(request, exception, template_name="404.html"):
    context = {}
    response = render(request, template_name, context=context)
    response.status_code = 404
    return response


def handler500(request, template_name="500.html"):
    context = {}
    response = render(request, template_name, context=context)
    response.status_code = 500
    return response


@api_view(['GET'])
def home(request):
    serialized_instances = AudioSerializer(Audio.objects.all(), many=True).data
    context = {'audio': [dict(i) for i in serialized_instances]}
    return render(request, 'home.html', context=context)  # TODO: create wrapper around Django Response
