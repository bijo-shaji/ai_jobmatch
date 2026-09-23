from rest_framework import serializers

from .models import ResumeAnalysis


class ResumeAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeAnalysis
        fields = [
            "id",
            "resume",
            "summary",
            "skills",
            "strengths",
            "missing_skills",
            "experience_level",
            "education",
            "suggestions",
            "created_at",
        ]
        read_only_fields = fields