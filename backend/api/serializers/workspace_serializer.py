from rest_framework import serializers
from api.models.workspace import Workspace

class WorkspaceSerializer(serializers.ModelSerializer):
    creator = serializers.UUIDField(source='creator.userId', read_only=True)
    class Meta:
        model = Workspace
        fields = ['workspaceId', 'name', 'description', 'creator']
        read_only_fields = ['workspaceId']
