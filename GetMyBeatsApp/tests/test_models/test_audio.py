import pytest

from GetMyBeatsApp.models import Audio


def test_one():
    audio = Audio.objects.last()
    assert audio.pk


def test_two():
    assert True
