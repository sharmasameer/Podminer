from django.contrib import admin
from podminer.models import Ranking, RankingHistory, UpdateTaskResult, UserMetrics, GlobalTop100,GenreTop100,RegionTop100,CountryTop100,PowerRankingHistory

# Register your models here.

admin.site.register(Ranking)
admin.site.register(RankingHistory)
admin.site.register(UpdateTaskResult)
admin.site.register(UserMetrics)
admin.site.register(GlobalTop100)
admin.site.register(GenreTop100)
admin.site.register(RegionTop100)
admin.site.register(CountryTop100)
admin.site.register(PowerRankingHistory)