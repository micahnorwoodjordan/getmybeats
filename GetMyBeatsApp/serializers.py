from rest_framework import serializers

from .models import Audio, ProductionRelease


class AudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audio
        exclude = ['fk_uploaded_by']


class ProductionReleaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionRelease
        fields = ['release_date']  # probably shouldn't expose anything else
