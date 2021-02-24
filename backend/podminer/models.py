from django.db import models
from core.models import Show, Genre, Country, User
from django_celery_results.models import TaskResult
from django.utils import timezone

# Create your models here.


class Ranking(models.Model):
    show = models.ForeignKey(Show, on_delete=models.RESTRICT)
    genre = models.ForeignKey(Genre, on_delete=models.RESTRICT)
    country = models.ForeignKey(Country, on_delete=models.RESTRICT)
    ranking = models.IntegerField()
    last_ranking = models.IntegerField(default=-1)
    updated = models.DateTimeField(auto_now_add=True)
    store_url = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "podminer_rankings"
        default_related_name = "rankings"
        unique_together = [('country', 'ranking', 'genre')]
        ordering = ['ranking']


class RankingHistory(models.Model):
    show = models.ForeignKey(Show, on_delete=models.RESTRICT)
    genre = models.ForeignKey(Genre, on_delete=models.RESTRICT)
    country = models.ForeignKey(Country, on_delete=models.RESTRICT)
    ranking = models.IntegerField()
    updated = models.DateTimeField(auto_now_add=True)
    store_url = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "podminer_ranking_history"
        default_related_name = "ranking_history"


class UpdateTaskResult(TaskResult):
    output = models.TextField(default="")
    task_type = models.CharField(max_length=100, choices=[('unspecified', 'Unspecified'),
                                                          ('scheduled',
                                                           'Scheduled'),
                                                          ('manual', 'Manual')])

    class Meta:
        db_table = "podminer_update_task_result"


class UserMetrics(models.Model):
    date = models.DateField(primary_key=True)
    users = models.ManyToManyField(User)

    class Meta:
        db_table = "podminer_user_metrics"


class GlobalTop100(models.Model):
    show = models.ForeignKey(Show, on_delete=models.RESTRICT)
    score = models.IntegerField(default=0)
    ranking = models.IntegerField()
    last_ranking = models.IntegerField(default=-1)

    class Meta:
        db_table = "podminer_globaltop100"
        default_related_name = "globaltop100"


class PowerRankingHistory(models.Model):
    show = models.ForeignKey(Show, on_delete=models.RESTRICT)
    score = models.IntegerField(default=0)
    val = models.IntegerField(default=0)
    updated = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "podminer_power_ranking_history"
        default_related_name = "power_ranking_history"


class GenreTop100(models.Model):
    genre = models.ForeignKey(Genre, on_delete=models.RESTRICT)
    show = models.ForeignKey(Show, on_delete=models.RESTRICT)
    score = models.IntegerField(default=0)
    ranking = models.IntegerField()
    last_ranking = models.IntegerField(default=-1)

    class Meta:
        db_table = "podminer_genretop100"
        default_related_name = "genretop100"


class RegionTop100(models.Model):
    region = models.CharField(max_length=100)
    show = models.ForeignKey(Show, on_delete=models.RESTRICT)
    score = models.IntegerField(default=0)
    ranking = models.IntegerField()
    last_ranking = models.IntegerField(default=-1)

    class Meta:
        db_table = "podminer_regiontop100"
        default_related_name = "regiontop100"


class CountryTop100(models.Model):
    country = models.ForeignKey(Country, on_delete=models.RESTRICT)
    show = models.ForeignKey(Show, on_delete=models.RESTRICT)
    score = models.IntegerField(default=0)
    ranking = models.IntegerField()
    last_ranking = models.IntegerField(default=-1)

    class Meta:
        db_table = "podminer_countrytop100"
        default_related_name = "countrytop100"

class BlacklistCountryGenre(models.Model):
    country = models.ForeignKey(Country, on_delete=models.RESTRICT)
    genre = models.ForeignKey(Genre, on_delete=models.RESTRICT)
    
    class Meta:
        db_table = "podminer_bcg"
        default_related_name = "bcg"
