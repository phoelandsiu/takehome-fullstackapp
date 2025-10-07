from rest_framework import serializers
from .models import User, Comment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ('id',)
        extra_kwargs = {
            "image": {
                "required": False,
                "allow_blank": True,   # allow ""
                "allow_null": True,    # allow null
            }
        }