from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from resumes.models import Resume

from .models import ResumeAnalysis
from .serializers import ResumeAnalysisSerializer
from .services.ai_service import analyze_resume
from .services.resume_parser import extract_resume_text


class ResumeAnalysisCreateView(generics.CreateAPIView):
    serializer_class = ResumeAnalysisSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        resume_id = self.kwargs["resume_id"]

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
            resume_text = extract_resume_text(resume.file.path)

            if not resume_text.strip():
                return Response(
                    {"detail": "Could not extract text from the resume."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            analysis_data = analyze_resume(resume_text)

            analysis, created = ResumeAnalysis.objects.update_or_create(
                resume=resume,
                defaults={
                    "user": request.user,
                    "summary": analysis_data.get("summary", ""),
                    "skills": analysis_data.get("skills", []),
                    "strengths": analysis_data.get("strengths", []),
                    "missing_skills": analysis_data.get("missing_skills", []),
                    "experience_level": analysis_data.get(
                        "experience_level", ""
                    ),
                    "education": analysis_data.get("education", []),
                    "suggestions": analysis_data.get("suggestions", []),
                },
            )

            serializer = self.get_serializer(analysis)

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
                {"detail": "Resume analysis failed."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class ResumeAnalysisDetailView(generics.RetrieveAPIView):
    serializer_class = ResumeAnalysisSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ResumeAnalysis.objects.filter(
            user=self.request.user
        )

    def get_object(self):
        resume_id = self.kwargs["resume_id"]

        try:
            return self.get_queryset().get(
                resume_id=resume_id
            )
        except ResumeAnalysis.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound(
                "Analysis not found for this resume."
            )