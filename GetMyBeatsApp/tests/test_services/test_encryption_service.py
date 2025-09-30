import uuid
import random
import pytest

from django.conf import settings

from GetMyBeatsApp.models import LogEntry, AudioFetchRequest

from GetMyBeatsApp.services.encryption_service import EncryptionService


def generate_encryption_key_payload() -> dict:
    # simulate a 256-bit, ASCII-encoded encryption key dict
    payload = {str(i): random.randint(0, 255) for i in range(32)}
    assert len(bytes(payload.values())) == 32
    return payload


def test_process_new_key():
    initial_log_entry_count = LogEntry.objects.filter().count()
    initial_audio_fetch_request_count = AudioFetchRequest.objects.filter().count()
    EncryptionService().process_new_key(str(uuid.uuid4()), generate_encryption_key_payload())
    assert LogEntry.objects.filter().count() == initial_log_entry_count + 1
    assert AudioFetchRequest.objects.filter().count() == initial_audio_fetch_request_count + 1
