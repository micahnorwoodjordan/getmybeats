import logging

from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import HttpResponse
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from GetMyBeatsApp.data_access.dao import AudioDAO
from GetMyBeatsApp.data_access.utilities import get_main_audio_context


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
def home(request):  # TODO: capture web traffic in database
    context = get_main_audio_context(request.META['HTTP_X_FORWARDED_FOR'])
    return render(request, 'home.html', context=context)


@api_view(['GET'])
def get_audio(request):
    dao = AudioDAO()
    audio_id = request.GET.get('id')
    if audio_id is not None:
        try:
            audio_id = int(audio_id)
            audio = dao.get_audio_by_id(audio_id)
            encoded_audio_file = AudioDAO.b64_encode_audio(audio)
            return HttpResponse(content=encoded_audio_file)
        except ValueError:
            return HttpResponse(status=400, reason=f'invalid integer id: {audio_id}')
        except ObjectDoesNotExist:
            return HttpResponse(status=404, reason=f'song does not exist: {audio_id}')
