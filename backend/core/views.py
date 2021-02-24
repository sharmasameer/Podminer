import random
import re
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from datetime import datetime, timedelta, timezone
from rest_framework import views
from rest_framework import permissions
from rest_framework import status
from rest_framework.response import Response
from django.http import JsonResponse, HttpResponse
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.http import HttpResponsePermanentRedirect
import os
from django.db.models import Q, ExpressionWrapper, BooleanField, Count
from functools import reduce
from rest_framework import filters

from core.models import User
from core import permissions as core_permissions
from core.serializers import UserSerializer, ResetPasswordEmailRequestSerializer, SetNewPasswordSerializer
from core.models import Genre, Country, Show
from core.serializers import CountrySerializer, GenreSerializer, ShowSerializer, UserSerializer, MyTokenObtainPairSerializer, SettingsSerializer, ShowsFollowedHistorySerializer, ReportSettingsSerializer

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import smart_str, force_str, smart_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from .utils import Util
from podminer.models import RankingHistory, Ranking, GlobalTop100,PowerRankingHistory, GenreTop100, RegionTop100, CountryTop100
from itertools import groupby
from operator import itemgetter
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, IsAuthenticatedOrTokenHasScope
from oauth2_provider.contrib.rest_framework import OAuth2Authentication

from reportlab.graphics.charts.linecharts import HorizontalLineChart
from reportlab.graphics.widgets.markers import makeMarker
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics import renderPDF
from reportlab.graphics.shapes import *
from reportlab.platypus.tables import Table
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import requests
import textwrap
import json
from core.utils import Util2
import io

import plotly.graph_objects as go

from django.http import FileResponse

from wsgiref.util import FileWrapper

import geckoboard

from django.conf import settings


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

# Oauth2 users view
class UsersOauthView(generics.ListCreateAPIView):
    authentication_classes = [OAuth2Authentication]
    permission_classes = [permissions.IsAuthenticated,
                          core_permissions.IsAdmin, TokenHasReadWriteScope]
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Oauth2 user detail view


class UserOauthDetailView(generics.RetrieveUpdateDestroyAPIView):
    lookup_field = 'username'
    lookup_url_kwarg = 'username'
    authentication_classes = [OAuth2Authentication]
    permission_classes = [permissions.IsAuthenticated, TokenHasReadWriteScope]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_object(self):
        return self.request.user


class UsersView(generics.ListCreateAPIView):
    permission_classes = [
        permissions.IsAuthenticated, core_permissions.IsAdmin]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class SettingsView(generics.UpdateAPIView):
    lookup_field = 'id'
    lookup_url_kwarg = 'id'
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = SettingsSerializer

    def update(self, *args, **kwargs):
        user_object = self.get_object()
        return super().update(*args, **kwargs)


class ReportSettingsView(generics.UpdateAPIView):
    lookup_field = 'id'
    lookup_url_kwarg = 'id'
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = ReportSettingsSerializer

    def update(self, *args, **kwargs):
        user_object = self.get_object()
        return super().update(*args, **kwargs)


class ReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, ]

    def get(self, request):
        print("woaah")
        print(request.user.username)
        show_id = request.query_params.get('show_id')
        # report generation and mailing
        # |-----------------------------------------------------------------------------------|
        if True:
            # user_set=User.objects.filter(report_status=1)
            # for ins in user_set:
            if True:
                ins = request.user
                # print(ins.username)
                # print(ins.email)
                ins_shows = ins.report_followed.all()
                email_body = 'Hi, Download them below:'
                datarr = {'email_body': email_body, 'to_email': ins.email,
                          'email_subject': '[Pikkal]These are your monthly reports for Pikkal Apple Podcasts'}
                queryset = []
                # for ins2 in ins_shows:
                # print(ins2.name)
                ins2 = Show.objects.get(podcast_id=show_id)

                months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                x_axis = []
                y_axis = []
                valgen = []
                allgen = Genre.objects.all()
                for gen in allgen:
                    if RankingHistory.objects.filter(show__podcast_id=ins2.podcast_id, country__name='Singapore', genre__name=gen.name).exists():
                        valgen.append(gen.name)
                valgen.sort()
                thisgen = "Management"
                if len(valgen) >= 1:
                    thisgen = valgen[-1]
                rr = requests.get(
                    'http://app0api.pikkalfm.com/podminer/history?country=Singapore&genre='+thisgen+'&show_id='+str(ins2.podcast_id))
                data_for_chart = rr.json()
                for data in data_for_chart:
                    y_axis.append(data['ranking'])
                    mon = int(data['updated'][5:7])
                    day = int(data['updated'][8:10])
                    x_axis.append("{} {}".format(months[mon-1], day))

                fig = go.Figure()
                fig.add_trace(go.Scatter(x=x_axis, y=y_axis, mode="lines+markers",
                                         line=dict(color='firebrick', width=2)))
                fig['layout']['yaxis']['autorange'] = "reversed"

                fig.update_layout(
                    xaxis_title='Day',
                    yaxis_title='Rankings',
                    autosize=False,
                    width=1000,
                    height=500,
                    margin=dict(
                        l=60,
                        r=40,
                        b=50,
                        t=50,
                        pad=5
                    ),
                    paper_bgcolor="White"
                )

                # fig.show()
                if not os.path.exists("images"):
                    os.mkdir("images")

                fig.write_image("images/fig1.png")

                # Create a file-like buffer to receive PDF data.
                buffer = io.BytesIO()

                # Create the PDF object, using the buffer as its "file."
                # p = canvas.Canvas(buffer)

                payload = {'show_id': ins2.podcast_id}
                r = requests.get(
                    'http://app0api.pikkalfm.com/podminer/rankings', params=payload)
                data_for_header = r.json()
                data_for_table = r.json()
                data_for_header = data_for_header[0]['show_data']
                title = data_for_header['name']
                desc = data_for_header['description']
                img = data_for_header['image_link']
                img = img.split('170x170bb.png')
                img = img[0] + '500x500bb.png'
                table_data = []
                ctr = 0
                for item in data_for_table:
                    if ctr < 10:
                        table_data.append(
                            ["{}".format(item['ranking']), "{} | {}".format(item['country'], item['genre'])])
                    else:
                        break
                    ctr = ctr + 1

                c = canvas.Canvas(buffer, pagesize=A4)
                c.setTitle(ins2.name)
                # generatePDF(c)
                width, height = A4
                # Podcast image
                c.drawImage(img, 25, height-225, 200, 200)

                # Podcast title
                c.setFont('Helvetica', 18)
                title_wrapper = textwrap.TextWrapper(width=40)  # Text wrapper
                word_list = title_wrapper.wrap(text=title)
                count = 0
                for element in word_list:
                    c.drawString(250, height-50-count, element)
                    count += 20
                # Podcast description
                c.setFont('Helvetica', 14)
                desc_wrapper = textwrap.TextWrapper(width=48)  # Text wrapper
                word_list = desc_wrapper.wrap(text=desc)
                count = 0
                for element in word_list:
                    if count > 120:
                        c.drawString(250, height-100-count, '[...]')
                        break
                    c.drawString(250, height-100-count, element)
                    count += 15

                # Timestamp of report
                x = datetime.now()
                c.drawString(
                    25, height-280, f"This report was generated by Pikkal & Co. on {x.strftime('%a')}, {x.strftime('%b')} {x.strftime('%d')}.")

                # Partition line
                c.setLineWidth(2)
                c.line(25, height-310, width-25, height-310)

                # Insert chart image
                c.setFont('Helvetica', 16)
                c.drawString(
                    25, height-350, "Historical Rankings for Singapore | "+thisgen)
                c.drawImage('images/fig1.png', 25, 180, width-50, 300)

                # Partition line
                c.setLineWidth(2)
                c.line(25, 120, width-25, 120)

                # New page for chart
                c.showPage()

                # Table
                mt = height - 50
                c.setFont('Helvetica', 18)
                c.drawString(25, mt+10, 'Top 10 Stores')
                c.setFont('Helvetica', 16)
                c.setLineWidth(1)
                c.line(25, mt-10, width-25, mt-10)
                c.drawString(35, mt-35, 'Rank')
                c.drawString(150, mt-35, 'Apple Podcast Stores')
                c.line(25, mt-50, width-25, mt-50)
                c.setFont('Helvetica', 14)
                count = 0
                extra = 0
                for data in table_data:
                    count += 20
                    c.drawString(40, mt-50-count-extra, data[0])
                    c.drawString(150, mt-50-count-extra, data[1])
                    c.line(25, mt-60-count-extra, width-25, mt-60-count-extra)
                    extra += 15
                c.line(25, mt-10, 25, mt-60-count-extra+15)
                c.line(100, mt-10, 100, mt-60-count-extra+15)
                c.line(width-25, mt-10, width-25, mt-60-count-extra+15)

                mt = mt-60-count-extra-20
                # Partition line
                c.setLineWidth(2)
                c.line(25, mt, width-25, mt)

                # Link to Podminer
                info = "For detailed Podcast analysis, visit "
                c.drawString(25, mt-40, info)
                hostname = "Pikkal & Co."
                hostlink = "https://www.pikkal.com/"
                c.saveState()
                c.setFillColorRGB(0, 0, 1)
                c.drawString(25 + c.stringWidth(info), mt-40, hostname)
                linkRect = (25 + c.stringWidth(info), mt-45,
                            25 + c.stringWidth(info) + c.stringWidth(hostname), mt-25)
                c.linkURL(hostlink, linkRect)
                c.restoreState()

                c.showPage()
                c.save()

                buffer.seek(0)
                # return FileResponse(buffer, as_attachment=True, filename='hello.pdf')
                return HttpResponse(FileWrapper(buffer))
                # queryset.append({'attname': ins2.slug, 'att': buffer.getvalue()})

                # datarr['qq'] = queryset
                # Util2.send_email(datarr)
        # |-----------------------------------------------------------------------------------|
        return Response({
            'queryset': []
        })


class ReportNowView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, ]

    def get(self, request):
        print("bruh")
        print(request.user.username)
        show_id = request.query_params.get('show_id')
        # report generation and mailing
        # |-----------------------------------------------------------------------------------|
        if True:
            # user_set=User.objects.filter(report_status=1)
            # for ins in user_set:
            if True:
                ins = request.user
                # print(ins.username)
                # print(ins.email)
                ins2 = Show.objects.get(podcast_id=show_id)
                ins_shows = ins.report_followed.all()
                email_body = 'Hi '+request.user.first_name+' '+request.user.last_name+',\n'
                email_body = email_body+'I am sharing with you the monthly report for '+ins2.name
                email_body = email_body+"'s Apple Podcast rankings. The report is as of " + \
                    str(datetime.today().date())+".\n"
                email_body = email_body + \
                    "Let me know if you have any questions. You can contact me at ps@pikkal.com.\nThank you!\n"
                datarr = {'email_body': email_body, 'to_email': ins.email,
                          'email_subject': 'Monthly Podcast Rankings for '+ins2.name}
                queryset = []
                # for ins2 in ins_shows:
                # print(ins2.name)

                months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                x_axis = []
                y_axis = []
                valgen = []
                allgen = Genre.objects.all()
                for gen in allgen:
                    if RankingHistory.objects.filter(show__podcast_id=ins2.podcast_id, country__name='Singapore', genre__name=gen.name).exists():
                        valgen.append(gen.name)
                valgen.sort()
                thisgen = "Management"
                if len(valgen) >= 1:
                    thisgen = valgen[-1]
                rr = requests.get(
                    'http://app0api.pikkalfm.com/podminer/history?country=Singapore&genre='+thisgen+'&show_id='+str(ins2.podcast_id))
                data_for_chart = rr.json()
                for data in data_for_chart:
                    y_axis.append(data['ranking'])
                    mon = int(data['updated'][5:7])
                    day = int(data['updated'][8:10])
                    x_axis.append("{} {}".format(months[mon-1], day))

                fig = go.Figure()
                fig.add_trace(go.Scatter(x=x_axis, y=y_axis, mode="lines+markers",
                                         line=dict(color='firebrick', width=2)))
                fig['layout']['yaxis']['autorange'] = "reversed"

                fig.update_layout(
                    xaxis_title='Day',
                    yaxis_title='Rankings',
                    autosize=False,
                    width=1000,
                    height=500,
                    margin=dict(
                        l=60,
                        r=40,
                        b=50,
                        t=50,
                        pad=5
                    ),
                    paper_bgcolor="White"
                )

                # fig.show()
                if not os.path.exists("images"):
                    os.mkdir("images")

                fig.write_image("images/fig1.png")

                # Create a file-like buffer to receive PDF data.
                buffer = io.BytesIO()

                # Create the PDF object, using the buffer as its "file."
                # p = canvas.Canvas(buffer)

                payload = {'show_id': ins2.podcast_id}
                r = requests.get(
                    'http://app0api.pikkalfm.com/podminer/rankings', params=payload)
                data_for_header = r.json()
                data_for_table = r.json()
                data_for_header = data_for_header[0]['show_data']
                title = data_for_header['name']
                desc = data_for_header['description']
                img = data_for_header['image_link']
                img = img.split('170x170bb.png')
                img = img[0] + '500x500bb.png'
                table_data = []
                ctr = 0
                for item in data_for_table:
                    if ctr < 10:
                        table_data.append(
                            ["{}".format(item['ranking']), "{} | {}".format(item['country'], item['genre'])])
                    else:
                        break
                    ctr = ctr + 1

                c = canvas.Canvas(buffer, pagesize=A4)
                # generatePDF(c)
                width, height = A4
                # Podcast image
                c.drawImage(img, 25, height-225, 200, 200)

                # Podcast title
                c.setFont('Helvetica', 18)
                title_wrapper = textwrap.TextWrapper(width=40)  # Text wrapper
                word_list = title_wrapper.wrap(text=title)
                count = 0
                for element in word_list:
                    c.drawString(250, height-50-count, element)
                    count += 20
                # Podcast description
                c.setFont('Helvetica', 14)
                desc_wrapper = textwrap.TextWrapper(width=48)  # Text wrapper
                word_list = desc_wrapper.wrap(text=desc)
                count = 0
                for element in word_list:
                    if count > 120:
                        c.drawString(250, height-100-count, '[...]')
                        break
                    c.drawString(250, height-100-count, element)
                    count += 15

                # Timestamp of report
                x = datetime.now()
                c.drawString(
                    25, height-280, f"This report was generated by Pikkal & Co. on {x.strftime('%a')}, {x.strftime('%b')} {x.strftime('%d')}.")

                # Partition line
                c.setLineWidth(2)
                c.line(25, height-310, width-25, height-310)

                # Insert chart image
                c.setFont('Helvetica', 16)
                c.drawString(
                    25, height-350, "Historical Rankings for Singapore | "+thisgen)
                c.drawImage('images/fig1.png', 25, 180, width-50, 300)

                # Partition line
                c.setLineWidth(2)
                c.line(25, 120, width-25, 120)

                # New page for chart
                c.showPage()

                # Table
                mt = height - 50
                c.setFont('Helvetica', 18)
                c.drawString(25, mt+10, 'Top 10 Stores')
                c.setFont('Helvetica', 16)
                c.setLineWidth(1)
                c.line(25, mt-10, width-25, mt-10)
                c.drawString(35, mt-35, 'Rank')
                c.drawString(150, mt-35, 'Apple Podcast Stores')
                c.line(25, mt-50, width-25, mt-50)
                c.setFont('Helvetica', 14)
                count = 0
                extra = 0
                for data in table_data:
                    count += 20
                    c.drawString(40, mt-50-count-extra, data[0])
                    c.drawString(150, mt-50-count-extra, data[1])
                    c.line(25, mt-60-count-extra, width-25, mt-60-count-extra)
                    extra += 15
                c.line(25, mt-10, 25, mt-60-count-extra+15)
                c.line(100, mt-10, 100, mt-60-count-extra+15)
                c.line(width-25, mt-10, width-25, mt-60-count-extra+15)

                mt = mt-60-count-extra-20
                # Partition line
                c.setLineWidth(2)
                c.line(25, mt, width-25, mt)

                # Link to Podminer
                info = "For detailed Podcast analysis, visit "
                c.drawString(25, mt-40, info)
                hostname = "Pikkal & Co."
                hostlink = "https://www.pikkal.com/"
                c.saveState()
                c.setFillColorRGB(0, 0, 1)
                c.drawString(25 + c.stringWidth(info), mt-40, hostname)
                linkRect = (25 + c.stringWidth(info), mt-45,
                            25 + c.stringWidth(info) + c.stringWidth(hostname), mt-25)
                c.linkURL(hostlink, linkRect)
                c.restoreState()

                c.showPage()
                c.save()

                buffer.seek(0)

                queryset.append(
                    {'attname': ins2.slug, 'att': buffer.getvalue()})

                datarr['qq'] = queryset
                Util2.send_email(datarr)
        # |-----------------------------------------------------------------------------------|
        return Response({
            'queryset': []
        })


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    lookup_field = 'id'
    lookup_url_kwarg = 'id'
    permission_classes = [
        permissions.IsAuthenticated, core_permissions.IsAdmin]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def delete(self, *args, **kwargs):
        user_object = self.get_object()

        # Disallow removing of the Super User
        if user_object.is_superuser:
            return Response({'error': 'Cannot remove superuser'}, status=status.HTTP_403_FORBIDDEN)
        else:
            return super().delete(*args, **kwargs)

    def put(self, *args, **kwargs):
        user_object = self.get_object()

        # Disallow updating of the Super User
        if user_object.is_superuser:
            return Response({'error': 'Cannot change superuser'}, status=status.HTTP_403_FORBIDDEN)
        else:
            return super().update(*args, **kwargs)


class MediumPagination(PageNumberPagination):
    page_size_query_param = 'page_size'


class GenresView(generics.ListAPIView):
    serializer_class = GenreSerializer
    queryset = Genre.objects.all()


class CountriesView(generics.ListAPIView):
    serializer_class = CountrySerializer
    queryset = Country.objects.all()


class FCountriesFilterView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, ]

    def get(self, request):
        queryset = set()
        followed_shows = request.user.shows_followed.all()

        for show in followed_shows:
            ranking_queryset = show.rankings.all()
            for rnk in ranking_queryset:
                cou = rnk.country
                queryset.add(frozenset({cou.country_code, cou.name}))

        return Response({
            'queryset': queryset
        })


class FGenresFilterView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, ]

    def get(self, request):
        queryset = set()
        followed_shows = request.user.shows_followed.all()
        country = None
        country_name = request.query_params.get('country')
        if country_name:
            country = Country.objects.get(name=country_name)

        for show in followed_shows:
            ranking_queryset = show.rankings.all().filter(country=country)
            for rnk in ranking_queryset:
                gen = rnk.genre
                queryset.add(frozenset({gen.genre_id, gen.name}))

        return Response({
            'queryset': queryset
        })


class RegionsView(views.APIView):

    def get(self, request):
        region_queryset0 = ['Africa', 'Asia Pacific', 'Europe',
                            'North America', 'Latin America', 'Middle East', 'Southeast Asia']
        region_queryset = []
        for con in region_queryset0:
            region_queryset.append({"regionname": con})
        return Response({
            'queryset': region_queryset
        })


class RegionTop100View(TimedAPIMixin,views.APIView):

    def get(self, request):
        region_name = request.query_params.get('regionname')
        region=region_name
        queryset2=RegionTop100.objects.filter(region=region).order_by('ranking')
        queryset=[]
        for ins in queryset2:
            box={}
            box['show__id']=ins.show.id
            box['show__podcast_id']=ins.show.podcast_id
            box['show__name']=ins.show.name
            box['show__slug']=ins.show.slug
            box['show__url']=ins.show.url
            box['score']=ins.score
            box['place']=ins.ranking
            box['lastplace']=ins.last_ranking
            queryset.append(box)
        return Response({
            'queryset': queryset
        })


class GenreTop100View(TimedAPIMixin,views.APIView):

    def get(self, request):
        genre_id = request.query_params.get('genre_id')
        genre=Genre.objects.get(genre_id=genre_id)
        queryset2=GenreTop100.objects.filter(genre=genre).order_by('ranking')
        queryset=[]
        for ins in queryset2:
            box={}
            box['show__id']=ins.show.id
            box['show__podcast_id']=ins.show.podcast_id
            box['show__name']=ins.show.name
            box['show__slug']=ins.show.slug
            box['show__url']=ins.show.url
            box['score']=ins.score
            box['place']=ins.ranking
            box['lastplace']=ins.last_ranking
            queryset.append(box)
        return Response({
            'queryset': queryset
        })

class CountryTop100View(TimedAPIMixin,views.APIView):

    def get(self, request):
        country_name = request.query_params.get('country_name')
        country=Country.objects.get(country_code=country_name)
        queryset2=CountryTop100.objects.filter(country=country).order_by('ranking')
        queryset=[]
        for ins in queryset2:
            box={}
            box['show__id']=ins.show.id
            box['show__podcast_id']=ins.show.podcast_id
            box['show__name']=ins.show.name
            box['show__slug']=ins.show.slug
            box['show__url']=ins.show.url
            box['score']=ins.score
            box['place']=ins.ranking
            box['lastplace']=ins.last_ranking
            queryset.append(box)
        return Response({
            'queryset': queryset
        })


class GlobalTop100View(TimedAPIMixin,views.APIView):

    def get(self, request):
        queryset2=GlobalTop100.objects.all().order_by('ranking')
        queryset=[]
        for ins in queryset2:
            box={}
            box['show__id']=ins.show.id
            box['show__podcast_id']=ins.show.podcast_id
            box['show__name']=ins.show.name
            box['show__slug']=ins.show.slug
            box['show__url']=ins.show.url
            box['score']=ins.score
            box['place']=ins.ranking
            box['lastplace']=ins.last_ranking
            queryset.append(box)
        return Response({
            'queryset': queryset
        })

def myFunc(e):
    return e['jump']

class HotFireView(TimedAPIMixin,views.APIView):

    def get(self, request):
        queryset2=GlobalTop100.objects.all().order_by('ranking')
        queryset=[]
        
        for ins in queryset2:
            if ins.last_ranking-ins.ranking>=5:
                box={}
                box['show__id']=ins.show.id
                box['show__podcast_id']=ins.show.podcast_id
                box['show__name']=ins.show.name
                box['show__slug']=ins.show.slug
                box['show__url']=ins.show.url
                box['score']=ins.score
                box['place']=ins.ranking
                box['lastplace']=ins.last_ranking
                box['jump']=ins.last_ranking-ins.ranking
                queryset.append(box)
        queryset.sort(reverse=True,key=myFunc)
        return Response({
            'queryset': queryset
        })


class FastPowerRankingsHistoryView(TimedAPIMixin,views.APIView):

    def get(self, request):

        show_id = request.query_params.get('show_id')
        tod_date = datetime.now(timezone.utc).date()-timedelta(days=31)
        queryset2=PowerRankingHistory.objects.filter(show__podcast_id=show_id,updated__date__gt=tod_date).order_by('updated')
        month_change=queryset2.last().val-queryset2.first().val
        month_high=0
        queryset=[]
        for ins in queryset2:
            box={}
            box['show__podcast_id']=ins.show.podcast_id
            box['updated__date']=ins.updated.date()
            box['score']=ins.score
            box['val']=ins.val
            queryset.append(box)
            month_high=max(month_high,ins.val)

        return Response({
            'queryset': queryset, 'month_change': month_change, 'month_high': month_high
        })


class ShowsView(TimedAPIMixin,generics.ListAPIView, PageNumberPagination):
    search_fields = ['name']
    filter_backends = (filters.SearchFilter,)
    pagination_class = MediumPagination
    serializer_class = ShowSerializer

    def get_queryset(self):
        show_search_string = self.request.query_params.get('search')
        queryset = Show.objects.all()  # .order_by('name')
        if show_search_string:
            expression = Q(name__istartswith=show_search_string +
                           " ") | Q(name__icontains=" "+show_search_string)
            is_match = ExpressionWrapper(
                expression, output_field=BooleanField())
            queryset = queryset.annotate(my_field=is_match)
            queryset = queryset.order_by('-my_field')
            return queryset
        else:
            return queryset


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class ShowsFollowedView(TimedAPIMixin,views.APIView):
    permission_classes = [permissions.IsAuthenticated, ]

    def get(self, request):
        followed_shows = request.user.shows_followed.all().values()
        report_shows = request.user.report_followed.all()
        queryset = []
        for ins in followed_shows:
            ins2 = ins
            if report_shows.filter(id=ins['id']).count():
                ins2['report_status'] = 1
            else:
                ins2['report_status'] = 2
            queryset.append(ins2)

        return Response({
            'followed_shows': queryset
        })

    def post(self, request):
        show_id = request.data.get('id')
        report_status = request.data.get('report_status')

        if report_status:
            if not show_id:
                return Response({'error': "(Report)Show ID Required"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                show = Show.objects.get(id=show_id)
            except Show.DoesNotExist:
                return Response({'error': "(Report)Show Not Found"}, status=status.HTTP_404_NOT_FOUND)

            request.user.report_followed.add(show)
            return Response({
                "followed_report": request.user.report_followed.all().values_list('id', flat=True)
            })

        if not show_id:
            return Response({'error': "Show ID Required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            show = Show.objects.get(id=show_id)
        except Show.DoesNotExist:
            return Response({'error': "Show Not Found"}, status=status.HTTP_404_NOT_FOUND)

        request.user.shows_followed.add(show)
        return Response({
            "followed_shows": request.user.shows_followed.all().values_list('id', flat=True)
        })

    def delete(self, request):
        show_id = request.data.get('id')
        report_status = request.data.get('report_status')

        if report_status:
            if not show_id:
                return Response({'error': "(Report)Show ID Required"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                show = Show.objects.get(id=show_id)
            except Show.DoesNotExist:
                return Response({'error': "(Report)Show Not Found"}, status=status.HTTP_404_NOT_FOUND)

            if request.user.report_followed.all().filter(id=show_id).count():
                request.user.report_followed.remove(show)
            else:
                return Response({'error': "(Report)Show not found"}, status=status.HTTP_400_BAD_REQUEST)
            return Response({
                "followed_report": request.user.report_followed.all().values_list('id', flat=True)
            })

        if not show_id:
            return Response({'error': "Show ID Required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            show = Show.objects.get(id=show_id)
        except Show.DoesNotExist:
            return Response({'error': "Show not found"}, status=status.HTTP_400_BAD_REQUEST)
        if show in request.user.shows_followed.all():
            request.user.shows_followed.remove(show)
            if request.user.report_followed.all().filter(id=show_id).count():
                request.user.report_followed.remove(show)
        else:
            return Response({'error': "Show not found"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            "followed_shows": request.user.shows_followed.all().values_list('id', flat=True)
        })


class ShowsFollowedHistoryView(TimedAPIMixin,views.APIView):
    permission_classes = [permissions.IsAuthenticated, ]

    def get(self, request):
        followed_shows = request.user.shows_followed.all()
        history_grouped = {}
        country = None
        genre = None

        country_name = request.query_params.get('country')
        if country_name:
            country = Country.objects.get(name=country_name)

        genre_name = request.query_params.get('genre')
        if genre_name:
            genre = Genre.objects.get(name=genre_name)

        for show in followed_shows:
            history_queryset = show.ranking_history.all()
            if country:
                history_queryset = history_queryset.filter(country=country)
            if genre:
                history_queryset = history_queryset.filter(genre=genre)
            history_grouped[show.id] = ShowsFollowedHistorySerializer(
                history_queryset, many=True).data
        return Response(history_grouped)

class FollowedShowsPRHistoryView(TimedAPIMixin,views.APIView):
    permission_classes = [permissions.IsAuthenticated, ]
    
    def get(self, request):
        followed_shows = request.user.shows_followed.all()
        history_grouped = {}

        for show in followed_shows:
            queryset2=PowerRankingHistory.objects.filter(show__podcast_id=show.podcast_id).order_by('updated')
            queryset=[]
            for ins in queryset2:
                box={}
                box['show__podcast_id']=ins.show.podcast_id
                box['updated__date']=ins.updated.date()
                box['score']=ins.score
                queryset.append(box)
            history_grouped[show.id] = queryset
        return Response(history_grouped)

class RequestPasswordResetEmail(generics.GenericAPIView):
    serializer_class = ResetPasswordEmailRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)

        email = request.data.get('email', '')

        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            uidb64 = urlsafe_base64_encode(smart_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)
            current_site = get_current_site(
                request=request).domain
            # relativeLink = reverse(
            # 'password-reset-confirm', kwargs={'uidb64': uidb64, 'token': token})
            # redirect_url = request.data.get('redirect_url', '')

            # CHANGE THE URL LINK FOR THE FRONTEND FOR DIFFERENT ENVIRONMENT
            url_frontend = request.data.get('url', '')
            absurl = url_frontend[:-6] + '/forgotpassword/' + uidb64+'/'+token
            email_body = 'Hello, \n Use link below to reset your password  \n' + \
                absurl
            data = {'email_body': email_body, 'to_email': user.email,
                    'email_subject': 'Reset your passsword'}
            Util.send_email(data)
            return Response({'success': 'We have sent you a link to reset your password'}, status=status.HTTP_200_OK)
        else:
            return Response({'notfound': 'No users found'}, status=status.HTTP_400_BAD_REQUEST)


class PasswordTokenCheckAPI(generics.GenericAPIView):
    serializer_class = SetNewPasswordSerializer

    def get(self, request, uidb64, token):

        redirect_url = request.GET.get('redirect_url')

        try:
            id = smart_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                if len(redirect_url) > 3:
                    return CustomRedirect(redirect_url+'?token_valid=False')
                else:
                    return CustomRedirect(os.environ.get('FRONTEND_URL', '')+'?token_valid=False')
            else:
                return Response({"sucess": True, "message": "Credentials Valid", "uidb64": uidb64, "token": token})

        except DjangoUnicodeDecodeError as identifier:
            try:
                if not PasswordResetTokenGenerator().check_token(user):
                    return CustomRedirect(redirect_url+'?token_valid=False')

            except UnboundLocalError as e:
                return Response({'error': 'Token is not valid, please request a new one'}, status=status.HTTP_400_BAD_REQUEST)


class SetNewPasswordAPIView(generics.GenericAPIView):
    serializer_class = SetNewPasswordSerializer

    def patch(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({'success': True, 'message': 'Password reset success'}, status=status.HTTP_200_OK)


class CustomRedirect(HttpResponsePermanentRedirect):

    allowed_schemes = [os.environ.get('APP_SCHEME'), 'http', 'https']


class CountryFilterGenre(views.APIView):

    def get(self, request):
        country_set = Country.objects.all()
        queryset = []
        for countr in country_set:
            if Ranking.objects.filter(country__country_code=countr.country_code).exists():
                queryset.append(
                    {'country_code': countr.country_code, 'country_name': countr.name})

        return Response({
            'queryset': queryset
        })
