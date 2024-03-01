import os
import pathlib
import pathvalidate

from django.conf import settings

from GetMyBeatsApp.helpers.common import Character


class FileSystemNamespacingHandler:

    @staticmethod
    def sanitize_upload_filename(instance, filename):
        return f'{FileSystemNamespacingHandler.get_sanitized_file_basename(filename)}'

    @staticmethod
    def populate_s3_upload_path(media_type):
        """convience method to populate the s3 fields in the django admin interface"""
        prefix = 's3://'
        if media_type == 1:  # Audio.MediaType.audio
            bucket = settings.S3_AUDIO_BUCKET
        elif media_type == 2:  # Audio.MediaType.image
            bucket = settings.S3_IMAGE_BUCKET
        # explicitly setting placeholder text will fail instance `save` calls if the true file name isn't set by user
        return os.path.join(prefix, bucket, Character.PLACEHOLDER)

    @staticmethod
    def get_sanitized_title(string):
        sanitized = ''
        for character in string:
            is_letter = character.isalpha()
            is_number = character.isnumeric()
            is_underscore = character == Character.UNDERSCORE

            if any([is_letter, is_number, is_underscore]):
                sanitized += character.lower()
                continue
            if character == Character.SPACE or character == Character.DASH:
                sanitized += Character.UNDERSCORE
                continue
        return sanitized

    @staticmethod
    def get_sanitized_file_stem(stem):
        sanitized = ''
        almost_sanitized = stem.replace(Character.DASH, Character.UNDERSCORE).replace(Character.SPACE, Character.UNDERSCORE)

        length = len(almost_sanitized)
        for i in range(len(almost_sanitized)):
            current_character = almost_sanitized[i]
            next_character = almost_sanitized[i + 1] if i + 1 < length else None
            sequential_periods = all([current_character == Character.PERIOD, next_character == Character.PERIOD])
            final_character_is_period = next_character is None and current_character == Character.PERIOD

            if not sequential_periods and not final_character_is_period:
                is_valid_character = current_character in [Character.UNDERSCORE, Character.PERIOD] or \
                    current_character.isalpha() or current_character.isnumeric()
                if is_valid_character:
                    sanitized += current_character.lower()
        return sanitized

    @staticmethod
    def get_sanitized_file_basename(file_basename):
        path = pathlib.Path(file_basename)
        stem = path.stem
        sanitized_stem = FileSystemNamespacingHandler.get_sanitized_file_stem(stem)
        ext = os.path.splitext(path)[-1]
        sanitized_ext = Character.PERIOD + ext.split(Character.PERIOD)[-1]
        return sanitized_stem + sanitized_ext

    @staticmethod
    def get_sanitized_local_path(path):
        """an attempt to normalize Django FileField upload paths. it's assumed that the filepaths are normal Posix paths.
        the criteria is that file names do not contain spaces or dashes, and have a valid extension"""
        stem = pathlib.Path(path).stem
        sanitized_stem = FileSystemNamespacingHandler.get_sanitized_file_stem(stem)
        ext = os.path.splitext(path)[-1]
        sanitized_ext = '.' + ext.split('.')[-1]
        almost_sanitized = pathvalidate.sanitize_filepath(pathvalidate.sanitize_filepath(path))  # 2x bc method != perfect
        sanitized = almost_sanitized.replace(stem, sanitized_stem).replace(ext, sanitized_ext)
        return sanitized

    def get_sanitized_s3_uri(uri):
        protocol = 's3://'
        path = pathlib.Path(uri)
        bucket_name = path.parts[1]
        sanitized_bucket_name = bucket_name.replace(Character.UNDERSCORE, Character.DASH).replace(Character.SPACE, Character.DASH)
        stem = path.stem
        sanitized_stem = FileSystemNamespacingHandler.get_sanitized_file_stem(stem)
        ext = path.parts[-1]
        sanitized_ext = Character.PERIOD + ext.split(Character.PERIOD)[-1]
        sanitized = os.path.join(protocol, sanitized_bucket_name, sanitized_stem + sanitized_ext)
        return sanitized
