from django.urls import path

from .views import (
    ApplicationDetailView,
    ApplicationListCreateView,
    JobDeleteView,
    JobDescriptionMatchView,
    JobListCreateView,
    JobMatchCreateView,
    JobMatchDetailView,
    JobMatchListView,
)

urlpatterns = [
    path(
        "",
        JobListCreateView.as_view(),
        name="job-list-create",
    ),
    path(
        "applications/",
        ApplicationListCreateView.as_view(),
        name="application-list-create",
    ),
    path(
        "applications/<int:pk>/",
        ApplicationDetailView.as_view(),
        name="application-detail",
    ),
    path(
        "jd-match/",
        JobDescriptionMatchView.as_view(),
        name="job-description-match",
    ),
    path(
        "matches/",
        JobMatchListView.as_view(),
        name="job-match-list",
    ),
    path(
        "<int:job_id>/match/<int:resume_id>/",
        JobMatchCreateView.as_view(),
        name="job-match",
    ),
    path(
        "<int:pk>/",
        JobDeleteView.as_view(),
        name="job-delete",
    ),
    path(
        "match/<int:pk>/",
        JobMatchDetailView.as_view(),
        name="job-match-detail",
    ),
]

