import sys
import traceback
import datetime

from django.db import transaction
from django.db.models import Count

from core.models import Country, Show, Genre, User
from podminer.models import Ranking, RankingHistory, UpdateTaskResult, GlobalTop100, PowerRankingHistory, GenreTop100, RegionTop100, CountryTop100, BlacklistCountryGenre
from podminer.feed import TopShowsFeed, FeedException
from celery import shared_task

import io
from core.utils import Util2

import json
from django.db.models import Q

# import celery
from celery.task.control import revoke
# import textwrap

import requests
# from reportlab.lib.pagesizes import A4
# from reportlab.pdfgen import canvas
# from reportlab.platypus.tables import Table
# from reportlab.graphics.shapes import *
# from reportlab.graphics import renderPDF
# from reportlab.graphics.charts.lineplots import LinePlot
# from reportlab.graphics.widgets.markers import makeMarker
# from reportlab.graphics.charts.linecharts import HorizontalLineChart

# import plotly.graph_objects as go

import xmltodict

import time
import geckoboard
# @transaction.atomic
# def update_existing_shows(country, genre):
#     feed = TopShowsFeed(country=country, genre=genre)
#     shows_record = []

#     data = feed.fetch()
#     for show_data in data:
#         podcast_id = show_data['podcast_id']
#         try:
#             show = Show.objects.get(podcast_id=podcast_id)
#             show.publisher = show_data['publisher']
#             show.save()
#             shows_record.append(show)
#         except Show.DoesNotExist:
#             pass

#     return (shows_record, feed.errors)



import faster_than_requests as req

@shared_task(bind=True)
def update_episodes_database(self, task_type="unspecified", log_errors=True):


    output = ""
    output += f"Task: {self.request.id} \n"
    output += f"BeginEpisodes!\n"

    task_result = UpdateTaskResult(task_id=self.request.id)
    task_result.output = output
    task_result.task_type = task_type
    task_result.save()
    counter=0
    pounter=0
    # total=0
    
    for ins in Show.objects.all():
        # ins=insp.show
        podcast_id=ins.podcast_id


        # output+="\n"+str(podcast_id)+"\n"
        # task_result.output = output
        # task_result.save()


        if ins.feed_url == "no-url":
            continue
        

        # output+="\n"+str(ins.releaseDate)+"\n"
        # output+="\n"+str(ins.releaseDate.year)+"\n"
        # output+="\n"+str(ins.releaseDate.month)+"\n"
        # output+="\n"+str(ins.releaseDate.day)+"\n"
        # task_result.output = output
        # task_result.save()

        if ins.releaseDate.year==1700 and ins.releaseDate.month==1 and ins.releaseDate.day==1:
            djkljf = 1
        else:
            continue

        # pounter+= 1
        # if pounter %100 == 0:
        output+="\n"+str(podcast_id)+"\n"
        task_result.output = output
        task_result.save()

            # counter+=1
            # if counter<=500:
            #     output+="\n"+str(ins.feed_url)+"\n"
        # else:
        #     pounter+=1
        # total+=1
        # continue
        
        try:
            response = req.get2json(f'https://itunes.apple.com/lookup?id={podcast_id}')
            response = json.loads(response)
            # output+="\n"+str(response)+"\n"
            # task_result.output = output
            # task_result.save()
            
        except Exception as e:
            # output+="\n"+str(e)+"\n"
            # task_result.output = output
            # task_result.save()
            continue

       
        

       
        try:
            # output+="\n"+str(ins.feed_url)+"\n"
            # task_result.output = output
            # task_result.save()
            # if ins.feed_url=="no-url":
            #     counter+=1
            show_feed_url = response['results'][0]['feedUrl']
                # output+="\n"+str(show_feed_url)+"\n"
                # task_result.output = output
                # task_result.save()
            ins.feed_url=show_feed_url
            ins.save()
            output+="   "+"S"+"   "
            task_result.output = output
            task_result.save()
        except Exception as e:
            # ins.feed_url="no-url"
            # ins.save()
            # output+="\n"+str(e)+"\n"
            # task_result.output = output
            # task_result.save()
            continue
        

        continue

       

        show_feed_url=ins.feed_url
        try:
            response1 = req.get2str(show_feed_url)   
            # output+="\n"+str(response1)+"\n"
            # task_result.output = output
            # task_result.save() 
        except Exception as e:
            output+="\n"+"getting response text from feed url"+"\n"
            output+="\n"+str(e)+"\n\n\n"
            task_result.output = output
            task_result.save()
            continue
        
        # break
        
        try:
            feed_parsedp = json.dumps(xmltodict.parse(response1))
            # output+="\n"+str(feed_parsedp)+"\n"
            # task_result.output = output
            # task_result.save()
        except Exception as e:
            output+="\n"+"json dumping"+"\n"
            output+="\n"+str(e)+"\n\n\n"
            task_result.output = output
            task_result.save()
            continue
        


        # break
        
        try:
            feed_parsed=json.loads(feed_parsedp)
        except Exception as e:
            output+="\n"+"json loading"+"\n"
            output+="\n"+str(e)+"\n\n\n"
            task_result.output = output
            task_result.save()
            continue
        
        

        try:
            episodes_processed = feed_parsed['rss']['channel']['item']
        except Exception as e:
            output+="\n"+"getting item"+"\n"
            output+="\n"+str(e)+"\n\n\n"
            task_result.output = output
            task_result.save()
            continue
        
        try:
            last_episode=episodes_processed[len(episodes_processed)-1]
            try:
                pd=last_episode['pubDate']
                try:
                    ins.releaseDate=datetime.datetime.strptime(pd, '%a, %d %b %Y %H:%M:%S %Z')
                except ValueError:
                    ins.releaseDate=datetime.datetime.strptime(pd, '%a, %d %b %Y %H:%M:%S %z')
                except Exception as e:
                    output+="\n"+"release date format fail"+"\n"
                    output+="\n"+str(e)+"\n\n\n"
                    task_result.output = output
                    task_result.save()
                    continue
                ins.save()   
            
            except KeyError:
                ins.releaseDate='1700-01-01'
                ins.save()
            except Exception as e:
                output+="\n"+"pub date fail"+"\n"
                output+="\n"+str(e)+"\n\n\n"
                task_result.output = output
                task_result.save()
                continue
        except KeyError:
            last_episode=episodes_processed
            try:
                pd=last_episode['pubDate']
                try:
                    ins.releaseDate=datetime.datetime.strptime(pd, '%a, %d %b %Y %H:%M:%S %Z')
                except ValueError:
                    ins.releaseDate=datetime.datetime.strptime(pd, '%a, %d %b %Y %H:%M:%S %z')
                except Exception as e:
                    output+="\n"+"release date format fail"+"\n"
                    output+="\n"+str(e)+"\n\n\n"
                    task_result.output = output
                    task_result.save()
                    continue
                ins.save()               
            except KeyError:
                ins.releaseDate='1700-01-01'
                ins.save()
            except Exception as e:
                output+="\n"+"pub date fail"+"\n"
                output+="\n"+str(e)+"\n\n\n"
                task_result.output = output
                task_result.save()
                continue
        except Exception as e:
            output+="\n"+"episode len index error"+"\n"
            output+="\n"+str(e)+"\n\n\n"
            task_result.output = output
            task_result.save()
            continue

        
        
        # ins.releaseDate='1700-01-01'
        # ins.save()

        # counter+=1
        # if counter%100==0:
        #     output+="\n"+str(counter)+"\n"
        #     task_result.output = output
        #     task_result.save()
        # if counter%100==0:
        #     output+="\n"+str(counter)+"\n"
        output+="\n"+str(ins.releaseDate)+"\n"
        task_result.output = output
        task_result.save()

        # counter+=1
        # # if counter>10:
        # #     break

        # if counter!=0 and counter % 1000 == 0:
        #     output+="\n"+str(counter)+"\n"
        #     task_result.output = output
        #     task_result.save()
            # break
        # output+="\n"+str(ins.releaseDate)+"\n"
        # if counter !=0 and counter%1000 == 0:
        #     time.sleep(60)
        #     output+="\n"+str(podcast_id)+"\n"
        #     task_result.output = output
        #     task_result.save()
        
        #break
        


    # output+="\n"+str(counter)+"\n"
    # output+="\n"+str(pounter)+"\n"
    # output+="\n"+str(total)+"\n"
    output += f"\nCompleted!"
    task_result.output = output
    task_result.save()



rnka=[]
hnka=[]

@transaction.atomic
def populate_rankings(country, genre):
    # Clear All Previous Rankings
    Ranking.objects.filter(country=country, genre=genre).delete()
    nowdate = datetime.datetime.now(datetime.timezone.utc).date()
    RankingHistory.objects.filter(country=country, genre=genre, updated__date=nowdate).delete()

    feed = TopShowsFeed(country=country, genre=genre)
    shows_record = 0

    data = feed.fetch()
    for show_data in data:
        podcast_id = show_data['podcast_id']
        try:
            show = Show.objects.get(podcast_id=podcast_id)
        except Show.DoesNotExist:
            show = Show(podcast_id=show_data['podcast_id'], name=show_data['name'],
                        description=show_data['description'], url=show_data['url'],
                        image_link=show_data['image_link'], slug=show_data['slug'],
                        publisher=show_data['publisher'])
            show.save()

        shows_record= shows_record+1

        last_ranking = -1  # default value to detect the record is new
        # show_instance = Show.objects.get(podcast_id=podcast_id)
        mnowdaten = datetime.datetime.now(datetime.timezone.utc).date()-datetime.timedelta(days=1)
        last_record = RankingHistory.objects.filter(country=country, genre=genre, show=show,updated__date=mnowdaten)
        if last_record:
            last_ranking = last_record.first().ranking

        rnka.append(Ranking(show=show,country=country,genre=genre,ranking=show_data['ranking'],last_ranking=last_ranking,store_url=show_data['url']))
        hnka.append(RankingHistory(show=show,country=country,genre=genre,ranking=show_data['ranking'],store_url=show_data['url']))

    return (shows_record, len(feed.errors))

@shared_task(bind=True)
def terminator(self, task_id, log_errors=True):

   revoke(task_id, terminate=True)

# regions definer


def cntfil(param):
    if param == "Africa":
        qsetf = Ranking.objects.filter(
            Q(country__region_code='15') | Q(country__region_code='202'))
        return qsetf
    elif param == "Asia Pacific":
        qsetf = Ranking.objects.filter(Q(country__region_code='53') | Q(country__region_code='143') | Q(
            country__region_code='30') | Q(country__region_code='54') | Q(country__region_code='61') | Q(country__region_code='34'))
        return qsetf
    elif param == "Europe":
        qsetf = Ranking.objects.filter(Q(country__region_code='151') | Q(
            country__region_code='154') | Q(country__region_code='39') | Q(country__region_code='155'))
        return qsetf
    elif param == "North America":
        qsetf = Ranking.objects.filter(Q(country__region_code='21'))
        return qsetf
    elif param == "Latin America":
        qsetf = Ranking.objects.filter(Q(country__region_code='419'))
        return qsetf
    elif param == "Middle East":
        qsetf = Ranking.objects.filter(Q(country__region_code='145'))
        return qsetf
    elif param == "Southeast Asia":
        qsetf = Ranking.objects.filter(Q(country__region_code='35'))
        return qsetf

def Hcntfil(param,dt):
    if param == "Africa":
        qsetf=RankingHistory.objects.filter(updated__date=dt)
        qsetf = qsetf.filter(Q(country__region_code='15') | Q(country__region_code='202'))
        return qsetf
    elif param == "Asia Pacific":
        qsetf=RankingHistory.objects.filter(updated__date=dt)
        qsetf = qsetf.filter(Q(country__region_code='53') | Q(country__region_code='143') | Q(
            country__region_code='30') | Q(country__region_code='54') | Q(country__region_code='61') | Q(country__region_code='34'))
        return qsetf
    elif param == "Europe":
        qsetf=RankingHistory.objects.filter(updated__date=dt)
        qsetf = qsetf.filter(Q(country__region_code='151') | Q(
            country__region_code='154') | Q(country__region_code='39') | Q(country__region_code='155'))
        return qsetf
    elif param == "North America":
        qsetf=RankingHistory.objects.filter(updated__date=dt)
        qsetf = qsetf.filter(Q(country__region_code='21'))
        return qsetf
    elif param == "Latin America":
        qsetf=RankingHistory.objects.filter(updated__date=dt)
        qsetf = qsetf.filter(Q(country__region_code='419'))
        return qsetf
    elif param == "Middle East":
        qsetf=RankingHistory.objects.filter(updated__date=dt)
        qsetf = qsetf.filter(Q(country__region_code='145'))
        return qsetf
    elif param == "Southeast Asia":
        qsetf=RankingHistory.objects.filter(updated__date=dt)
        qsetf = qsetf.filter(Q(country__region_code='35'))
        return qsetf



@shared_task(bind=True)
def update_rankings_database(self, task_type="unspecified", log_errors=True):

    countries = Country.objects.all()
    genres = Genre.objects.all()

    output = ""
    output += f"Task: {self.request.id} \n"
    output += f"\033[0;34m TotalCountries \033[0m: {countries.count()}\n"
    output += f"\033[0;34m Total Genres \033[0m: {genres.count()}\n"
    output += "Fetching Ranking and Shows Data\n"
    output += f"BeginPR!\n"

    task_result = UpdateTaskResult(task_id=self.request.id)
    task_result.output = output
    task_result.task_type = task_type
    task_result.save()

    # BlacklistCountryGenre.objects.all().delete()
    for country in countries:
        for genre in genres:
            # country=Country.objects.get(country_code='sg')
            # genre=Genre.objects.get(genre_id=1304)
            if BlacklistCountryGenre.objects.filter(country=country,genre=genre).exists():
                continue
            output += f"Processing Country: {country} and Genre: {genre} "
            try:
                (shows, errors) = populate_rankings(country=country, genre=genre)
                if errors:
                    output += f'⚠ ({errors} shows failed to process, {shows} processed\n'
                    BlacklistCountryGenre(country=country,genre=genre).save()
                else:
                    output += f"✅ ({shows} shows updated)\n"
            except Exception as e:
                if log_errors:
                    output += e.__repr__()
                    output += "\n\n"
                    BlacklistCountryGenre(country=country,genre=genre).save()
                else:
                    output += "Failed to Fetch ❌\n"
                    BlacklistCountryGenre(country=country,genre=genre).save()
        
        task_result.output = output
        task_result.save()  
        global rnka
        global hnka 
        Ranking.objects.bulk_create(rnka)
        RankingHistory.objects.bulk_create(hnka)
        del rnka[:] 
        del hnka[:] 

    output+="\ncame here\n"
    task_result.output = output
    task_result.save()  


    #GenreTop100
    #begin
    GenreTop100.objects.all().delete()
    genrea=[]
    for genre in genres:
        genre_id=genre.genre_id
        powerranking_queryset = Ranking.objects.filter(genre__genre_id=genre_id, ranking__lt=21).values('show__podcast_id', 'genre__genre_id').annotate(score=Count('show__podcast_id')).order_by('-score')[:100]

        Hnowdaten = datetime.datetime.now(datetime.timezone.utc).date()-datetime.timedelta(days=1)

        Hpowerranking_queryset = RankingHistory.objects.filter(genre__genre_id=genre_id,ranking__lt=21,updated__date=Hnowdaten).values('show__podcast_id', 'genre__genre_id').annotate(score=Count('show__podcast_id')).order_by('-score')[:100]

        ding={}
        for index,bar in enumerate(Hpowerranking_queryset):
            ding[bar['show__podcast_id']]=index+1


        # Nqueryset=[]
        for index,bar in enumerate(powerranking_queryset):
            box=bar
            box['place']=index+1
            box['lastplace']=-1
            if bar['show__podcast_id'] in ding.keys():
                box['lastplace']=ding[bar['show__podcast_id']]
            # Nqueryset.append(box)
            show=Show.objects.get(podcast_id=bar['show__podcast_id'])
            genrea.append(GenreTop100(genre=genre,show=show,score=box['score'],ranking=box['place'],last_ranking=box['lastplace']))

    GenreTop100.objects.bulk_create(genrea)
    #end

    output+="\ngenretop100 finished\n"
    task_result.output = output
    task_result.save() 

    #CountryTop100
    #begin
    CountryTop100.objects.all().delete()
    countrya=[]
    for country in countries:
        country_name=country.country_code
        powerranking_queryset = Ranking.objects.filter(country__country_code=country_name, ranking__lt=21).values('show__podcast_id', 'country__country_code').annotate(score=Count('show__podcast_id')).order_by('-score')[:100]

        Hnowdaten = datetime.datetime.now(datetime.timezone.utc).date()-datetime.timedelta(days=1)

        Hpowerranking_queryset = RankingHistory.objects.filter(country__country_code=country_name,ranking__lt=21,updated__date=Hnowdaten).values('show__podcast_id', 'country__country_code').annotate(score=Count('show__podcast_id')).order_by('-score')[:100]

        ding={}
        for index,bar in enumerate(Hpowerranking_queryset):
            ding[bar['show__podcast_id']]=index+1


        # Nqueryset=[]
        for index,bar in enumerate(powerranking_queryset):
            box=bar
            box['place']=index+1
            box['lastplace']=-1
            if bar['show__podcast_id'] in ding.keys():
                box['lastplace']=ding[bar['show__podcast_id']]
            # Nqueryset.append(box)
            show=Show.objects.get(podcast_id=bar['show__podcast_id'])
            countrya.append(CountryTop100(country=country,show=show,score=box['score'],ranking=box['place'],last_ranking=box['lastplace']))

    CountryTop100.objects.bulk_create(countrya)
    #end

    output+="\ncountrytop 100 finshed\n"
    task_result.output = output
    task_result.save()  

    #GlobalTop100
    #begin
    GlobalTop100.objects.all().delete()
    globala=[]
    powerranking_queryset = Ranking.objects.filter(ranking__lt=21).values('show__podcast_id').annotate(score=Count('show__podcast_id')).order_by('-score')[:100]
    Hnowdaten = datetime.datetime.now(datetime.timezone.utc).date()-datetime.timedelta(days=1)
    Hpowerranking_queryset = RankingHistory.objects.filter(ranking__lt=21,updated__date=Hnowdaten).values('show__podcast_id').annotate(score=Count('show__podcast_id')).order_by('-score')[:100]
    ding={}
    for index,bar in enumerate(Hpowerranking_queryset):
        ding[bar['show__podcast_id']]=index+1

    for index,bar in enumerate(powerranking_queryset):
        show=Show.objects.get(podcast_id=bar['show__podcast_id'])
        lastplace=-1
        if bar['show__podcast_id'] in ding.keys():
            lastplace=ding[bar['show__podcast_id']]
        globala.append(GlobalTop100(show=show,score=bar['score'],ranking=index+1,last_ranking=lastplace))

    GlobalTop100.objects.bulk_create(globala)
    #end

    output+="\nglobal top100 finished\n"
    task_result.output = output
    task_result.save()  

    #RegionTop100
    #begin
    RegionTop100.objects.all().delete()
    regiona=[]
    regions=["Africa","Asia Pacific","Europe","North America","Latin America","Middle East","Southeast Asia"]
    for region in regions:
        region_name=region

        qsetf = cntfil(region_name)
        powerranking_queryset = qsetf.filter(ranking__lt=21).values('show__podcast_id').annotate(score=Count('show__podcast_id')).order_by('-score')[:100]
        
        Hnowdaten = datetime.datetime.now(datetime.timezone.utc).date()-datetime.timedelta(days=1)

        Hqsetf = Hcntfil(region_name,Hnowdaten)
        Hpowerranking_queryset = Hqsetf.filter(ranking__lt=21).values('show__podcast_id').annotate(score=Count('show__podcast_id')).order_by('-score')[:100]

        ding={}
        for index,bar in enumerate(Hpowerranking_queryset):
            ding[bar['show__podcast_id']]=index+1


        # Nqueryset=[]
        for index,bar in enumerate(powerranking_queryset):
            box=bar
            box['place']=index+1
            box['lastplace']=-1
            if bar['show__podcast_id'] in ding.keys():
                box['lastplace']=ding[bar['show__podcast_id']]
            show=Show.objects.get(podcast_id=bar['show__podcast_id'])
            regiona.append(RegionTop100(region=region_name,show=show,score=box['score'],ranking=box['place'],last_ranking=box['lastplace']))
            # Nqueryset.append(box)
            # print(box)

    RegionTop100.objects.bulk_create(regiona)
    #end

    output+="\nregiontop100 finished\n"
    task_result.output = output
    task_result.save()  
    
    #shows_power_ranking_history_all
    #begin
    for kut in range(0,1):     
        tod_date = datetime.datetime.now(datetime.timezone.utc).date()-datetime.timedelta(days=kut)
        tod_date2 = datetime.datetime.now(datetime.timezone.utc)-datetime.timedelta(days=kut)
        output+="\n"+str(tod_date)+"\n"
        output+="\n"+str(tod_date2)+"\n"
        output+="\n"+"---------------------"+"\n"
        task_result.output = output
        task_result.save() 

        all_shows=Show.objects.all()  
        PowerRankingHistory.objects.filter(updated__date=tod_date).delete()
        powerranking_queryset = Ranking.objects.filter(ranking__lt=21).values(
            'show__podcast_id').annotate(score=Count('show__podcast_id')).order_by('-score')[:2]
        max_score = 237
        if powerranking_queryset:
            max_score = powerranking_queryset.first()['score']

        pia=[]
        for ins in all_shows:
            pr=Ranking.objects.filter(show=ins, ranking__lt=21).count()
            max_score2 = max(max_score,pr)
            val = pr*100.0/max_score2
            val = int(round(val))
            pia.append(PowerRankingHistory(show=ins,score=pr,val=val,updated=tod_date2))
        PowerRankingHistory.objects.bulk_create(pia)
    #end

    output+="\nshows_power_ranking_history_all finished\n"
    task_result.output = output
    task_result.save()  



    # # report generation and mailing
    # # |-----------------------------------------------------------------------------------|
    # if nowdaten.day == 15 or nowdaten.day == 30:
    #     user_set = User.objects.all()
    #     for ins in user_set:
    #         # print(ins.username)
    #         # print(ins.email)
    #         ins_shows = ins.report_followed.all()
    #         email_body = 'Hi '+ins.first_name+' '+ins.last_name+',\n'
    #         email_body = email_body + \
    #             'I am sharing with you the monthly reports for your followed shows'
    #         email_body = email_body+"' Apple Podcast rankings. The report is as of " + \
    #             str(datetime.datetime.today().date())+".\n"
    #         email_body = email_body + \
    #             "Let me know if you have any questions. You can contact me at ps@pikkal.com.\nThank you!\n"
    #         datarr = {'email_body': email_body, 'to_email': ins.email,
    #                   'email_subject': 'Monthly Podcast Rankings'}

    #         queryset = []
    #         for ins2 in ins_shows:
    #             # print(ins2.name)

    #             months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    #                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    #             x_axis = []
    #             y_axis = []
    #             valgen = []
    #             allgen = Genre.objects.all()
    #             for gen in allgen:
    #                 if RankingHistory.objects.filter(show__podcast_id=ins2.podcast_id, country__name='Singapore', genre__name=gen.name).exists():
    #                     valgen.append(gen.name)
    #             valgen.sort()
    #             thisgen = "Management"
    #             if len(valgen) >= 1:
    #                 thisgen = valgen[-1]
    #             rr = requests.get(
    #                 'http://app0api.pikkalfm.com/podminer/history?country=Singapore&genre='+thisgen+'&show_id='+str(ins2.podcast_id))
    #             data_for_chart = rr.json()
    #             for data in data_for_chart:
    #                 y_axis.append(data['ranking'])
    #                 mon = int(data['updated'][5:7])
    #                 day = int(data['updated'][8:10])
    #                 x_axis.append("{} {}".format(months[mon-1], day))

    #             fig = go.Figure()
    #             fig.add_trace(go.Scatter(x=x_axis, y=y_axis, mode="lines+markers",
    #                                      line=dict(color='firebrick', width=2)))
    #             fig['layout']['yaxis']['autorange'] = "reversed"

    #             fig.update_layout(
    #                 xaxis_title='Day',
    #                 yaxis_title='Rankings',
    #                 autosize=False,
    #                 width=1000,
    #                 height=500,
    #                 margin=dict(
    #                     l=60,
    #                     r=40,
    #                     b=50,
    #                     t=50,
    #                     pad=5
    #                 ),
    #                 paper_bgcolor="White"
    #             )

    #             # fig.show()
    #             if not os.path.exists("images"):
    #                 os.mkdir("images")

    #             fig.write_image("images/fig1.png")

    #             # Create a file-like buffer to receive PDF data.
    #             buffer = io.BytesIO()

    #             # Create the PDF object, using the buffer as its "file."
    #             # p = canvas.Canvas(buffer)

    #             payload = {'show_id': ins2.podcast_id}
    #             r = requests.get(
    #                 'http://app0api.pikkalfm.com/podminer/rankings', params=payload)
    #             data_for_header = r.json()
    #             data_for_table = r.json()
    #             data_for_header = data_for_header[0]['show_data']
    #             title = data_for_header['name']
    #             desc = data_for_header['description']
    #             img = data_for_header['image_link']
    #             img = img.split('170x170bb.png')
    #             img = img[0] + '500x500bb.png'
    #             table_data = []
    #             ctr = 0
    #             for item in data_for_table:
    #                 if ctr < 10:
    #                     table_data.append(
    #                         ["{}".format(item['ranking']), "{} | {}".format(item['country'], item['genre'])])
    #                 else:
    #                     break
    #                 ctr = ctr + 1

    #             c = canvas.Canvas(buffer, pagesize=A4)
    #             # generatePDF(c)
    #             width, height = A4
    #             # Podcast image
    #             c.drawImage(img, 25, height-225, 200, 200)

    #             # Podcast title
    #             c.setFont('Helvetica', 18)
    #             title_wrapper = textwrap.TextWrapper(width=40)  # Text wrapper
    #             word_list = title_wrapper.wrap(text=title)
    #             count = 0
    #             for element in word_list:
    #                 c.drawString(250, height-50-count, element)
    #                 count += 20
    #             # Podcast description
    #             c.setFont('Helvetica', 14)
    #             desc_wrapper = textwrap.TextWrapper(width=48)  # Text wrapper
    #             word_list = desc_wrapper.wrap(text=desc)
    #             count = 0
    #             for element in word_list:
    #                 if count > 120:
    #                     c.drawString(250, height-100-count, '[...]')
    #                     break
    #                 c.drawString(250, height-100-count, element)
    #                 count += 15

    #             # Timestamp of report
    #             x = datetime.datetime.now()
    #             c.drawString(
    #                 25, height-280, f"This report was generated by Pikkal & Co. on {x.strftime('%a')}, {x.strftime('%b')} {x.strftime('%d')}.")

    #             # Partition line
    #             c.setLineWidth(2)
    #             c.line(25, height-310, width-25, height-310)

    #             # Insert chart image
    #             c.setFont('Helvetica', 16)
    #             c.drawString(
    #                 25, height-350, "Historical Rankings for Singapore | "+thisgen)
    #             c.drawImage('images/fig1.png', 25, 180, width-50, 300)

    #             # Partition line
    #             c.setLineWidth(2)
    #             c.line(25, 120, width-25, 120)

    #             # New page for chart
    #             c.showPage()

    #             # Table
    #             mt = height - 50
    #             c.setFont('Helvetica', 18)
    #             c.drawString(25, mt+10, 'Top 10 Stores')
    #             c.setFont('Helvetica', 16)
    #             c.setLineWidth(1)
    #             c.line(25, mt-10, width-25, mt-10)
    #             c.drawString(35, mt-35, 'Rank')
    #             c.drawString(150, mt-35, 'Apple Podcast Stores')
    #             c.line(25, mt-50, width-25, mt-50)
    #             c.setFont('Helvetica', 14)
    #             count = 0
    #             extra = 0
    #             for data in table_data:
    #                 count += 20
    #                 c.drawString(40, mt-50-count-extra, data[0])
    #                 c.drawString(150, mt-50-count-extra, data[1])
    #                 c.line(25, mt-60-count-extra, width-25, mt-60-count-extra)
    #                 extra += 15
    #             c.line(25, mt-10, 25, mt-60-count-extra+15)
    #             c.line(100, mt-10, 100, mt-60-count-extra+15)
    #             c.line(width-25, mt-10, width-25, mt-60-count-extra+15)

    #             mt = mt-60-count-extra-20
    #             # Partition line
    #             c.setLineWidth(2)
    #             c.line(25, mt, width-25, mt)

    #             # Link to Podminer
    #             info = "For detailed Podcast analysis, visit "
    #             c.drawString(25, mt-40, info)
    #             hostname = "Pikkal & Co."
    #             hostlink = "https://www.pikkal.com/"
    #             c.saveState()
    #             c.setFillColorRGB(0, 0, 1)
    #             c.drawString(25 + c.stringWidth(info), mt-40, hostname)
    #             linkRect = (25 + c.stringWidth(info), mt-45,
    #                         25 + c.stringWidth(info) + c.stringWidth(hostname), mt-25)
    #             c.linkURL(hostlink, linkRect)
    #             c.restoreState()

    #             c.showPage()
    #             c.save()

    #             buffer.seek(0)

    #             queryset.append(
    #                 {'attname': ins2.slug, 'att': buffer.getvalue()})

    #         datarr['qq'] = queryset
    #         Util2.send_email(datarr)
    # # |-----------------------------------------------------------------------------------|
    

    output += f"Completed!"
    task_result.output = output
    task_result.save()


@shared_task(bind=True)
def update_geckoboard(self, task_type="unspecified", log_errors=True):
    
    output = ""
    output += f"Task: {self.request.id} \n"
    output += "Updating Geckoboard\n"
    output += f"BeginGB!\n"

    task_result = UpdateTaskResult(task_id=self.request.id)
    task_result.output = output
    task_result.task_type = task_type
    task_result.save()

    #CatalogDashboard
    if True:
        API_KEY = 'ac126939d26650c1f1349b4bc4cab9f2'
        client = geckoboard.client(API_KEY)
        # print(client.ping())

        #Tasks------------------------------

        tasks_history=[]
        tinto={}
        for ins in UpdateTaskResult.objects.all().order_by('date_created'):
            if ins.task_type=="scheduled" and ins.status=="SUCCESS":  
                if str(ins.date_created.date()) not in tinto.keys():
                    box={}
                    box['day']=str(ins.date_created.date())
                    timesince=ins.date_done-ins.date_created
                    box['time']=int(timesince.total_seconds() / 60)
                    tinto[box['day']]=box['time']
                    tasks_history.append(box)
                else:
                    tasks_history.pop()
                    box={}
                    box['day']=str(ins.date_created.date())
                    timesince=ins.date_done-ins.date_created
                    box['time']=int(timesince.total_seconds() / 60)
                    tinto[box['day']]=box['time']
                    tasks_history.append(box)

        fields = {}

        fields['day'] = {'type': 'date', 'name': 'Day', 'optional': False}
        fields['time'] = {'type': 'number', 'name': 'Total Time Taken', 'optional': False}

    
        dataset = client.datasets.find_or_create(
            'catalog_tasks_history', fields, ['day'])

        dataset.post(tasks_history, 'day')

        #---------------------------------------------------
        no_of_shows= Show.objects.all().count()
        no_of_countries= Country.objects.all().count()
        no_of_genres= Genre.objects.all().count()
        no_of_rankings= Ranking.objects.all().count()
        no_of_rankinghistory= RankingHistory.objects.all().count()
        app1Data = requests.get('http://app1api.pikkalfm.com/geckocatalog')
        app1Data = app1Data.json()

        no_of_episodes= app1Data['no_of_episodes']
        no_of_entities= app1Data['no_of_entities']

        catalog_stats=[]
        stats={'no_of_shows':no_of_shows,'no_of_countries':no_of_countries,'no_of_genres':no_of_genres,'no_of_rankings':no_of_rankings,'no_of_rankinghistory':no_of_rankinghistory,'no_of_episodes':no_of_episodes,'no_of_entities':no_of_entities}
        catalog_stats.append(stats)

        fields2={}
        fields2['no_of_shows']={ 'type': 'number', 'name': 'No. of Shows we are tracking', 'optional': False }
        fields2['no_of_countries']={ 'type': 'number', 'name': 'No. of Countries we are tracking', 'optional': False }
        fields2['no_of_genres']={ 'type': 'number', 'name': 'No. of Genres we are tracking', 'optional': False }
        fields2['no_of_rankings']={ 'type': 'number', 'name': 'No. of Rankings records we have on our database', 'optional': False }
        fields2['no_of_rankinghistory']={ 'type': 'number', 'name': 'No. of Ranking History records we have on our database', 'optional': False }
        fields2['no_of_episodes']={ 'type': 'number', 'name': 'No. of Episodes we are tracking', 'optional': False }
        fields2['no_of_entities']={ 'type': 'number', 'name': 'No. of ML Entities recognized', 'optional': False }

        dataset = client.datasets.find_or_create('catalog_stats', fields2)

        dataset.post(catalog_stats)
        #--------------------------------------

        archive_history=[]

        for kut in range(0,35): 
            tuk=34-kut    
            tod_date = datetime.datetime.now(datetime.timezone.utc).date()-datetime.timedelta(days=tuk)
            cnt=RankingHistory.objects.filter(updated__date__lte=tod_date).count()
            archive_history.append({'day':str(tod_date),'total':cnt})

        fields = {}

        fields['day'] = {'type': 'date', 'name': 'Day', 'optional': False}
        fields['total'] = {'type': 'number', 'name': 'Total No. of Records', 'optional': False}

    
        dataset = client.datasets.find_or_create(
            'catalog_archive_history', fields, ['day'])

        dataset.post(archive_history, 'day')

        #-------------------------------------------------
    
    output+="\nCatalogDashboard finished\n"
    task_result.output = output
    task_result.save()  

    #Client Success Dashboard
    if False:
        API_KEY = '057be7b2e047bdd06bc868954ce73946'
        client = geckoboard.client(API_KEY)
        
        access_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjQzNDI4NDc2LCJqdGkiOiJhNWE3ZTBlZmM3ZDE0MmViYmZhN2U4M2UzYTNiMjVhNiIsInVzZXJfaWQiOjd9.sys_qdTM9gV7ArCrtUc7Ke5aA3MMCbCovO2ZGJKPRsQ'
        
        followedShowsData = requests.get('https://api.podminer.com/shows/followed',
                                        headers={'Authorization': f'Bearer {access_token}'})
        followedShowsData = followedShowsData.json()
        
        followedShows = {}
        dates = {}
        
        fields = {}
        
        ctr = 0
        for el in followedShowsData['followed_shows']:
            followedShows[el['podcast_id']] = el['name']
            fields[f'amount{ctr}'] = {'type': 'number',
                                    'name': f"{el['name']}", 'optional': True}
            ctr = ctr + 1
        
        fields['date'] = {'type': 'date', 'name': 'Day', 'optional': False}
        fields['sum'] = {'type': 'number', 'name': 'Total PAI', 'optional': False}
        fields['untracked'] = {'type': 'number',
                            'name': 'Untracked Shows', 'optional': False}
        fields['one_month_before'] = {
            'type': 'number', 'name': 'Monthly TPAI Difference', 'optional': True}
        
        d1 = datetime.date(2020, 12, 30)
        d2 = datetime.date.today()
        diff = d2 - d1
        for i in range(diff.days + 1):
            dates[(d1 + datetime.timedelta(i)).isoformat()
                ] = [None for x in range(len(followedShows))]
        
        ctr = 0
        for key in followedShows:
            data = requests.get(
                f'https://api.podminer.com/fastpowerrankingshistory?show_id={key}').json()
            data = data['queryset']
            for el in data:
                dates[el['updated__date']][ctr] = el['score']
            ctr = ctr + 1
        
        # print(dates)
        dataset = client.datasets.find_or_create(
            'daily_pai_scores_sum_and_diff', fields, ['date'])
        
        totalData = []
        tpaiDiff = {}
        
        for key in dates:
            newDict = {}
            newDict['date'] = key
            newDict['untracked'] = 0
            newDict['sum'] = 0
            for ctr in range(len(followedShows)):
                newDict[f'amount{ctr}'] = dates[key][ctr]
                if dates[key][ctr] is not None:
                    if dates[key][ctr] != 0:
                        newDict['sum'] = newDict['sum'] + dates[key][ctr]
                    else:
                        newDict['untracked'] = newDict['untracked']+1
                else:
                    newDict['untracked'] = newDict['untracked']+1
            tpaiDiff[key] = newDict['sum']
            totalData.append(newDict)
        
        for point in totalData:
            today = point['date']
            date_prev = datetime.datetime.strptime(
                today, '%Y-%m-%d') - datetime.timedelta(30)
            date_prev = date_prev.strftime('%Y-%m-%d')
            if date_prev in tpaiDiff:
                point['one_month_before'] = point['sum'] - tpaiDiff[date_prev]
            else:
                point['one_month_before'] = None
        
        # print(totalData)
        dataset.post(totalData, 'date')
    
    output+="\nClientSuccessDashboard finished\n"
    task_result.output = output
    task_result.save()  

    #SSL Status Dashboard
    if False:
        host="pikkalstudio.com"
        port=443
        ssl_date_fmt = r'%b %d %H:%M:%S %Y %Z'
        context = ssl.create_default_context()
        conn = context.wrap_socket(
            socket.socket(socket.AF_INET),
            server_hostname=host,
        )
        conn.settimeout(3.0)
        conn.connect((host, port))
        ssl_info = conn.getpeercert()
        ##print(ssl_info)
        # js=json.dumps(ssl_info)
        # with open('md.json', 'w') as json_file:
        #     json.dump(ssl_info, json_file, indent=4)
        result = datetime.datetime.strptime(ssl_info['notAfter'], ssl_date_fmt)

        today_d=datetime.datetime.today()
        status="ACTIVE"
        if(today_d>=result):
            status="EXPIRED"
        
        print(status)
        print(result)
        no_days_left=result-today_d
        print(no_days_left.days)

        API_KEY = '04a63039e42797f52fafe8948242fea9'
        client = geckoboard.client(API_KEY)
        

        ssl_stats=[]
        stats={'status':status,'expiry_date':str(result),'no_days_left':str(no_days_left.days)}
        ssl_stats.append(stats)

        fields2={}
        fields2['status']={ 'type': 'string', 'name': 'Status', 'optional': False }
        fields2['expiry_date']={ 'type': 'string', 'name': 'Expiry Date', 'optional': False }
        fields2['no_days_left']={ 'type': 'string', 'name': 'No. of Days left', 'optional': False }
        

        dataset = client.datasets.find_or_create('ssl_stats', fields2)

        dataset.post(ssl_stats)

    output+="\nSSLStatusDashboard finished\n"
    task_result.output = output
    task_result.save()  

    

    output += f"Completed!"
    task_result.output = output
    task_result.save()

