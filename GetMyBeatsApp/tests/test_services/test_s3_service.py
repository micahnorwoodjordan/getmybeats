import pytest

from django.conf import settings

from GetMyBeatsApp.services.s3_service import S3AudioService


def _instantiate():
    s3 = S3AudioService()
    assert s3.client is not None
    s3.ls()  # a valid service constructor should be able stat the bucket at a minimum
    return s3


def test_service_constructor():
    _instantiate()
