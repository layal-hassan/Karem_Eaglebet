from django.db import transaction as db_transaction
from rest_framework import serializers

from .accounting import CONFIRMED_STATUS, TRANSACTION_STATUSES, TRANSACTION_TYPES, transaction_delta
from .models import Agent, LedgerEntry, Transaction


class NumericDecimalField(serializers.DecimalField):
    def __init__(self, *args, **kwargs):
        kwargs['coerce_to_string'] = False
        super().__init__(*args, **kwargs)


class AgentSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='record_id')
    accountingType = serializers.CharField(source='accounting_type')
    agentRate = NumericDecimalField(source='agent_rate', max_digits=7, decimal_places=3, required=False, allow_null=True)
    companyRate = NumericDecimalField(source='company_rate', max_digits=7, decimal_places=3, required=False, allow_null=True)
    bonusMode = serializers.CharField(source='bonus_mode', required=False, allow_blank=True)
    bonusValue = NumericDecimalField(source='bonus_value', max_digits=20, decimal_places=3, required=False, allow_null=True)
    typeLabel = serializers.CharField(source='type_label')
    createdAt = serializers.DateTimeField(source='client_created_at')
    updatedAt = serializers.DateTimeField(source='client_updated_at')
    currentBalance = serializers.SerializerMethodField()

    class Meta:
        model = Agent
        fields = (
            'id', 'code', 'name', 'phone', 'username', 'region', 'currency',
            'accountingType', 'agentRate', 'companyRate', 'bonusMode', 'bonusValue',
            'notes', 'status', 'createdAt', 'updatedAt', 'typeLabel', 'currentBalance',
        )

    def get_currentBalance(self, instance):
        latest = instance.ledger_entries.order_by('-created_at', '-id').first()
        return float(latest.balance_after) if latest else 0

    def validate_currency(self, value):
        if value not in {'USD', 'SYP'}:
            raise serializers.ValidationError('Unsupported currency.')
        return value

    def validate(self, attrs):
        owner = self.context['request'].user
        record_id = attrs.get('record_id', getattr(self.instance, 'record_id', None))
        code = attrs.get('code', getattr(self.instance, 'code', None))
        if Agent.objects.filter(owner=owner, record_id=record_id).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError({'id': 'An agent with this id already exists.'})
        if Agent.objects.filter(owner=owner, code=code).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError({'code': 'An agent with this code already exists.'})
        new_currency = attrs.get('currency', getattr(self.instance, 'currency', None))
        if self.instance and new_currency != self.instance.currency and self.instance.transactions.exists():
            raise serializers.ValidationError({'currency': 'Currency cannot be changed after transactions exist.'})
        return attrs

    def create(self, validated_data):
        return Agent.objects.create(owner=self.context['request'].user, **validated_data)


class TransactionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='record_id')
    agentId = serializers.CharField(write_only=True)
    type = serializers.CharField(source='transaction_type')
    createdAt = serializers.DateTimeField(source='occurred_at')
    createdBy = serializers.CharField(source='created_by')
    amount = NumericDecimalField(max_digits=24, decimal_places=3)
    paidAmount = NumericDecimalField(source='paid_amount', max_digits=24, decimal_places=3, required=False, allow_null=True)
    receivedBalance = NumericDecimalField(source='received_balance', max_digits=24, decimal_places=3, required=False, allow_null=True)
    exchangeRate = NumericDecimalField(source='exchange_rate', max_digits=24, decimal_places=6, required=False, allow_null=True)
    agentShare = NumericDecimalField(source='agent_share', max_digits=24, decimal_places=3, required=False, allow_null=True)
    companyShare = NumericDecimalField(source='company_share', max_digits=24, decimal_places=3, required=False, allow_null=True)
    netAmount = NumericDecimalField(source='net_amount', max_digits=24, decimal_places=3, required=False, allow_null=True)
    paymentMethod = serializers.CharField(source='payment_method', required=False, allow_blank=True)
    attachmentName = serializers.CharField(source='attachment_name', required=False, allow_blank=True)
    transferReference = serializers.CharField(source='transfer_reference', required=False, allow_blank=True)
    withdrawalType = serializers.CharField(source='withdrawal_type', required=False, allow_blank=True)
    siteBalanceRequested = NumericDecimalField(source='site_balance_requested', max_digits=24, decimal_places=3, required=False, allow_null=True)
    previousPaidAmount = NumericDecimalField(source='previous_paid_amount', max_digits=24, decimal_places=3, required=False, allow_null=True)
    returnedBalance = NumericDecimalField(source='returned_balance', max_digits=24, decimal_places=3, required=False, allow_null=True)
    refundAmount = NumericDecimalField(source='refund_amount', max_digits=24, decimal_places=3, required=False, allow_null=True)
    profitLoss = NumericDecimalField(source='profit_loss', max_digits=24, decimal_places=3, required=False, allow_null=True)

    class Meta:
        model = Transaction
        fields = (
            'id', 'code', 'agentId', 'type', 'amount', 'currency', 'status',
            'createdAt', 'createdBy', 'reference', 'note', 'paidAmount',
            'receivedBalance', 'exchangeRate', 'agentShare', 'companyShare',
            'netAmount', 'paymentMethod', 'attachmentName', 'transferReference',
            'withdrawalType', 'siteBalanceRequested', 'previousPaidAmount',
            'returnedBalance', 'refundAmount', 'profitLoss',
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['agentId'] = instance.agent.record_id
        return data

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value

    def validate_currency(self, value):
        if value not in {'USD', 'SYP'}:
            raise serializers.ValidationError('Unsupported currency.')
        return value

    def validate(self, attrs):
        owner = self.context['request'].user
        agent_id = attrs.pop('agentId', None)
        if self.instance is not None and agent_id is None:
            agent = self.instance.agent
        else:
            agent = Agent.objects.filter(owner=owner, record_id=agent_id).first()
        if agent is None:
            raise serializers.ValidationError({'agentId': 'Agent not found.'})
        if attrs.get('currency', getattr(self.instance, 'currency', None)) != agent.currency:
            raise serializers.ValidationError({'currency': 'Transaction currency must match the agent currency.'})
        transaction_type = attrs.get('transaction_type', getattr(self.instance, 'transaction_type', None))
        transaction_status = attrs.get('status', getattr(self.instance, 'status', None))
        if transaction_type not in TRANSACTION_TYPES:
            raise serializers.ValidationError({'type': 'Unsupported transaction type.'})
        if transaction_status not in TRANSACTION_STATUSES:
            raise serializers.ValidationError({'status': 'Unsupported transaction status.'})
        if transaction_type == 'شراء' and not attrs.get('received_balance'):
            raise serializers.ValidationError({'receivedBalance': 'Received balance is required for purchases.'})
        record_id = attrs.get('record_id', getattr(self.instance, 'record_id', None))
        code = attrs.get('code', getattr(self.instance, 'code', None))
        if Transaction.objects.filter(owner=owner, record_id=record_id).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError({'id': 'A transaction with this id already exists.'})
        if Transaction.objects.filter(owner=owner, code=code).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError({'code': 'A transaction with this code already exists.'})
        attrs['agent'] = agent
        return attrs

    def create(self, validated_data):
        owner = self.context['request'].user
        with db_transaction.atomic():
            agent = Agent.objects.select_for_update().get(pk=validated_data['agent'].pk, owner=owner)
            validated_data.pop('agent')
            record = Transaction.objects.create(owner=owner, agent=agent, **validated_data)
            if record.status == CONFIRMED_STATUS:
                latest = agent.ledger_entries.order_by('-created_at', '-id').first()
                previous_balance = latest.balance_after if latest else 0
                delta = transaction_delta(record)
                LedgerEntry.objects.create(
                    transaction=record,
                    agent=agent,
                    currency=record.currency,
                    delta=delta,
                    balance_after=previous_balance + delta,
                )
            return record
