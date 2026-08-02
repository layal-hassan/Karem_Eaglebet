from django.urls import path
from .views import (
    AgentCollectionView,
    AgentDetailView,
    CurrentUserView,
    LogoutView,
    RefreshView,
    SignInView,
    TransactionCollectionView,
    TransactionDetailView,
)


urlpatterns = [
    path('auth/sign-in/', SignInView.as_view()),
    path('auth/refresh/', RefreshView.as_view()),
    path('auth/me/', CurrentUserView.as_view()),
    path('auth/logout/', LogoutView.as_view()),
    path('agents/', AgentCollectionView.as_view()),
    path('agents/<str:record_id>/', AgentDetailView.as_view()),
    path('transactions/', TransactionCollectionView.as_view()),
    path('transactions/<str:record_id>/', TransactionDetailView.as_view()),
]
