from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create or update the initial system administrator.'

    def add_arguments(self, parser):
        parser.add_argument('--username', required=True)
        parser.add_argument('--password', required=True)

    def handle(self, *args, **options):
        user_model = get_user_model()
        user, _ = user_model.objects.get_or_create(username=options['username'])
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.set_password(options['password'])
        user.save()
        self.stdout.write(self.style.SUCCESS('Initial administrator is ready.'))
