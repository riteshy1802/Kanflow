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

    member_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    userId = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="team_members")
    email = models.EmailField(null=True)
    workspaceId = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="member_of_workspace")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    privilege = models.CharField(max_length=10, choices=Privilege.choices, default=Privilege.USER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "team_members"
        unique_together = ("workspaceId", "email")

    def __str__(self):
        return f"{self.email} in {self.workspaceId.name}"
