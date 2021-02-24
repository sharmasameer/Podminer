from django.contrib.admin.sites import all_sites
from django.urls import path
from core import views
# import url



urlpatterns = [
    path('genres', views.GenresView.as_view(), name='genres'),
    path('countries', views.CountriesView.as_view(), name='countries'),
    path('fcountriesfilter', views.FCountriesFilterView.as_view(), name='fcountriesfilter'),
    path('fgenresfilter', views.FGenresFilterView.as_view(), name='fgenresfilter'),
    path('fastpowerrankingshistory', views.FastPowerRankingsHistoryView.as_view(), name='fastpowerrankingshistory'),
    path('regions', views.RegionsView.as_view(), name='regions'),
    path('shows', views.ShowsView.as_view(), name='shows'),
    path('users', views.UsersView.as_view(), name='users'),
    path('oauth/users', views.UsersOauthView.as_view(), name='outh-users'),
    path('users/<int:id>', views.UserDetailView.as_view(), name='user-detail'),
    path('oauth/users/<str:username>', views.UserOauthDetailView.as_view(), name='user-oauth-detail'),
    path('shows/followed', views.ShowsFollowedView.as_view(), name='user-follow-show'),
    path('users/settings/<int:id>', views.SettingsView.as_view(), name='settings'),
    path('users/reportsettings/<int:id>', views.ReportSettingsView.as_view(), name='reportsettings'),
    path('users/reportnow', views.ReportNowView.as_view(), name='reportnow'),
    path('users/reportview', views.ReportView.as_view(), name='reportview'),
    path('shows/followed/history', views.ShowsFollowedHistoryView.as_view(), name='user-follow-show-history'),
    path('fcountrygenre', views.CountryFilterGenre.as_view(), name = 'country-via-genre'),
    path('globaltop100', views.GlobalTop100View.as_view(), name='globaltop100'),
    path('genretop100', views.GenreTop100View.as_view(), name='genretop100'),
    path('countrytop100', views.CountryTop100View.as_view(), name='countrytop100'),
    path('regiontop100', views.RegionTop100View.as_view(), name='regiontop100'),
    path('hotfire', views.HotFireView.as_view(), name='hotfire'),
    path('followed-shows-prhistory',views.FollowedShowsPRHistoryView.as_view(),name='followed-shows-prhistory'),
]
