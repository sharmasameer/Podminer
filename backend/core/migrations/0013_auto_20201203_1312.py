# Generated by Django 3.1.3 on 2020-12-03 13:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0012_auto_20201204_1347'),
    ]

    operations = [
        migrations.AlterField(
            model_name='show',
            name='slug',
            field=models.TextField(default='no-slug', null=True),
        ),
    ]