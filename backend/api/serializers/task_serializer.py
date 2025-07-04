from rest_framework import serializers
from api.models.tasks import Tasks

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tasks
        exclude = ['workspaceId', 'description']

class TaskSerializerDetailed(serializers.ModelSerializer):
    class Meta:
        model = Tasks
        exclude = ['workspaceId']