# Generated by Django 3.1.3 on 2020-12-17 07:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0018_show_publisher'),
        ('podminer', '0011_ranking_last_rankingnew'),
    ]

    operations = [
        migrations.CreateModel(
            name='PowerRanking',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('powerranking', models.IntegerField()),
                ('updated', models.DateTimeField(auto_now_add=True)),
                ('store_url', models.TextField(blank=True, null=True)),
                ('show', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='powerrankings', to='core.show')),
            ],
            options={
                'db_table': 'podminer_powerrankings',
                'ordering': ['powerranking'],
                'default_related_name': 'powerrankings',
            },
        ),
    ]
