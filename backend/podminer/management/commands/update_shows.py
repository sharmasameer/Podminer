import sys
import traceback

from core.models import Country, Show, Genre
from podminer.models import Ranking, RankingHistory
from django.core.management.base import BaseCommand, CommandError
from podminer.feed import TopShowsFeed, FeedException
from podminer.tasks import update_existing_shows

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('genre_id', nargs='?', type=int)
        parser.add_argument('country_code', nargs='?', type=str)
        parser.add_argument('--raise-errors', action='store_true', help="Don't Silent any Errors that Rise up")
        parser.add_argument('--halt-errors', action='store_true', help="Stop on Exceptions and ask for input")

    def handle(self, *args, **options):
        self.stdout.write("Fetching Ranking and Shows Data")
        genre_id = options['genre_id']
        country_code = options['country_code']

        if country_code:
            countries = Country.objects.filter(country_code=country_code)
        else:
            countries = Country.objects.all()
        
        if genre_id:
            genres = Genre.objects.filter(genre_id=genre_id)
        else:
            genres = Genre.objects.all()

        self.stdout.write("\033[0;34m{}\033[0m: {}".format("Total Countries", countries.count()))
        self.stdout.write("\033[0;34m{}\033[0m: {}".format("Total Genres", genres.count()))
        self.stdout.write("")

        for country in countries:
            for genre in genres:
                print(f"Processing Country: {country} and Genre: {genre} ", end="")
                try:
                    (shows, errors) = update_existing_shows(country=country, genre=genre)
                    if errors:
                        self.stdout.write(self.style.WARNING(f'⚠ ({len(errors)} shows failed to process, {len(shows)} processed'))
                    else:
                        self.stdout.write(self.style.SUCCESS(f"✅ ({len(shows)} shows updated)"))
                except Exception as e:
                    if isinstance(e, KeyboardInterrupt): sys.exit()

                    if options['raise_errors']:
                        raise
                    elif options['halt_errors']:
                        traceback.print_tb(e.__traceback__)
                        input()
                        print()
                    else:
                        self.stdout.write(self.style.SUCCESS("Failed to Fetch ❌"))

        self.stdout.write(self.style.SUCCESS("Completed!"))
