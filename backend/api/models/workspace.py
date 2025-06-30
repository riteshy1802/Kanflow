from django.db import models
import uuid
from api.models.user import User

class Workspace(models.Model):
    workspaceId=models.UUIDField(
        primary_key=True,
        editable=False,
        default=uuid.uuid4
    )
    name=models.CharField(max_length=100)
    description=models.CharField(max_length=1000)
    creator=models.ForeignKey(User, on_delete=models.CASCADE, related_name="workspace_created_by", null=True)

    class Meta:
        db_table="workspaces"

    def __str__(self):
        return self.name