import json
import logging

from django.shortcuts import render
from rest_framework.decorators import api_view
from django.core.files.base import ContentFile
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from django.conf import settings


from GetMyBeatsApp.decorators.views.asset_security import validate_user_agent, validate_audio_request_id
from GetMyBeatsApp.helpers.file_io_utilities import read_in_chunks
from GetMyBeatsApp.serializers import ProductionReleaseSerializer
from GetMyBeatsApp.data_access.utilities import get_release_by_id, get_audio_context, get_audio_by_filename_hash
from GetMyBeatsApp.helpers.request_utilities import (
    GENERIC_200_MSG, GENERIC_400_MSG,
    GENERIC_404_MSG, GENERIC_422_MSG, GENERIC_500_MSG
)

from GetMyBeatsApp.services.encryption_service import EncryptionService


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


@csrf_exempt
@validate_audio_request_id
@validate_user_agent
@api_view(['POST'])
def post_playback_request(request):
    try:
        encoded_key = json.loads(request.body.decode("utf-8"))['playbackRequestKey']  # comes over the wire as a dict
        audio_request_id = request.META['HTTP_AUDIO_REQUEST_ID']
        EncryptionService().process_new_key(audio_request_id, encoded_key)
    except ValidationError as e:
        logger.info('error', extra={settings.LOGGER_EXTRA_DATA_KEY: str(e)})
        return HttpResponse(status=422, reason=GENERIC_422_MSG)
    except Exception as e:
        logger.info('error', extra={settings.LOGGER_EXTRA_DATA_KEY: str(e)})
        return HttpResponse(status=500, reason=GENERIC_500_MSG)
    return HttpResponse()


@validate_user_agent
@api_view(['GET'])
def get_encrypted_audio_by_hash(request, filename_hash):
    try:
        audio_request_id = request.META['HTTP_AUDIO_REQUEST_ID']
        audio = get_audio_by_filename_hash(filename_hash)
        encrypted = EncryptionService().get_encrypted_file(audio_request_id, audio.file.path)
        response = StreamingHttpResponse(streaming_content=read_in_chunks(raw_material=encrypted))
        # https://stackoverflow.com/questions/52137963/how-to-set-the-currenttime-in-html5-audio-object-when-audio-file-is-online
        # must NEVER forget that Google Chrome bugs out when headers aren't properly set
        # prone to error when implementing custom server-side streaming logic
        response['Content-Type'] = 'application/octet-stream'
        response['Content-Length'] = len(encrypted)
        response['Content-Disposition'] = f'attachment; filename={filename_hash}'
        response['Accept-Ranges'] = 'bytes'
        response['Content-Encoding'] = 'identity'
        response['Cache-Control'] = 'no-store'
        return response
    except KeyError as e:  # missing Audio-Request-Id header
        logger.info('error', extra={settings.LOGGER_EXTRA_DATA_KEY: str(e)})
        return HttpResponse(status=400, reason=GENERIC_400_MSG)
    except ObjectDoesNotExist as e:
        logger.info('error', extra={settings.LOGGER_EXTRA_DATA_KEY: str(e)})
        return HttpResponse(status=404, reason=GENERIC_404_MSG)
    except Exception as e:
        logger.info('error', extra={settings.LOGGER_EXTRA_DATA_KEY: str(e)})
        return HttpResponse(status=500, reason=GENERIC_500_MSG)


@validate_user_agent
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


@validate_user_agent
@api_view(['GET'])
def get_site_audio_context(request):
    context_array = get_audio_context()
    return HttpResponse(content=json.dumps(context_array), reason=GENERIC_200_MSG)


@validate_user_agent
@api_view(['GET'])
def get_audio_artwork_by_hash(request, filename_hash):
    try:
        artwork = get_audio_artwork_by_filename_hash(filename_hash)
        content_file = ContentFile(open(artwork.file.path, 'rb').read())
        response = StreamingHttpResponse(streaming_content=read_in_chunks(infile=content_file))
        return response
    except ObjectDoesNotExist as e:
        logger.info('error', extra={settings.LOGGER_EXTRA_DATA_KEY: str(e)})
        return HttpResponse(status=404, reason=GENERIC_404_MSG)
    except Exception as e:
        logger.info('error', extra={settings.LOGGER_EXTRA_DATA_KEY: str(e)})
        return HttpResponse(status=500, reason=GENERIC_500_MSG)


@api_view(['GET'])
def get_user_experience_report(request):
    report = get_current_user_experience_report()
    return render(request, 'user_experience_report.html', context=report)
