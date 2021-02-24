from django.contrib import admin
from core.models import User, Country, Genre, Show

# Models to unregister first
from django.contrib.auth.models import Group
from django_celery_results.models import TaskResult
from django_celery_beat.models import PeriodicTask, IntervalSchedule, CrontabSchedule, SolarSchedule, ClockedSchedule


admin.site.unregister(Group)
admin.site.unregister(TaskResult)
admin.site.unregister(PeriodicTask)
admin.site.unregister(IntervalSchedule)
admin.site.unregister(CrontabSchedule)
admin.site.unregister(SolarSchedule)
admin.site.unregister(ClockedSchedule)


# Register your models here.
admin.site.register(User)
admin.site.register(Country)
admin.site.register(Genre)
admin.site.register(Show)