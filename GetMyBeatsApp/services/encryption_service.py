import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from django.core.exceptions import ObjectDoesNotExist
from django.core.cache import cache

from GetMyBeatsApp.models import Audio, AudioFetchRequest


DEFAULT_NONCE_LENGTH = 12
DEFAULT_PLAYBACK_REQUEST_TICKET_TTL = 45  # seconds
CACHE_PREFIX = 'PLAYBACK_REQUEST_TICKET'


class EncryptionService:
    def __init__(self):
        pass

    def encrypt_file(self, file_path, key):
        with open(file_path, 'rb') as f:
            data = f.read()

        aesgcm = AESGCM(key)
        nonce = os.urandom(DEFAULT_NONCE_LENGTH)
        encrypted = aesgcm.encrypt(nonce, data, None)
        return nonce + encrypted

    def _get_encrypted_file(self, filepath, key):
        return self.encrypt_file(filepath, key)

    def cache_playback_request_ticket_with_ttl(self, audio_request_id, encryption_key, ttl=DEFAULT_PLAYBACK_REQUEST_TICKET_TTL):
        cache_key = CACHE_PREFIX + '-' + audio_request_id
        cache.add(cache_key, encryption_key, timeout=ttl)

    def get_encrypted_file(self, audio_request_id, filepath):
        if not AudioFetchRequest.objects.filter(request_uuid=audio_request_id):
            raise ObjectDoesNotExist('invalid audio request id')

        cached_value = cache.get(f'{CACHE_PREFIX}-{audio_request_id}')
        key = bytes([int(part) for part in cached_value.split('.')])
        cache.delete(cached_value)
        return self._get_encrypted_file(filepath, key)
