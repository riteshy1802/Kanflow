from django.db import models
import uuid

class Message(models.Model):
    messageId=models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    content=models.CharField(max_length=3000, null=True, blank=True)
    class Meta:
        db_table="message"
    def __str__(self):
        return self.content