from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Agent, Transaction
from .serializers import AgentSerializer, TransactionSerializer


def envelope(result, ok=True):
    return {'status': ok, 'result': result, 'notification': []}


class SignInView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user = authenticate(request, username=request.data.get('username', ''), password=request.data.get('password', ''))
        if user is None or not user.is_active:
            return Response(
                envelope(None, False) | {
                    'notification': [{
                        'code': 1,
                        'title': 'تعذر تسجيل الدخول',
                        'content': 'اسم المستخدم أو كلمة المرور غير صحيحة',
                        'autoHideAfter': 4000,
                        'status': 'error',
                    }]
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        refresh = RefreshToken.for_user(user)
        return Response(envelope({'accessToken': str(refresh.access_token), 'refreshToken': str(refresh)}))


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TokenRefreshSerializer(data={'refresh': request.data.get('refreshToken')})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            return Response(
                envelope(None, False) | {
                    'notification': [{
                        'code': 1,
                        'title': 'انتهت الجلسة',
                        'content': 'يرجى تسجيل الدخول مجددًا',
                        'autoHideAfter': 4000,
                        'status': 'error',
                    }]
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response(envelope({
            'accessToken': serializer.validated_data['access'],
            'refreshToken': serializer.validated_data.get('refresh', request.data.get('refreshToken')),
        }))


class LogoutView(APIView):
    def post(self, request):
        try:
            RefreshToken(request.data.get('refreshToken')).blacklist()
        except Exception:
            return Response(envelope(None, False), status=status.HTTP_400_BAD_REQUEST)
        return Response(envelope(True))


class CurrentUserView(APIView):
    def get(self, request):
        return Response(envelope({
            'id': str(request.user.id),
            'name': request.user.get_full_name() or request.user.username,
            'role': 'مدير النظام' if request.user.is_staff else 'مستخدم',
            'avatar': '',
            'username': request.user.username,
        }))


class RecordCollectionView(APIView):
    model = None
    serializer_class = None

    def get(self, request):
        records = self.model.objects.filter(owner=request.user).select_related(*self.select_related())
        return Response(envelope(self.serializer_class(records, many=True, context={'request': request}).data))

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(envelope(serializer.errors, False), status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(envelope(serializer.data), status=status.HTTP_201_CREATED)

    def select_related(self):
        return ()


class RecordDetailView(APIView):
    model = None
    serializer_class = None

    def get_object(self, request, record_id):
        return self.model.objects.filter(owner=request.user, record_id=record_id).select_related(*self.select_related()).first()

    def get(self, request, record_id):
        record = self.get_object(request, record_id)
        if record is None:
            return Response(envelope(None, False), status=status.HTTP_404_NOT_FOUND)
        return Response(envelope(self.serializer_class(record, context={'request': request}).data))

    def put(self, request, record_id):
        record = self.get_object(request, record_id)
        if record is None:
            return Response(envelope(None, False), status=status.HTTP_404_NOT_FOUND)
        if str(request.data.get('id')) != record_id:
            return Response(envelope({'id': ['The URL and payload ids must match.']}, False), status=status.HTTP_400_BAD_REQUEST)
        serializer = self.serializer_class(record, data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(envelope(serializer.errors, False), status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(envelope(serializer.data))

    def select_related(self):
        return ()


class AgentCollectionView(RecordCollectionView):
    model = Agent
    serializer_class = AgentSerializer


class AgentDetailView(RecordDetailView):
    model = Agent
    serializer_class = AgentSerializer


class TransactionCollectionView(RecordCollectionView):
    model = Transaction
    serializer_class = TransactionSerializer

    def select_related(self):
        return ('agent',)


class TransactionDetailView(RecordDetailView):
    model = Transaction
    serializer_class = TransactionSerializer

    def select_related(self):
        return ('agent',)

    def put(self, request, record_id):
        return Response(
            envelope({'detail': 'Financial transactions are immutable; create a correcting transaction.'}, False),
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )
