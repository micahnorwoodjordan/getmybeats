from django.conf import settings


def log_api_response(logger, response, calling_method, request_params=None, response_json=None):
    """
    :param logger: logging.Logger
    :param response: requests.Response
    :param calling_method: str
    :param request_params: dict: leave the parameter retrieval to the caller method
    :param response_json: dict: leave the json-ifying attempt and exception handling to the caller method
    """
    msg = calling_method + ' api call:'
    extra = {
        settings.LOGGER_EXTRA_DATA_KEY: {
            'method': response.request.method,
            'url': response.request.url,
            'request_params': request_params,  # response.request.params` raises AttributeError now
            'request_body': response.request.body,
            'request_headers': response.request.headers,
            'response_headers': response.headers,
            'status_code': response.status_code,
            'json': response_json,
        }
    }
    logger.info(msg, extra=extra)
