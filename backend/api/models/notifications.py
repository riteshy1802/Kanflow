from django.db import models
import uuid
from .user import User

class Type(models.TextChoices):
    REQUEST = "request"
    REVOKE = "info"

class Notifications(models.Model):
    notification_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    fromUser = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notification_from_user")
    toUser = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications_to_user")
    is_read=models.BooleanField(default=False)
    message = models.CharField(max_length=2000, null=True, blank=True)
    type = models.CharField(
        max_length=10,
        choices=Type.choices,
        null=True,
        blank=True
    )
    class Meta:
        db_table="notifications"