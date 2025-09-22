import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.core.cache import cache
from django.db import transaction

from GetMyBeatsApp.models import Audio, AudioFetchRequest

from GetMyBeatsApp.data_access.utilities import record_audio_request_information
from GetMyBeatsApp.services.log_service import LogService
from GetMyBeatsApp.models import LogEntry


MODULE = __name__


NONCE_LENGTH = 12
PLAYBACK_REQUEST_TICKET_TTL = 45  # seconds
CACHE_PREFIX = 'PLAYBACK_REQUEST_TICKET'


class EncryptionService:
    def __init__(self):
        pass

    def encrypt_file(self, file_path, key):
        with open(file_path, 'rb') as f:
            data = f.read()

        aesgcm = AESGCM(key)
        nonce = os.urandom(NONCE_LENGTH)
        encrypted = aesgcm.encrypt(nonce, data, None)
        return nonce + encrypted

    def _get_encrypted_file(self, filepath, key):
        return self.encrypt_file(filepath, key)

    def cache_playback_request_ticket_with_ttl(self, audio_request_id, encryption_key, ttl=PLAYBACK_REQUEST_TICKET_TTL):
        cache_key = CACHE_PREFIX + '-' + audio_request_id
        cache.add(cache_key, encryption_key, timeout=ttl)

    def get_encrypted_file(self, audio_request_id, filepath):
        if not AudioFetchRequest.objects.filter(request_uuid=audio_request_id):
            raise ObjectDoesNotExist('invalid audio request id')

        cached_value = cache.get(f'{CACHE_PREFIX}-{audio_request_id}')
        key = bytes([int(part) for part in cached_value.split('.')])
        cache.delete(cached_value)
        return self._get_encrypted_file(filepath, key)

    def process_new_key(self, audio_request_id: str, encoded_key: dict):
        try:
            with transaction.atomic():
                key = '.'.join([str(byte_value) for idx, byte_value in encoded_key.items()])
                record_audio_request_information(audio_request_id)
                self.cache_playback_request_ticket_with_ttl(audio_request_id, key)
                LogService.log(LogEntry.LogLevel.INFO, 'successfully processed encryption key', MODULE)
        except ValidationError as e:
            LogService.log(LogEntry.LogLevel.WARNING, f'error processing encryption key for audio request ID {audio_request_id}: {e}', MODULE)
            raise
        except Exception as e:
            LogService.log(LogEntry.LogLevel.WARNING, f'error processing encryption key for audio request ID {audio_request_id}: {e}', MODULE)
            raise
