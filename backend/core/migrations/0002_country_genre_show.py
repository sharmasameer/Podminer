# Generated by Django 3.1 on 2020-11-08 15:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Country',
            fields=[
                ('country_code', models.CharField(max_length=2, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('gdp', models.IntegerField()),
                ('itunes_mkt', models.IntegerField()),
            ],
            options={
                'db_table': 'countries',
            },
        ),
        migrations.CreateModel(
            name='Genre',
            fields=[
                ('genre_id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'genres',
            },
        ),
        migrations.CreateModel(
            name='Show',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('podcast_id', models.IntegerField(unique=True)),
                ('name', models.CharField(max_length=200)),
                ('url', models.URLField()),
                ('description', models.TextField()),
            ],
            options={
                'db_table': 'shows',
            },
        ),
    ]
