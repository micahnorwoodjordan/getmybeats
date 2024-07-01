import json
import logging

from django.shortcuts import render
from rest_framework.decorators import api_view
from django.core.files.base import ContentFile
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings

from GetMyBeatsApp.serializers import ProductionReleaseSerializer
from GetMyBeatsApp.data_access.utilities import (
    get_audio_filenames, record_request_information, get_release_by_id,
    get_audio_context, get_audio_by_filename_hash
)


logger = logging.getLogger(__name__)


GENERIC_200_MSG = 'SUCCESS'
GENERIC_400_MSG = 'BAD_REQUEST'
GENERIC_404_MSG = 'RESOURCE_NOT_FOUND'
GENERIC_500_MSG = 'UNKNOWN_SERVER_ERROR'


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
    return render(request, 'home.html')


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
        return HttpResponse(status=500, reason=GENERIC_500_MSG)


@api_view(['GET'])
def get_release(request, release_id):
    try:
        release_id = int(release_id)
        release = get_release_by_id(release_id)
        serializer = ProductionReleaseSerializer(release)
        return JsonResponse(serializer.data)

    except ValueError as err:
        extra = {settings.LOGGER_EXTRA_DATA_KEY: str(err)}
        logger.exception('get_release', extra=extra)
        return HttpResponse(status=400, reason=GENERIC_400_MSG)

    except ObjectDoesNotExist as err:
        extra = {settings.LOGGER_EXTRA_DATA_KEY: str(err)}
        logger.exception('get_release', extra=extra)
        return HttpResponse(status=404, reason=GENERIC_404_MSG)

    except Exception as err:
        extra = {settings.LOGGER_EXTRA_DATA_KEY: str(err)}
        logger.exception('get_release', extra=extra)
        return HttpResponse(status=500, reason=GENERIC_500_MSG)


def get_site_audio_context(request):
    context_array = get_audio_context()
    return HttpResponse(content=json.dumps(context_array))


def get_audio_by_hash(request, filename_hash):
    audio = get_audio_by_filename_hash(filename_hash)
    content_file = ContentFile(open(audio.file_upload.path, 'rb').read())
    response = HttpResponse(content_file, content_type='text/plain')
    response['Content-Length'] = content_file.size
    response['Content-Disposition'] = f'attachment; filename={filename_hash}'
    response['Range'] = 'bytes=0-'
    return response
