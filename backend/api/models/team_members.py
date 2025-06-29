from django.db import models
from .user import User
from .workspace import Workspace
import uuid

class TeamMembers(models.Model):
    class Privilege(models.TextChoices):
        ADMIN = "admin"
        USER = "user"

    class Status(models.TextChoices):
        ACCEPTED = "accepted"
        PENDING = "pending"
        REJECTED = "rejected"
        
    member_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    userId = models.ForeignKey(User, on_delete=models.CASCADE, related_name="team_members")
    workspaceId = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="member_of_workspace")
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        null=True,
        blank=True,
    )
    privilege = models.CharField(
        max_length=10,
        choices=Privilege.choices,
        null=True,
        blank=True,
    )

    class Meta:
        db_table="team_members"

    def __str__(self):
        return f"{self.userId.name} in {self.workspaceId.name}"