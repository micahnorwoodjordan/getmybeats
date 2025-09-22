import base64

from django.conf import settings
from django.db import transaction, IntegrityError
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.utils.timezone import now

from GetMyBeatsApp.models import (
    Audio, SiteVisitRequest, ProductionRelease, UserExperienceReport,
    AudioFetchRequest, AudioArtwork
)

from GetMyBeatsApp.models import LogEntry
from GetMyBeatsApp.services.log_service import LogService


MODULE = __name__


NEW_AUDIO_UPLOAD_CACHE_KEY = f'NEW-UPLOAD-{now().strftime("%Y.%m.%d")}'
NEW_SITE_VISIT_REQUEST_CACHE_KEY_PREFIX = 'user-site-audio-context-'


class InvalidAudioFetchRequestException(Exception):
    pass


def b64encode_file_upload(filepath):
    """
    :param filepath: string
    """
    # b64 encode wav files
    # reference: https://stackoverflow.com/questions/30224729/convert-wav-to-base64
    return base64.b64encode(open(filepath, "rb").read())


def get_audio_filenames():
    return [name for name in Audio.objects.all().values_list('file_upload', flat=True).order_by('-id')]


def record_request_information(request):
    recorded_site_visit = None

    remote_ip_address = request.META['HTTP_X_FORWARDED_FOR']
    params = request.META['QUERY_STRING']
    headers = {k: v for k, v in request.headers.items()}
    body = {k: v for k, v in request.POST.items()}
    user_agent = headers['User-Agent']
    method = request.method
    site_vist_request_cache_key = NEW_SITE_VISIT_REQUEST_CACHE_KEY_PREFIX + remote_ip_address

    if not cache.get(site_vist_request_cache_key):
        try:
            with transaction.atomic():
                recorded_site_visit = SiteVisitRequest.objects.create(
                    ip=remote_ip_address,
                    params=params,
                    headers=headers,
                    method=method,
                    user_agent=user_agent,
                    body=str(body)
                )
        except IntegrityError as e:
            LogService.log(LogEntry.LogLevel.ERROR, str(e), MODULE)
        except Exception as e:
            LogService.log(LogEntry.LogLevel.ERROR, str(e), MODULE)

        # count" site visits; someone constantly refreshing the page doesnt count, for example
        cache.add(site_vist_request_cache_key, remote_ip_address)

    return recorded_site_visit


def record_audio_request_information(request_id):
    try:
        AudioFetchRequest.objects.create(request_uuid=request_id)
    except ValidationError as e:
        LogService.log(LogEntry.LogLevel.WARNING, str(e), MODULE)
        raise InvalidAudioFetchRequestException('not a valid request') from e
    except Exception as e:
        LogService.log(LogEntry.LogLevel.ERROR, str(e), MODULE)


def get_release_by_id(release_id):
    if release_id == -1:
        return ProductionRelease.objects.last()
    return ProductionRelease.objects.get(id=release_id)


def get_all_audio_filename_hashes():
    hashes = []
    for audio in Audio.objects.all():
        hashes.append(audio.filename_hash)
    return hashes


def get_audio_by_filename_hash(filename_hash):
    return Audio.objects.get(filename_hash=filename_hash)


def get_audio_artwork_by_filename_hash(filename_hash):
    return AudioArtwork.objects.get(filename_hash=filename_hash)


def get_audio_context():
    context_array = []
    for idx, a in enumerate(list(
        Audio.objects.filter(filename_hash__isnull=False).select_related('artwork').order_by('-id')
    )):
        context_array.append({  # TODO: make this an interface / data model
            'audio_filename_hash': a.filename_hash,
            'artwork_filename_hash': a.artwork.filename_hash if a.artwork else None,
            'title': a.title,
            'id': idx
        })
    return context_array


def get_current_user_experience_report():
    report_for_user = {
        'issues': [],
        'upcoming': [],
        'recent': []
    }
    report_raw = UserExperienceReport.objects.last()

    for k, v in report_raw.issues.items():
        report_for_user['issues'].append({'title': k, 'description': v})
    for k, v in report_raw.upcoming.items():
        report_for_user['upcoming'].append({'title': k, 'description': v})
    for k, v in report_raw.recent.items():
        report_for_user['recent'].append({'title': k, 'description': v})
    return report_for_user
