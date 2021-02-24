from rest_framework import serializers
from podminer.models import Ranking, UpdateTaskResult, RankingHistory, UserMetrics
from core.models import Show
from celery.task.control import revoke


class RankingShowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Show
        fields = ['id', 'podcast_id', 'name', 'description',
                  'slug', 'image_link', 'publisher']


class RankingSerializer(serializers.ModelSerializer):
    show_data = RankingShowSerializer(source='show')
    genre = serializers.ReadOnlyField(source='genre.name')
    country = serializers.ReadOnlyField(source='country.name')

    class Meta:
        model = Ranking
        fields = ['show_data', 'country', 'genre',
                  'store_url', 'ranking', 'last_ranking', 'updated']


class RankingHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RankingHistory
        fields = ['ranking', 'updated']


class UpdateResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = UpdateTaskResult
        fields = ['task_id', 'status', 'task_type',
                  'date_created', 'date_done']


class UpdateResultDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = UpdateTaskResult
        fields = ['task_id', 'status', 'task_type',
                  'output', 'date_created', 'date_done']


class UserMetricSerializer(serializers.ModelSerializer):
    username_field = serializers.CharField()

    class Meta:
        model = UserMetrics
        fields = (
            "username_field",
        )


class UserMetricStatsSerializer(serializers.ModelSerializer):
    user_count = serializers.IntegerField()

    class Meta:
        model = UserMetrics
        fields = (
            "date",
            "user_count"
        )
