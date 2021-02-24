import celery
import json
from datetime import timedelta, date,datetime

from django.db import transaction
from django.db.models import Count
from django_celery_results.models import TaskResult

from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status, views
from rest_framework.exceptions import NotFound
from drf_yasg.utils import swagger_auto_schema

from core.models import Show, Country, Genre, User
from podminer.feed import TopShowsFeed, FeedException
from podminer.models import Ranking, UpdateTaskResult, RankingHistory, UserMetrics
from podminer.serializers import RankingSerializer, UpdateResultSerializer, UpdateResultDetailSerializer, RankingHistorySerializer, UserMetricSerializer, UserMetricStatsSerializer  # , TaskAbortSerializer
from podminer.tasks import update_rankings_database, terminator, update_geckoboard, update_episodes_database

from rest_framework import permissions

from celery.task.control import revoke
# Create your views here.
from django.conf import settings

import geckoboard

class TimedAPIMixin:
    def initialize_request(self, request, *args, **kwargs):
        self.time_started = datetime.now()
        return super().initialize_request(request, *args, **kwargs)
    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        time_started = getattr(self, 'time_started', None)
        if time_started:
            time_elapsed = datetime.now() - self.time_started
            time_elapsed=time_elapsed.total_seconds()*1000
            response['supersonic'] = time_elapsed
            response['plot'] = request.path

            APP_ENV = getattr(settings, "APP_ENV", None)
            # print(APP_ENV)
            if APP_ENV != "development":        
                dll=request.path
                fora=""
                for lin in dll:
                    if lin=='/':
                        fora=fora+'_'
                    else:
                        fora=fora+lin

                # print(fora)

                API_KEY = 'ac126939d26650c1f1349b4bc4cab9f2'
                client = geckoboard.client(API_KEY)
                time_taken=time_elapsed
                time_stats=[]
                stats={'dura': time_taken}
                time_stats.append(stats)
                fields={}
                fields['dura']={ 'type': 'duration', 'name': 'Time Taken', "time_unit": "milliseconds", 'optional': False }
                # print('catalog(%s)stats'% request.path)
                dis='catalog%s_stats'% fora
                # print(dis)
                dataset = client.datasets.find_or_create(dis, fields)
                dataset.post(time_stats)

        return response

class StatisticsView(views.APIView):
    def get(self, request):
        show_count = Show.objects.count()
        last_update = TaskResult.objects.order_by('-date_created').first()
        if last_update:
            last_update = last_update.date_created
        return Response(data={
            "show_count": show_count,
            "last_update": last_update,
            "stores_count": 1,
        })


class RankingsView(TimedAPIMixin,generics.ListAPIView):
    queryset = Ranking.objects.all()
    serializer_class = RankingSerializer

    def get_queryset(self):
        queryset = self.queryset

        country_code = self.request.query_params.get("country")
        genre_id = self.request.query_params.get("genre")
        show_id = self.request.query_params.get("show_id")

        if country_code:
            try:
                country = Country.objects.get(country_code=country_code)
                queryset = queryset.filter(country=country)
            except Country.DoesNotExist:
                try:
                    country = Country.objects.get(name=country_code)
                    queryset = queryset.filter(country=country)
                except:
                    raise NotFound()

        if genre_id:
            try:
                genre = Genre.objects.get(name=genre_id)
                queryset = queryset.filter(genre=genre)

            except Genre.DoesNotExist:
                try:
                    genre = Genre.objects.get(genre_id=genre_id)
                    queryset = queryset.filter(genre=genre)
                except:
                    raise NotFound()

        if show_id:
            try:
                show = Show.objects.get(podcast_id=show_id)
                queryset = queryset.filter(show=show)
            except Show.DoesNotExist:
                raise NotFound()

        return queryset

    def get(self, *args, **kwargs):
        return self.list(*args, **kwargs)


class FastRankingsView(TimedAPIMixin,views.APIView):

    def get(self, request):

        country_code = self.request.query_params.get("country")
        genre_id = self.request.query_params.get("genre")
        queryset = Ranking.objects.filter(country__name=country_code, genre__name=genre_id).values(
            'show__id', 'show__podcast_id', 'show__name', 'show__slug', 'store_url', 'ranking', 'last_ranking')
        return Response(queryset)


class RankingHistoryView(TimedAPIMixin,generics.ListAPIView):
    queryset = RankingHistory.objects.all()
    serializer_class = RankingHistorySerializer

    def get_queryset(self):
        queryset = self.queryset

        country_code = self.request.query_params.get("country")
        genre_id = self.request.query_params.get("genre")
        show_id = self.request.query_params.get("show_id")

        if country_code:
            try:
                country = Country.objects.get(country_code=country_code)
                queryset = queryset.filter(country=country)

            except Country.DoesNotExist:
                try:
                    country = Country.objects.get(name=country_code)
                    queryset = queryset.filter(country=country)
                except:
                    raise NotFound()

        if genre_id:
            try:
                genre = Genre.objects.get(name=genre_id)
                queryset = queryset.filter(genre=genre)

            except Genre.DoesNotExist:
                try:
                    genre = Genre.objects.get(genre_id=genre_id)
                    queryset = queryset.filter(genre=genre)
                except:
                    raise NotFound()

        if show_id:
            try:
                show = Show.objects.get(podcast_id=show_id)
                queryset = queryset.filter(show=show)
            except Show.DoesNotExist:
                raise NotFound()

        return queryset

    def get(self, *args, **kwargs):
        return self.list(*args, **kwargs)


class UpdateTaskResultsView(generics.ListAPIView):
    queryset = UpdateTaskResult.objects.all()
    serializer_class = UpdateResultSerializer


class UpdateTaskResultDetailView(generics.RetrieveAPIView):
    queryset = UpdateTaskResult.objects.all()
    serializer_class = UpdateResultDetailSerializer
    lookup_field = 'task_id'


class TaskAbortView(views.APIView):
    def post(self, request, task_id):
        # task_id = request.query_params.get('task_id')
        task = terminator.apply_async(
            kwargs={'task_id': task_id, 'log_errors': True})
        # file_transfer(task_id)
        # revoke(task_id, terminate=True)
        return Response({'task_id': task_id})


class TopShowsView(views.APIView):
    def get(self, request):
        genre_id = request.query_params.get('genre')
        try:
            genre_id = genre_id
            genre = Genre.objects.get(genre_id=genre_id)
        except ValueError:
            try:
                genre = Genre.objects.get(name=genre_id)
            except Genre.DoesNotExist:
                raise NotFound('Genre does not exist')
        except Genre.DoesNotExist:
            raise NotFound('Genre does not exist')

        result = {}
        for country in Country.objects.all():
            top_show = Ranking.objects.filter(
                country=country, genre=genre).order_by('ranking').first()
            result[country.country_code] = RankingSerializer(top_show).data
        return Response(result)


# class RunUpdateTaskView(views.APIView):
#     def get(self, request):
#         task = update_rankings_database.apply_async(
#             kwargs={'task_type': 'manual', 'log_errors': True})
#         return Response({'task_id': task.id})

# class RunUpdateTaskView(views.APIView):
#     def get(self, request):
#         task = update_geckoboard.apply_async(
#             kwargs={'task_type': 'manual', 'log_errors': True})
#         return Response({'task_id': task.id})

class RunUpdateTaskView(views.APIView):
    def get(self, request):
        task = update_episodes_database.apply_async(
            kwargs={'task_type': 'manual', 'log_errors': True})
        return Response({'task_id': task.id})

class UserMetricsView(generics.ListAPIView):
    serializer_class = UserMetricSerializer

    def post(self, request):
        date_today = date.today()
        try:
            user = User.objects.get(
                username=request.data.get('username_field'))
        except User.DoesNotExist:
            return Response({
                'Message': 'User does not exist'
            })
        try:
            user_metrics_for_today = UserMetrics.objects.get(date=date_today)
            user_metrics_for_today.save()
        except UserMetrics.DoesNotExist:
            user_metrics_for_today = UserMetrics(date=date_today)
            user_metrics_for_today.save()
        if (not user.is_superuser) and (not user.is_staff):
            if user not in user_metrics_for_today.users.all():
                user_metrics_for_today.users.add(user)
                user_metrics_for_today.save()

        return Response({
            'Sucess': 'True'
        })


class UserMetricStatsView(generics.ListAPIView):
    serializer_class = UserMetricStatsSerializer
    queryset = UserMetrics.objects.all()

    def get_queryset(self):
        queryset = self.queryset
        start_date = date.today() - timedelta(days=7)
        end_date = date.today() + timedelta(days=1, hours=8)

        queryset = queryset.annotate(user_count=Count('users')).filter(
            date__range=(start_date, end_date)).order_by('date')

        return queryset
