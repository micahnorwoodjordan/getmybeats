import json
import logging

from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import HttpResponse

from GetMyBeatsApp.data_access.utilities import get_main_audio_context, get_audio_filenames, record_request_information


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
def health_check(request):
    return HttpResponse()


@api_view(['GET'])
def home(request):
    recorded_site_visit = record_request_information(request)
    context = get_main_audio_context(request.META['HTTP_X_FORWARDED_FOR'])
    return render(request, 'home.html', context=context)


# TODO: add auth: access only from node app
@api_view(['GET'])
def audio_filenames(request):
    data = dict()
    try:
        data = {
            'filenames': get_audio_filenames()
        }
        return HttpResponse(content=json.dumps(data))
    except:
        return HttpResponse(status=500, reason='unknown server error')
