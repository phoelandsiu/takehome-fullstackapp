from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from .models import User, Comment
from .serializer import UserSerializer, CommentSerializer

# Create your views here.

def _save_serializer_and_respond(serializer, success_status=status.HTTP_201_CREATED):
    """Validate serializer, save and return a Response with the given status on success.

    Keeps the common serializer validation/save/response logic in one place.
    """
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=success_status)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def user_detail(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@api_view(['GET'])
def get_comments(request):
    comments = Comment.objects.all()
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_comment(request):
    # Replace the text for comment with id that already exists using PATCH
    # Create a net new comment if id does not already exist using POST
    data = request.data
    pk = data.get('id')
    comment = None
    if pk is not None:
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            comment = None

    partial = comment is not None
    serializer = CommentSerializer(comment, data=data, partial=partial)
    success_status = status.HTTP_200_OK if comment is not None else status.HTTP_201_CREATED
    return _save_serializer_and_respond(serializer, success_status=success_status)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def comment_detail(request, pk):
    try:
        comment = Comment.objects.get(pk=pk)
    except Comment.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = CommentSerializer(comment)
        return Response(serializer.data)
    
    elif request.method in ('PUT', 'PATCH'):
        partial = (request.method == 'PATCH')
        serializer = CommentSerializer(comment, data=request.data, partial=partial)
        return _save_serializer_and_respond(serializer, success_status=status.HTTP_200_OK)
    
    elif request.method == 'DELETE':
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

