import pytest
import mock

from django.core.files import File
from django.conf import settings

from GetMyBeatsApp.models import Audio


# some extremely helpful articles:
#   https://pytest-with-eric.com/mocking/pytest-mocking/
#   http://www.semicolom.com/blog/test-a-django-model-with-a-filefield/

@pytest.mark.django_db
def test_audio_creation(mocker):
    mocker.patch('GetMyBeatsApp.services.s3_service.S3AudioService.upload', print)  # just use any void method call
    file_mock = mock.MagicMock(spec=File)
    file_mock.name = 'noodles.wav'
    audio = Audio.objects.create(file=file_mock)
    assert audio.file.name == file_mock.name
    assert audio.file.path == settings.MEDIA_ROOT + 'noodles.wav'
    assert audio.ext == '.wav'
    assert audio.title == 'noodles'
    assert audio.s3_upload_path == f's3://{settings.S3_AUDIO_BUCKET}/noodles.wav'


@pytest.mark.django_db
def test_audio_file_overwrite(mocker):
    mocker.patch('GetMyBeatsApp.services.s3_service.S3AudioService.upload', print)  # just use any void method call
    # these two mock objects are from the same invocation, but they're 2 different obj's in memory
    mocked_file_1 = mock.MagicMock(spec=File)
    mocked_file_1.name = 'testfile.txt'
    mocked_file_2 = mock.MagicMock(spec=File)
    mocked_file_2.name = 'testfile.txt'

    audio = Audio.objects.create(file=mocked_file_1)
    old_audio_filename_hash = audio.filename_hash
    audio.file = mocked_file_2
    audio.save()
    audio.refresh_from_db()
    assert audio.filename_hash != old_audio_filename_hash
