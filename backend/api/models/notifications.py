from django.db import models
import uuid
from .user import User
from .message import Message
from .workspace import Workspace

class Type(models.TextChoices):
    REQUEST = "request"
    REVOKE = "info"

class Reaction(models.TextChoices):
    ACCEPTED="accepted"
    REJECTED="rejected"
    PENDING="pending"
    REVOKED="revoked"

class Notifications(models.Model):
    notification_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    reaction=models.CharField(
        choices=Reaction.choices,
        null=True,
        blank=True,
        default='pending'
    )
    workspaceId=models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="notification_workspace", null=True)
    fromUser = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notification_from_user")
    toUser = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications_to_user", null=True, blank=True)
    is_read=models.BooleanField(default=False)
    to_email = models.EmailField(null=True, blank=True)
    messageId=models.ForeignKey(Message, on_delete=models.CASCADE, related_name="message_notfication", null=True, blank=True)
    type = models.CharField(
        max_length=10,
        choices=Type.choices,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table="notifications"