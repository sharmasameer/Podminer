# Generated by Django 3.1.6 on 2021-02-13 16:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0029_auto_20210210_1452'),
    ]

    operations = [
        migrations.AddField(
            model_name='show',
            name='feed_url',
            field=models.URLField(default='no-url'),
        ),
    ]