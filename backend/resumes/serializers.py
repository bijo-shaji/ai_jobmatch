from rest_framework import serializers

from .models import Resume


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = [
            "id",
            "file",
            "file_name",
            "uploaded_at",
        ]
        read_only_fields = ["id", "file_name", "uploaded_at"]

    def validate_file(self, value):
        allowed_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]

        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                "Only PDF and DOCX files are allowed."
            )

        max_size = 5 * 1024 * 1024

        if value.size > max_size:
            raise serializers.ValidationError(
                "File size must be 5 MB or less."
            )

        return value

    def create(self, validated_data):
        resume_file = validated_data["file"]

        resume = Resume.objects.create(
            user=self.context["request"].user,
            file=resume_file,
            file_name=resume_file.name,
        )

        return resume