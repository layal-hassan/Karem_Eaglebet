from django.conf import settings
from django.db import models


class OwnedRecord(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    record_id = models.CharField(max_length=100)
    payload = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ('-created_at',)


class Agent(OwnedRecord):
    class Meta(OwnedRecord.Meta):
        constraints = [models.UniqueConstraint(fields=('owner', 'record_id'), name='unique_agent_per_owner')]


class Transaction(OwnedRecord):
    class Meta(OwnedRecord.Meta):
        constraints = [models.UniqueConstraint(fields=('owner', 'record_id'), name='unique_transaction_per_owner')]
