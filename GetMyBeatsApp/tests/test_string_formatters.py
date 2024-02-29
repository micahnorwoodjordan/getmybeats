import pytest

from GetMyBeatsApp.templatetags.string_formatters import (
    get_sanitized_title, get_sanitized_local_path, get_sanitized_s3_uri
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
    # positive test cases
    expected1 = 's3://bucket-name/key.txt'
    unvalidated1 = 's3://bucket-name/key.txt'

    expected2 = 's3://bucket_name/key.txt'
    unvalidated2 = 's3://bucket_name/key.txt'

    expected3 = 's3://bucket_name/key-jan12.txt'
    unvalidated3 = 's3://bucket_name/key-jan12.txt'

    expected4 = 's3://bucket_name/key_jan12.txt'
    unvalidated4 = 's3://bucket_name/key_jan12.txt'

    expected5 = 's3://bucket_name/key.jan12.txt'
    unvalidated5 = 's3://bucket_name/key.jan12.txt'
    assert get_sanitized_s3_uri(unvalidated1) == expected1
    assert get_sanitized_s3_uri(unvalidated2) == expected2
    assert get_sanitized_s3_uri(unvalidated3) == expected3
    assert get_sanitized_s3_uri(unvalidated4) == expected4
    assert get_sanitized_s3_uri(unvalidated5) == expected5

    # negative test cases
    expected1 = 's3://bucket_name/key.txt'
    invalid1 = 's3:/bucket name/key.txt'

    expected2 = 's3://bucket-name/key.txt'
    invalid2 = 's3:///bucket-name/key.txt'

    expected3 = 's3://key_1.txt'
    invalid3 = 's3://key 1.txt'

    assert get_sanitized_s3_uri(invalid1) == expected1
    assert get_sanitized_s3_uri(invalid2) == expected2
    assert get_sanitized_s3_uri(invalid3) == expected3
