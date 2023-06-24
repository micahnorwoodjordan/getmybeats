import logging

from django.shortcuts import render
from rest_framework.decorators import api_view

from GetMyBeatsApp.db.utilities import get_main_audio_context


logger = logging.getLogger(__name__)


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
    context = get_main_audio_context(request.META['REMOTE_ADDR'])
    return render(request, 'home.html', context=context)
