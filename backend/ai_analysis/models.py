from django.conf import settings
from django.db import models

from resumes.models import Resume


class ResumeAnalysis(models.Model):
    resume = models.OneToOneField(
        Resume,
        on_delete=models.CASCADE,
        related_name="analysis",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resume_analyses",
    )
    summary = models.TextField(blank=True)
    skills = models.JSONField(default=list)
    strengths = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    experience_level = models.CharField(max_length=50, blank=True)
    education = models.JSONField(default=list)
    suggestions = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis - {self.resume.file_name}"