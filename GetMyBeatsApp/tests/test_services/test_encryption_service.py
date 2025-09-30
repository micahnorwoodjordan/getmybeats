import uuid
import time
import random
import pytest

from GetMyBeatsApp.models import LogEntry, AudioFetchRequest, Audio

from GetMyBeatsApp.services.encryption_service import (
    EncryptionService, PlaybackRequestExpiredException, PLAYBACK_REQUEST_TICKET_TTL
)


def generate_encryption_key_payload() -> dict:
    # simulate a 256-bit, ASCII-encoded encryption key dict
    payload = {str(i): random.randint(0, 255) for i in range(32)}
    assert len(bytes(payload.values())) == 32
    return payload


def process_new_key_helper(audio_request_id):
    EncryptionService().process_new_key(audio_request_id, generate_encryption_key_payload())


def test_process_new_key():
    initial_log_entry_count = LogEntry.objects.filter().count()
    initial_audio_fetch_request_count = AudioFetchRequest.objects.filter().count()
    process_new_key_helper(str(uuid.uuid4()))
    assert LogEntry.objects.filter().count() == initial_log_entry_count + 1
    assert AudioFetchRequest.objects.filter().count() == initial_audio_fetch_request_count + 1


def test_get_encrypted_file_flow_ok():
    audio_request_id = str(uuid.uuid4())
    audio = Audio.objects.last()
    auth_bytes_total = 28  # encrypted file total length = ciphertext + 28 bytes dedicated to auth
    process_new_key_helper(audio_request_id)
    encrypted = EncryptionService().get_encrypted_file(audio_request_id, audio.file.path)
    assert len(encrypted) - auth_bytes_total == audio.file.size


def test_get_encrypted_file_flow_bad():
    audio_request_id = str(uuid.uuid4())
    audio = Audio.objects.last()
    process_new_key_helper(audio_request_id)
    time.sleep(PLAYBACK_REQUEST_TICKET_TTL + 1)  # wait an extra second to be safe
    with pytest.raises(PlaybackRequestExpiredException) as excinfo:
        EncryptionService().get_encrypted_file(audio_request_id, audio.file.path)
        assert 'the playback request has expired. please try to fetch song again' in excinfo
