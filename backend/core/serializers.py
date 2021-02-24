import json
from rest_framework import serializers
from core.models import Show, Genre, Country, User
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.conf import settings
from .utils import Util
from rest_framework.exceptions import AuthenticationFailed
from django.utils.encoding import smart_str, force_str, smart_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from podminer.models import RankingHistory
import datetime


class UserSerializer(serializers.ModelSerializer):
    shows_followed = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True)

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)

        if(password is not None):
            instance.set_password(password)

        instance.save()

        # Email config
        subject = 'Thank you for registering to our Podminer'
        message = 'Your username: ' + instance.username + \
            '\n' + 'Your Password: ' + password
        email_from = settings.EMAIL_HOST_USER
        Util.send_email({"email_subject": subject,
                         "email_body": message, "to_email": instance.email})

        return instance

    def update(self, instance, validated_data):

        for attr, val in validated_data.items():
            if(attr == 'password'):
                instance.set_password(val)
            else:
                setattr(instance, attr, val)

        instance.save()
        return instance

    class Meta:
        model = User
        extra_kwargs = {'password': {'write_only': True}}
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name',
                  'is_staff', 'is_superuser', 'shows_followed', 'report_status']


class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        extra_kwargs = {'password': {'write_only': True}, 'first_name': {'required': True}, 'last_name': {
            'required': True}, 'username': {'required': True}, 'email': {'required': True}, 'password': {'required': True}}
        fields = ['first_name', 'last_name', 'username', 'email', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if(password is not None):
            instance.set_password(password)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for attr, val in validated_data.items():
            if(attr == 'password'):
                instance.set_password(val)
            else:
                setattr(instance, attr, val)

        instance.save()
        return instance


class ReportSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        extra_kwargs = {'report_status': {'required': True}}
        fields = ['report_status']

    def update(self, instance, validated_data):
        for attr, val in validated_data.items():
            setattr(instance, attr, val)

        instance.save()

        return instance


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['country_code', 'name', 'gdp']


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['genre_id', 'name']


class ShowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Show
        fields = ['id', 'podcast_id', 'name', 'url',
                  'description', 'image_link', 'slug', 'publisher']


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        credentials = {
            'username': '',
            'password': attrs.get("password")
        }
        user_obj = User.objects.filter(email=attrs.get("username")).first(
        ) or User.objects.filter(username=attrs.get("username")).first()

        if user_obj:
            credentials['username'] = user_obj.username
        data = super().validate(credentials)
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)

        # Add extra responses here
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name
        data['is_superuser'] = self.user.is_superuser
        data['is_staff'] = self.user.is_staff
        return data


class ResetPasswordEmailRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(min_length=2)

    redirect_url = serializers.CharField(max_length=500, required=False)

    class Meta:
        fields = ['email']


class SetNewPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(
        min_length=6, max_length=68, write_only=True)
    token = serializers.CharField(
        min_length=1, write_only=True)
    uidb64 = serializers.CharField(
        min_length=1, write_only=True)

    class Meta:
        fields = ['password', 'token', 'uidb64']

    def validate(self, attrs):
        try:
            password = attrs.get('password')
            token = attrs.get('token')
            uidb64 = attrs.get('uidb64')

            id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise AuthenticationFailed('The reset link is invalid', 401)

            user.set_password(password)
            user.save()

            return (user)
        except Exception as e:
            print(e)
            raise AuthenticationFailed('The reset link is invalid', 401)

        return super().validate(attrs)


class ShowsFollowedHistorySerializer(serializers.ModelSerializer):
    genre = serializers.ReadOnlyField(source='genre.name')
    country = serializers.ReadOnlyField(source='country.name')

    class Meta:
        model = RankingHistory
        fields = ['updated', 'ranking', 'country', 'genre']
