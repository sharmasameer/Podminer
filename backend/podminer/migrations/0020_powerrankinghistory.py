# Generated by Django 3.1.5 on 2021-01-19 08:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0025_user_report_followed'),
        ('podminer', '0019_globaltop100_score'),
    ]

    operations = [
        migrations.CreateModel(
            name='PowerRankingHistory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.IntegerField(default=0)),
                ('updated', models.DateTimeField(auto_now_add=True)),
                ('show', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='power_ranking_history', to='core.show')),
            ],
            options={
                'db_table': 'podminer_power_ranking_history',
                'default_related_name': 'power_ranking_history',
            },
        ),
    ]
