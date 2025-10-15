from django.urls import path, include
from .views import get_users, create_user, user_detail
from .views import get_comments, create_comment, comment_detail

urlpatterns = [
    path("api-auth/", include("rest_framework.urls")),

    path('users/', get_users, name='get_users'),
    path('users/create/', create_user, name='create_user'),
    path('users/<int:pk>', user_detail, name='user_detail'),

    path('comments/', get_comments, name='get_comments'),
    path('comments/create/', create_comment, name='create_comment'),
    path('comments/<int:pk>/', comment_detail, name='comment_detail'),
]