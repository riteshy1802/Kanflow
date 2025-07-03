from django.db import models
from django.contrib.postgres.fields import ArrayField
import uuid
from api.models.workspace import Workspace
from api.models.workspace import User

class Tasks(models.Model):
    task_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    assignees = ArrayField(
        base_field=models.UUIDField(),
        blank=True,
        default=list
    )
    tags = ArrayField(
        base_field=models.CharField(max_length=20),
        blank=True,
        default=list
    )
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="task_creator", null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=2000)
    dueDate = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    workspaceId = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="workspace_tasks",
        null=True,
        blank=True
    )
    class Priority(models.TextChoices):
        HIGH = "high"
        MEDIUM = "medium"
        LOW = "low"

    class Status(models.TextChoices):
        TODO = "todo"
        IN_PROGRESS = "in_progress"
        BLOCKED = "blocked"
        IN_REVIEW = "in_review"
        DONE = "done"

    priority = models.CharField(choices=Priority.choices, max_length=20)
    status = models.CharField(choices=Status.choices, max_length=20)

    class Meta:
        db_table = "tasks"
