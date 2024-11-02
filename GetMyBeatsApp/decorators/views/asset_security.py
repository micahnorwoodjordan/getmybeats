from django.conf import settings
from django.http import HttpResponse

from GetMyBeatsApp.helpers.request_utilities import GENERIC_400_MSG


# NOTE: clients can EASILY spoof user agents, but chances are that no one knows the backend rejects these user agents
def block_curl_requests(view_func):
    def wrapper(request, *args, **kwargs):
        user_agent = request.META.get('HTTP_USER_AGENT')

        if user_agent is None:
            return HttpResponse(status=400, reason=GENERIC_400_MSG)

        for prohibited in settings.PROHIBITED_USER_AGENT_SUBSTRINGS:
            if prohibited in user_agent:
                return HttpResponse(status=400, reason=GENERIC_400_MSG)

        return view_func(request, *args, **kwargs)
    return wrapper
