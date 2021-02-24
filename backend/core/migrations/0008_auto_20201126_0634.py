# Generated by Django 3.1.3 on 2020-11-26 06:34

from django.db import migrations

def forwards(apps, se):
    Show = apps.get_model('core', "Show")
    for show in Show.objects.all():
        show.save()

def backwards(a, se):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_show_slug'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]