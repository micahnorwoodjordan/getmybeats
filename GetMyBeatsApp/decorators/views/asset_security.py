import uuid

from django.conf import settings
from django.http import HttpResponse
from django.core.exceptions import ValidationError

from GetMyBeatsApp.models import AudioFetchRequest
from GetMyBeatsApp.helpers.request_utilities import GENERIC_400_MSG


# NOTE: clients can EASILY spoof user agents, but chances are that no one knows the backend rejects these user agents
def validate_user_agent(view_func):
    def wrapper(request, *args, **kwargs):
        user_agent = request.META.get('HTTP_USER_AGENT')

        if user_agent is None:
            return HttpResponse(status=400, reason=GENERIC_400_MSG)

        for prohibited in settings.PROHIBITED_USER_AGENT_SUBSTRINGS:
            if prohibited in user_agent:
                return HttpResponse(status=400, reason=GENERIC_400_MSG)

        return view_func(request, *args, **kwargs)
    return wrapper


# NOTE: any proper GUID will pass, but chances are that no knows the backend only looks for properly formed GUID's
def validate_audio_request_id(view_func):
    def wrapper(request, *args, **kwargs):
        # since every audio GET request needs a unique GUID,
        # the chances are that valid requests will only be sent from the browser
        # (and not from a command line, though this is possible).
        # if a request is duplicated/mimicked, the already-existing GUID will trip the below condition
        audio_request_id = request.META.get('HTTP_AUDIO_REQUEST_ID')
        http_response_400 = HttpResponse(status=400, reason=GENERIC_400_MSG)

        try:
            uuid.UUID(audio_request_id)
        except ValidationError:  # from a malformed UUID
            return http_response_400

        if AudioFetchRequest.objects.filter(request_uuid=audio_request_id).exists():
            return http_response_400

        return view_func(request, *args, **kwargs)
    return wrapper
