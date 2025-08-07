import pytest

from django.conf import settings

from GetMyBeatsApp.services.s3_service import S3AudioService


def get_s3():
    s3 = S3AudioService()
    assert s3.client is not None
    assert s3.bucket_name is not None
    return s3


# a valid service constructor should be able stat the bucket at a minimum
def test_ls():
    s3 = get_s3()
    s3.ls()
