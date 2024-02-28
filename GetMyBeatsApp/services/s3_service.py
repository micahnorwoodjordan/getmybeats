import boto3
import logging


logger = logging.getLogger(__name__)


class S3Service:
    # https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html#guide-resources
    def __init__(self, bucket):
        self.resource = boto3.resource('s3')
        self.bucket = self.resource.Bucket(bucket)

    def upload(self, local_filepath, remote_filepath):
        self.bucket.upload_file(local_filepath, remote_filepath)

    def download(self, remote_filepath, local_filepath):
        s3_object = self.resource.Object(self.bucket._name, remote_filepath)
        s3_object.download_file(local_filepath)
