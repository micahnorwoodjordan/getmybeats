from rest_framework import serializers

from .models import Audio

class AudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audio
        exclude = ['fk_uploaded_by', 'raw_bytes']