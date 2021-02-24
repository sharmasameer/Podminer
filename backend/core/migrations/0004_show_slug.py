# Generated by Django 3.1.3 on 2020-11-19 07:30

from django.db import migrations, models

def forwards(apps, schema_editor):
    Show = apps.get_model('core', 'Show')
    for show in Show.objects.all():
        show.save()

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_auto_20201111_0709'),
    ]

    operations = [
        migrations.AddField(
            model_name='show',
            name='slug',
            field=models.SlugField(blank=True, max_length=1000, null=True),
        ),
        migrations.RunPython(forwards),
    ]