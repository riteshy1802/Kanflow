from django.db import models
import uuid
class User(models.Model):
    userId = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)

    class Meta:
        db_table="user"

    def __str__(self):
        return self.name