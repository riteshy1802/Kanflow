from rest_framework import serializers
from api.models.user import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['userId', 'name', 'email']
