from django.db import models
from django.contrib.postgres.fields import ArrayField
import uuid

class Tasks(models.Model):
    task_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    assigned = ArrayField(
        base_field=models.UUIDField(),
        blank=True,
        default=list
    )
    tags = ArrayField(
        base_field=models.CharField(max_length=20),
        blank=True,
        default=list
    )
    description = models.CharField(max_length=2000)
    due_date = models.DateField()
    due_time = models.TimeField()

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
