from django.conf import settings
from django.db import models


class OwnedRecord(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    record_id = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ('-created_at',)


class Agent(OwnedRecord):
    code = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50)
    username = models.CharField(max_length=150, blank=True)
    region = models.CharField(max_length=150)
    currency = models.CharField(max_length=3)
    accounting_type = models.CharField(max_length=100)
    agent_rate = models.DecimalField(max_digits=7, decimal_places=3, null=True, blank=True)
    company_rate = models.DecimalField(max_digits=7, decimal_places=3, null=True, blank=True)
    bonus_mode = models.CharField(max_length=100, blank=True)
    bonus_value = models.DecimalField(max_digits=20, decimal_places=3, null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=100)
    type_label = models.CharField(max_length=100)
    client_created_at = models.DateTimeField()
    client_updated_at = models.DateTimeField()

    class Meta(OwnedRecord.Meta):
        constraints = [
            models.UniqueConstraint(fields=('owner', 'record_id'), name='unique_agent_per_owner'),
            models.UniqueConstraint(fields=('owner', 'code'), name='unique_agent_code_per_owner'),
        ]


class Transaction(OwnedRecord):
    agent = models.ForeignKey(Agent, on_delete=models.PROTECT, related_name='transactions')
    code = models.CharField(max_length=100)
    transaction_type = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=24, decimal_places=3)
    currency = models.CharField(max_length=3)
    status = models.CharField(max_length=100)
    occurred_at = models.DateTimeField()
    created_by = models.CharField(max_length=200)
    reference = models.CharField(max_length=200)
    note = models.TextField(blank=True)
    paid_amount = models.DecimalField(max_digits=24, decimal_places=3, null=True, blank=True)
    received_balance = models.DecimalField(max_digits=24, decimal_places=3, null=True, blank=True)
    exchange_rate = models.DecimalField(max_digits=24, decimal_places=6, null=True, blank=True)
    agent_share = models.DecimalField(max_digits=24, decimal_places=3, null=True, blank=True)
    company_share = models.DecimalField(max_digits=24, decimal_places=3, null=True, blank=True)
    net_amount = models.DecimalField(max_digits=24, decimal_places=3, null=True, blank=True)
    payment_method = models.CharField(max_length=100, blank=True)
    attachment_name = models.CharField(max_length=255, blank=True)
    transfer_reference = models.CharField(max_length=200, blank=True)
    withdrawal_type = models.CharField(max_length=100, blank=True)
    site_balance_requested = models.DecimalField(max_digits=24, decimal_places=3, null=True, blank=True)
    previous_paid_amount = models.DecimalField(max_digits=24, decimal_places=3, null=True, blank=True)
    returned_balance = models.DecimalField(max_digits=24, decimal_places=3, null=True, blank=True)
    refund_amount = models.DecimalField(max_digits=24, decimal_places=3, null=True, blank=True)
    profit_loss = models.DecimalField(max_digits=24, decimal_places=3, null=True, blank=True)

    class Meta(OwnedRecord.Meta):
        constraints = [
            models.UniqueConstraint(fields=('owner', 'record_id'), name='unique_transaction_per_owner'),
            models.UniqueConstraint(fields=('owner', 'code'), name='unique_transaction_code_per_owner'),
        ]


class LedgerEntry(models.Model):
    transaction = models.OneToOneField(Transaction, on_delete=models.PROTECT, related_name='ledger_entry')
    agent = models.ForeignKey(Agent, on_delete=models.PROTECT, related_name='ledger_entries')
    currency = models.CharField(max_length=3)
    delta = models.DecimalField(max_digits=24, decimal_places=3)
    balance_after = models.DecimalField(max_digits=24, decimal_places=3)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('created_at', 'id')
