# Generated by Django 3.1.4 on 2020-12-17 05:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0017_genrefilter'),
    ]

    operations = [
        migrations.AddField(
            model_name='show',
            name='publisher',
            field=models.CharField(default='no-publisher', max_length=200),
        ),
    ]
