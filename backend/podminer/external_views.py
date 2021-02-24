from rest_framework.exceptions import NotFound
from rest_framework import views
from rest_framework.response import Response
from rest_framework import serializers

from core.models import Country, Genre, Show
from podminer.models import Ranking


class RankingsSerializerShort(serializers.ModelSerializer):
    podcast_id = serializers.ReadOnlyField(source='show.podcast_id')
    show_name = serializers.ReadOnlyField(source='show.name')
    publisher = serializers.ReadOnlyField(source='show.publisher')
    class Meta:
        fields = ['podcast_id', 'show_name', 'ranking', 'publisher']
        model = Ranking


class RankingsViewShort(views.APIView):

    def get_queryset(self):
        country_code = self.request.query_params.get("country")
        genre_id = self.request.query_params.get("genre")
        
        if not (country_code and genre_id):
            raise NotFound("Country Code and/or genre ID not provided")

        if country_code:
            try:
                country = Country.objects.get(country_code=country_code)
            except Country.DoesNotExist:
                try:
                    country = Country.objects.get(name=country_code)
                except:
                    raise NotFound()

        if genre_id:
            try:
                genre = Genre.objects.get(name=genre_id)
            except Genre.DoesNotExist:
                try:
                    genre = Genre.objects.get(genre_id=genre_id)
                except:
                    raise NotFound()
        
        return Ranking.objects.filter(country=country, genre=genre)

    def get(self, request):
        rankings = self.get_queryset()
        flat = request.query_params.get('flat')
        if flat:
            data = RankingsSerializerShort(rankings, many=True).data
            return Response(data)

        result = {}
        for ranking in rankings:
            power_ranking = Ranking.objects.filter(show__podcast_id=ranking.show.podcast_id,ranking__lt=21).count()
            result[ranking.show.podcast_id] = [ranking.ranking, power_ranking]
        return Response(result)