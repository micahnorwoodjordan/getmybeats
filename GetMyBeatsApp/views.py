import logging

from django.shortcuts import render
from rest_framework.decorators import api_view
from django.conf import settings


logger = logging.getLogger(__name__)


from GetMyBeatsApp.db.utilities import get_main_audio_context


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
    context = get_main_audio_context()
    return render(request, 'home-react.html', context=context)
