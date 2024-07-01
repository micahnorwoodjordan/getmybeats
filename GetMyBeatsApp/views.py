import uuid
import json
import logging

from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import HttpResponse, JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings

from GetMyBeatsApp.serializers import ProductionReleaseSerializer
from GetMyBeatsApp.data_access.utilities import get_audio_filenames, record_request_information, get_release_by_id


logger = logging.getLogger(__name__)


GENERIC_200_MSG = 'SUCCESS'
GENERIC_400_MSG = 'BAD_REQUEST'
GENERIC_401_MSG = 'UNAUTHORIZED'
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
def player_private_access(request, access_key, access_secret):
    # not forcing uuid as constraint on url slug; seems less susceptible to brute force guessing attempts
    try:
        uuid.UUID(access_key)
        uuid.UUID(access_secret)
        recorded_site_visit = record_request_information(request)
        if access_key == settings.API_ACCESS_KEY and access_secret == settings.API_SECRET_KEY:
            return render(request, 'player_private_access.html')
    except:
         return HttpResponse(404, reason=GENERIC_404_MSG)  # 404 because public shouldnt even know about this


@api_view(['GET'])
def player_public_access(request):
    recorded_site_visit = record_request_information(request)
    return render(request, 'player_public_access.html')


@api_view(['GET'])
def public_landing_page(request):
    recorded_site_visit = record_request_information(request)
    return render(request, 'public_landing_page.html')


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
