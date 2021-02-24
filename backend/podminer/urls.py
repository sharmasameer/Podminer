from django.contrib import admin
from django.urls import path
from podminer import views, external_views

urlpatterns = [
    path('stats', views.StatisticsView.as_view(), name='statistics'),
    path('rankings', views.RankingsView.as_view(), name='rankings'),
    path('fastrankings', views.FastRankingsView.as_view(), name='fastrankings'),
    path('history', views.RankingHistoryView.as_view(), name='rankings'),
    path('top-by-country', views.TopShowsView.as_view(), name='top-shows-by-country'),
    path('rankings/update', views.RunUpdateTaskView.as_view(), name='update-rankings'),
    path('tasks', views.UpdateTaskResultsView.as_view(), name='update-tasks'),
    path('tasks/<str:task_id>', views.UpdateTaskResultDetailView.as_view(), name='update-task-detail'),
    path('tasks-abort/<str:task_id>', views.TaskAbortView.as_view(), name='tasks-abort'),
    path('user-metrics', views.UserMetricsView.as_view(), name='user-metrics'),
    path('user-metrics/stats', views.UserMetricStatsView.as_view(), name='user-metrics'),

    path('rankings/short', external_views.RankingsViewShort.as_view(), name='rankings-short'),

]
