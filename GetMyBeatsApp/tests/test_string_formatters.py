import pytest

from GetMyBeatsApp.templatetags.string_formatters import (
    get_sanitized_title, get_sanitized_local_path, get_sanitized_s3_uri, get_sanitized_file_stem
)


def test_get_sanitized_title():
    expected = 'my_title'
    unsanitized1 = 'MY TITLE'
    unsanitized2 = 'my title'
    unsanitized3 = 'My Title'
    unsanitized4 = 'MY-TITLE'
    unsanitized5 = 'my-title'
    unsanitized6 = 'My-Title'
    unsanitized7 = 'My_Title'
    unsanitized8 = 'MY_TITLE'
    unsanitized9 = 'my_title'

    assert get_sanitized_title(unsanitized1) == expected
    assert get_sanitized_title(unsanitized2) == expected
    assert get_sanitized_title(unsanitized3) == expected
    assert get_sanitized_title(unsanitized4) == expected
    assert get_sanitized_title(unsanitized5) == expected
    assert get_sanitized_title(unsanitized6) == expected
    assert get_sanitized_title(unsanitized7) == expected
    assert get_sanitized_title(unsanitized8) == expected
    assert get_sanitized_title(unsanitized9) == expected


def test_get_sanitized_s3_uri():
    expected1 = 's3://bucket-name/key.txt'
    unvalidated1 = 's3://bucket_name/key.txt'  # underscore in bucket name

    expected2 = 's3://bucket-name/key_jan12.txt'
    unvalidated2 = 's3://bucket_name/key-jan12.txt'  # dash in key name

    expected3 = 's3://bucket-name/key_jan12.txt'
    unvalidated3 = 's3://bucket_name/key-jan12.txt'  # underscore in bucket name, dash in key name

    expected4 = 's3://bucket-name/key.txt'
    invalid4 = 's3:/bucket name/key.txt'  # space in bucket name

    expected5 = 's3://bucket-name/key_1.txt'
    invalid5 = 's3://bucket name/key 1.txt'  # space in key name, space in bucket name

    assert get_sanitized_s3_uri(unvalidated1) == expected1
    assert get_sanitized_s3_uri(unvalidated2) == expected2
    assert get_sanitized_s3_uri(unvalidated3) == expected3
    assert get_sanitized_s3_uri(invalid4) == expected4
    assert get_sanitized_s3_uri(invalid5) == expected5


def test_get_sanitized_file_stem():
    expected1 = 'key.jan12'
    unvalidated1 = 'key.jan12.'  # invalid

    expected2 = 'key_1'
    unvalidated2 = 'key 1...'  # invalid

    expected3 = 'key.jan12_2024'
    unvalidated3 = 'key.jan12-2024'  # invalid

    expected4 = 'key.jan12.2023'
    unvalidated4 = 'key.jan12.2023'  # valid

    expected5 = 'franklin.roosevelt.jan12.2023'
    unvalidated5 = 'franklin.roosevelt.jan12.2023'  # valid

    assert get_sanitized_file_stem(unvalidated1) == expected1
    assert get_sanitized_file_stem(unvalidated2) == expected2
    assert get_sanitized_file_stem(unvalidated3) == expected3
    assert get_sanitized_file_stem(unvalidated4) == expected4
    assert get_sanitized_file_stem(unvalidated5) == expected5
