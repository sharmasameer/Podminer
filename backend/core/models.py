from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify
from autoslug import AutoSlugField


class User(AbstractUser):
    shows_followed= models.ManyToManyField('Show', blank=True)
    report_followed= models.ManyToManyField('Show', related_name="report_followed", blank=True)
    report_status=models.IntegerField(default=1)
    class Meta:
        db_table = "users"


class Country(models.Model):
    # Two character identifer for country (us, pk, in, etc.)
    country_code = models.CharField(max_length=2, primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    region_code = models.CharField(max_length=100,default="nocode")
    regionname = models.CharField(max_length=100,default="noname")
    gdp = models.IntegerField()
    itunes_mkt = models.IntegerField()

    class Meta:
        db_table = "countries"

    def __str__(self):
        return f"{self.name} ({self.country_code})"

class Genre(models.Model):
    genre_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "genres"

    def __str__(self):
        return f"{self.genre_id} - {self.name}"


class Show(models.Model):
    podcast_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=200)
    url = models.TextField()
    description = models.TextField()
    slug=models.TextField(default='no-slug', null=True)
    image_link = models.TextField(null=True)
    publisher = models.CharField(max_length=200, default="no-publisher")
    releaseDate=models.DateTimeField(default='1800-01-01')
    feed_url = models.URLField(default="no-url")

    class Meta:
        db_table = "shows"

    def __str__(self):
        return f"{self.name}"

class Episode(models.Model):
    show = models.ForeignKey(Show, on_delete=models.CASCADE, related_name="episodes")
    title = models.TextField(default='no_title')
    audio_link = models.URLField(max_length=1000,default='no_audio_link')
    image_link = models.URLField(max_length=1000,default='no_image_link')
    description = models.TextField(default='no_description')
    released = models.DateTimeField(default='1800-01-01')
    duration = models.TextField(default='no_duration')

    class Meta:
        db_table = "episodes"

    def __str__(self):
        return f"{self.title}"
