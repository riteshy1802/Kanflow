from rest_framework import serializers
from api.models.notifications import Notifications

class NotificationSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    message_content = serializers.SerializerMethodField()
    workspace_name = serializers.SerializerMethodField()
    senderEmail = serializers.SerializerMethodField()
    
    class Meta:
        model = Notifications
        fields = [
            'notification_id',
            'type',
            'fromUser',
            'toUser',
            'workspaceId',
            'workspace_name',
            'is_read',
            'name',
            'message_content',
            'reaction',
            'created_at',
            'senderEmail',
        ]
    
    def get_name(self, obj):
        return obj.fromUser.name if obj.fromUser else None

    def get_message_content(self, obj):
        return obj.messageId.content if obj.messageId else None

    def get_workspace_name(self, obj):
        return obj.workspaceId.name if obj.workspaceId else None

    def get_senderEmail(self, obj):
        return obj.fromUser.email if obj.fromUser else None