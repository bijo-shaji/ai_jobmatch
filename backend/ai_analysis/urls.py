from django.urls import path

from .views import (
    ResumeAnalysisCreateView,
    ResumeAnalysisDetailView,
)


urlpatterns = [
    path(
        "resume/<int:resume_id>/",
        ResumeAnalysisCreateView.as_view(),
        name="resume-analysis",
    ),
    path(
        "resume/<int:resume_id>/result/",
        ResumeAnalysisDetailView.as_view(),
        name="resume-analysis-result",
    ),
]