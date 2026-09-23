from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ai_analysis.models import ResumeAnalysis
from ai_analysis.services.ai_service import get_or_create_resume_analysis
from ai_analysis.services.job_match_service import (
    match_resume_with_job,
)
from resumes.models import Resume

from .models import Application, Job, JobMatch
from .serializers import (
    ApplicationSerializer,
    ApplicationStatusUpdateSerializer,
    JobMatchSerializer,
    JobSerializer,
)


class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == "recruiter":
            return Job.objects.filter(
                user=self.request.user
            ).order_by("-created_at")

        return Job.objects.filter(
            user__role="recruiter"
        ).order_by("-created_at")

    def perform_create(self, serializer):
        if self.request.user.role != "recruiter":
            raise PermissionDenied(
                "Only recruiters can create jobs."
            )

        serializer.save()


class JobDeleteView(generics.DestroyAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Job.objects.filter(
            user=self.request.user
        )


class JobDescriptionMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "candidate":
            return Response(
                {
                    "detail": (
                        "Only candidates can analyze "
                        "job descriptions."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        resume_id = request.data.get("resume")
        description = request.data.get(
            "description",
            "",
        ).strip()

        if not resume_id:
            return Response(
                {"detail": "Resume is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not description:
            return Response(
                {
                    "detail": (
                        "Job description is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            resume = Resume.objects.get(
                id=resume_id,
                user=request.user,
            )
        except Resume.DoesNotExist:
            return Response(
                {"detail": "Resume not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            resume_analysis = get_or_create_resume_analysis(
                resume=resume,
                user=request.user,
            )
        except Exception as exc:
            return Response(
                {"detail": f"Resume analysis failed: {str(exc)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = match_resume_with_job(
                resume_analysis,
                description,
            )

            return Response(
                {
                    "match_score": result.get(
                        "match_score",
                        0,
                    ),
                    "matched_skills": result.get(
                        "matched_skills",
                        [],
                    ),
                    "missing_skills": result.get(
                        "missing_skills",
                        [],
                    ),
                    "recommendation": result.get(
                        "recommendation",
                        "",
                    ),
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception:
            return Response(
                {"detail": "Job matching failed."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class JobMatchCreateView(generics.CreateAPIView):
    serializer_class = JobMatchSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if request.user.role != "candidate":
            return Response(
                {
                    "detail": (
                        "Only candidates can match "
                        "resumes with jobs."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        job_id = self.kwargs["job_id"]
        resume_id = self.kwargs["resume_id"]

        try:
            job = Job.objects.get(
                id=job_id,
                user__role="recruiter",
            )
        except Job.DoesNotExist:
            return Response(
                {"detail": "Job not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            resume = Resume.objects.get(
                id=resume_id,
                user=request.user,
            )
        except Resume.DoesNotExist:
            return Response(
                {"detail": "Resume not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            resume_analysis = get_or_create_resume_analysis(
                resume=resume,
                user=request.user,
            )
        except Exception as exc:
            return Response(
                {"detail": f"Resume analysis failed: {str(exc)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


        try:
            result = match_resume_with_job(
                resume_analysis,
                job.description,
            )

            job_match, created = JobMatch.objects.update_or_create(
                resume=resume,
                job=job,
                defaults={
                    "user": request.user,
                    "match_score": result.get(
                        "match_score",
                        0,
                    ),
                    "matched_skills": result.get(
                        "matched_skills",
                        [],
                    ),
                    "missing_skills": result.get(
                        "missing_skills",
                        [],
                    ),
                    "recommendation": result.get(
                        "recommendation",
                        "",
                    ),
                },
            )

            serializer = self.get_serializer(
                job_match
            )

            return Response(
                serializer.data,
                status=(
                    status.HTTP_201_CREATED
                    if created
                    else status.HTTP_200_OK
                ),
            )

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception:
            return Response(
                {"detail": "Job matching failed."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class JobMatchListView(generics.ListAPIView):
    serializer_class = JobMatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == "recruiter":
            return JobMatch.objects.filter(
                job__user=self.request.user
            ).order_by("-created_at")

        return JobMatch.objects.filter(
            user=self.request.user
        ).order_by("-created_at")


class JobMatchDetailView(generics.RetrieveAPIView):
    serializer_class = JobMatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == "recruiter":
            return JobMatch.objects.filter(
                job__user=self.request.user
            )

        return JobMatch.objects.filter(
            user=self.request.user
        )


class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "recruiter":
            return Application.objects.filter(
                job__user=user
            ).select_related("candidate", "job", "resume").order_by("-applied_at")

        return Application.objects.filter(
            candidate=user
        ).select_related("candidate", "job", "resume").order_by("-applied_at")

    def create(self, request, *args, **kwargs):
        if request.user.role != "candidate":
            return Response(
                {"detail": "Only candidates can apply to jobs."},
                status=status.HTTP_403_FORBIDDEN,
            )

        job_id = request.data.get("job")
        resume_id = request.data.get("resume")

        if not job_id:
            return Response(
                {"detail": "Job is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not resume_id:
            return Response(
                {"detail": "Resume is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            job = Job.objects.get(id=job_id, user__role="recruiter")
        except Job.DoesNotExist:
            return Response(
                {"detail": "Job not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            resume = Resume.objects.get(id=resume_id, user=request.user)
        except Resume.DoesNotExist:
            return Response(
                {"detail": "Resume not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if Application.objects.filter(
            candidate=request.user, job=job
        ).exists():
            return Response(
                {"detail": "You have already applied to this job."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        has_match = JobMatch.objects.filter(
            job=job, resume=resume, user=request.user
        ).exists()
        if not has_match:
            return Response(
                {
                    "detail": (
                        "Please analyze your match for this job with "
                        "the selected resume before applying."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        application = Application.objects.create(
            candidate=request.user,
            job=job,
            resume=resume,
            status=Application.Status.PENDING,
        )

        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ApplicationDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return ApplicationStatusUpdateSerializer
        return ApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "recruiter":
            return Application.objects.filter(job__user=user)
        return Application.objects.filter(candidate=user)

    def update(self, request, *args, **kwargs):
        if request.user.role != "recruiter":
            return Response(
                {
                    "detail": (
                        "Only recruiters can update application statuses."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        full_serializer = ApplicationSerializer(
            instance, context={"request": request}
        )
        return Response(full_serializer.data)

