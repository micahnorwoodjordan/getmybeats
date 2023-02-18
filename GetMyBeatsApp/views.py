from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def home(request):
    return render(request, 'home.html', {})  # TODO: create wrapper around Django Response
