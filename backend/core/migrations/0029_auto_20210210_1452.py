# Generated by Django 3.1.6 on 2021-02-10 09:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0028_auto_20210210_1432'),
    ]

    operations = [
        migrations.AlterField(
            model_name='show',
            name='releaseDate',
            field=models.DateTimeField(default='1800-01-01'),
        ),
    ]