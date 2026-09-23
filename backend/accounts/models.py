from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    class Role(models.TextChoices):
        CANDIDATE = "candidate", "Candidate"
        recruiter = "recruiter", "Recruiter"

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username