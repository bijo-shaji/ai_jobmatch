from rest_framework import serializers

from .models import Application, Job, JobMatch


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            "id",
            "title",
            "company",
            "description",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        return Job.objects.create(
            user=self.context["request"].user,
            **validated_data,
        )


class JobMatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobMatch
        fields = [
            "id",
            "resume",
            "job",
            "match_score",
            "matched_skills",
            "missing_skills",
            "recommendation",
            "created_at",
        ]
        read_only_fields = fields


class ApplicationSerializer(serializers.ModelSerializer):
    candidate_details = serializers.SerializerMethodField()
    job_details = serializers.SerializerMethodField()
    resume_details = serializers.SerializerMethodField()
    match_details = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id",
            "candidate",
            "job",
            "resume",
            "status",
            "applied_at",
            "updated_at",
            "candidate_details",
            "job_details",
            "resume_details",
            "match_details",
        ]
        read_only_fields = [
            "id",
            "candidate",
            "status",
            "applied_at",
            "updated_at",
        ]

    def get_candidate_details(self, obj):
        return {
            "id": obj.candidate.id,
            "username": obj.candidate.username,
            "email": obj.candidate.email,
            "first_name": obj.candidate.first_name,
            "last_name": obj.candidate.last_name,
        }

    def get_job_details(self, obj):
        return {
            "id": obj.job.id,
            "title": obj.job.title,
            "company": obj.job.company,
            "description": obj.job.description,
            "created_at": obj.job.created_at,
        }

    def get_resume_details(self, obj):
        request = self.context.get("request")
        file_url = (
            obj.resume.file.url
            if hasattr(obj.resume, "file") and obj.resume.file
            else ""
        )
        if request and file_url and not file_url.startswith("http"):
            file_url = request.build_absolute_uri(file_url)
        return {
            "id": obj.resume.id,
            "file_name": obj.resume.file_name,
            "file_url": file_url,
        }

    def get_match_details(self, obj):
        match = JobMatch.objects.filter(
            job=obj.job, resume=obj.resume
        ).first()
        if not match:
            match = JobMatch.objects.filter(
                job=obj.job, user=obj.candidate
            ).first()
        if match:
            return {
                "match_score": match.match_score,
                "matched_skills": match.matched_skills,
                "missing_skills": match.missing_skills,
                "recommendation": match.recommendation,
            }
        return None


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["status"]