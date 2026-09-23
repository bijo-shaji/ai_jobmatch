from django.urls import path

from .views import ResumeDeleteView, ResumeListCreateView


urlpatterns = [
    path("", ResumeListCreateView.as_view(), name="resume-list-create"),
    path(
        "<int:pk>/",
        ResumeDeleteView.as_view(),
        name="resume-delete",
    ),
]