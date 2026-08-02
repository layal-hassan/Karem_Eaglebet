from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.db import migrations, models
from django.utils.dateparse import parse_datetime
from django.utils.timezone import now
import django.db.models.deletion


def decimal_value(value):
    if value in (None, ''):
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return None


def datetime_value(value):
    if not value:
        return now()
    return parse_datetime(value) or now()


def migrate_records(apps, schema_editor):
    LegacyAgent = apps.get_model('core', 'LegacyAgent')
    LegacyTransaction = apps.get_model('core', 'LegacyTransaction')
    Agent = apps.get_model('core', 'Agent')
    Transaction = apps.get_model('core', 'Transaction')

    agents = {}
    for legacy in LegacyAgent.objects.all().iterator():
        data = legacy.payload or {}
        agent = Agent.objects.create(
            owner_id=legacy.owner_id,
            record_id=str(data.get('id') or legacy.record_id),
            code=str(data.get('code') or legacy.record_id),
            name=str(data.get('name') or ''),
            phone=str(data.get('phone') or ''),
            username=str(data.get('username') or ''),
            region=str(data.get('region') or ''),
            currency=str(data.get('currency') or 'USD'),
            accounting_type=str(data.get('accountingType') or ''),
            agent_rate=decimal_value(data.get('agentRate')),
            company_rate=decimal_value(data.get('companyRate')),
            bonus_mode=str(data.get('bonusMode') or ''),
            bonus_value=decimal_value(data.get('bonusValue')),
            notes=str(data.get('notes') or ''),
            status=str(data.get('status') or ''),
            type_label=str(data.get('typeLabel') or ''),
            client_created_at=datetime_value(data.get('createdAt')),
            client_updated_at=datetime_value(data.get('updatedAt')),
        )
        agents[(legacy.owner_id, legacy.record_id)] = agent

    decimal_fields = (
        'paidAmount', 'receivedBalance', 'exchangeRate', 'agentShare',
        'companyShare', 'netAmount', 'siteBalanceRequested',
        'previousPaidAmount', 'returnedBalance', 'refundAmount', 'profitLoss',
    )
    field_names = {
        'paidAmount': 'paid_amount', 'receivedBalance': 'received_balance',
        'exchangeRate': 'exchange_rate', 'agentShare': 'agent_share',
        'companyShare': 'company_share', 'netAmount': 'net_amount',
        'siteBalanceRequested': 'site_balance_requested',
        'previousPaidAmount': 'previous_paid_amount',
        'returnedBalance': 'returned_balance', 'refundAmount': 'refund_amount',
        'profitLoss': 'profit_loss',
    }
    for legacy in LegacyTransaction.objects.all().iterator():
        data = legacy.payload or {}
        agent_id = str(data.get('agentId') or '')
        agent = agents.get((legacy.owner_id, agent_id))
        if agent is None:
            raise RuntimeError(
                f'Cannot migrate transaction {legacy.record_id}: '
                f'agent {agent_id!r} does not belong to owner {legacy.owner_id}.'
            )
        optional_decimals = {field_names[key]: decimal_value(data.get(key)) for key in decimal_fields}
        Transaction.objects.create(
            owner_id=legacy.owner_id,
            record_id=str(data.get('id') or legacy.record_id),
            agent=agent,
            code=str(data.get('code') or legacy.record_id),
            transaction_type=str(data.get('type') or ''),
            amount=decimal_value(data.get('amount')) or Decimal('0'),
            currency=str(data.get('currency') or agent.currency),
            status=str(data.get('status') or ''),
            occurred_at=datetime_value(data.get('createdAt')),
            created_by=str(data.get('createdBy') or ''),
            reference=str(data.get('reference') or ''),
            note=str(data.get('note') or ''),
            payment_method=str(data.get('paymentMethod') or ''),
            attachment_name=str(data.get('attachmentName') or ''),
            transfer_reference=str(data.get('transferReference') or ''),
            withdrawal_type=str(data.get('withdrawalType') or ''),
            **optional_decimals,
        )


class Migration(migrations.Migration):
    dependencies = [('core', '0001_initial')]

    operations = [
        migrations.RenameModel(old_name='Agent', new_name='LegacyAgent'),
        migrations.RenameModel(old_name='Transaction', new_name='LegacyTransaction'),
        migrations.CreateModel(
            name='Agent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('record_id', models.CharField(max_length=100)), ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)), ('code', models.CharField(max_length=100)),
                ('name', models.CharField(max_length=200)), ('phone', models.CharField(max_length=50)),
                ('username', models.CharField(blank=True, max_length=150)), ('region', models.CharField(max_length=150)),
                ('currency', models.CharField(max_length=3)), ('accounting_type', models.CharField(max_length=100)),
                ('agent_rate', models.DecimalField(blank=True, decimal_places=3, max_digits=7, null=True)),
                ('company_rate', models.DecimalField(blank=True, decimal_places=3, max_digits=7, null=True)),
                ('bonus_mode', models.CharField(blank=True, max_length=100)),
                ('bonus_value', models.DecimalField(blank=True, decimal_places=3, max_digits=20, null=True)),
                ('notes', models.TextField(blank=True)), ('status', models.CharField(max_length=100)),
                ('type_label', models.CharField(max_length=100)), ('client_created_at', models.DateTimeField()),
                ('client_updated_at', models.DateTimeField()),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ], options={'ordering': ('-created_at',)},
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('record_id', models.CharField(max_length=100)), ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)), ('code', models.CharField(max_length=100)),
                ('transaction_type', models.CharField(max_length=100)),
                ('amount', models.DecimalField(decimal_places=3, max_digits=24)), ('currency', models.CharField(max_length=3)),
                ('status', models.CharField(max_length=100)), ('occurred_at', models.DateTimeField()),
                ('created_by', models.CharField(max_length=200)), ('reference', models.CharField(max_length=200)),
                ('note', models.TextField(blank=True)),
                ('paid_amount', models.DecimalField(blank=True, decimal_places=3, max_digits=24, null=True)),
                ('received_balance', models.DecimalField(blank=True, decimal_places=3, max_digits=24, null=True)),
                ('exchange_rate', models.DecimalField(blank=True, decimal_places=6, max_digits=24, null=True)),
                ('agent_share', models.DecimalField(blank=True, decimal_places=3, max_digits=24, null=True)),
                ('company_share', models.DecimalField(blank=True, decimal_places=3, max_digits=24, null=True)),
                ('net_amount', models.DecimalField(blank=True, decimal_places=3, max_digits=24, null=True)),
                ('payment_method', models.CharField(blank=True, max_length=100)),
                ('attachment_name', models.CharField(blank=True, max_length=255)),
                ('transfer_reference', models.CharField(blank=True, max_length=200)),
                ('withdrawal_type', models.CharField(blank=True, max_length=100)),
                ('site_balance_requested', models.DecimalField(blank=True, decimal_places=3, max_digits=24, null=True)),
                ('previous_paid_amount', models.DecimalField(blank=True, decimal_places=3, max_digits=24, null=True)),
                ('returned_balance', models.DecimalField(blank=True, decimal_places=3, max_digits=24, null=True)),
                ('refund_amount', models.DecimalField(blank=True, decimal_places=3, max_digits=24, null=True)),
                ('profit_loss', models.DecimalField(blank=True, decimal_places=3, max_digits=24, null=True)),
                ('agent', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='transactions', to='core.agent')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ], options={'ordering': ('-created_at',)},
        ),
        migrations.RunPython(migrate_records, migrations.RunPython.noop),
        migrations.DeleteModel(name='LegacyAgent'),
        migrations.DeleteModel(name='LegacyTransaction'),
        migrations.AddConstraint(model_name='agent', constraint=models.UniqueConstraint(fields=('owner', 'record_id'), name='unique_agent_per_owner')),
        migrations.AddConstraint(model_name='agent', constraint=models.UniqueConstraint(fields=('owner', 'code'), name='unique_agent_code_per_owner')),
        migrations.AddConstraint(model_name='transaction', constraint=models.UniqueConstraint(fields=('owner', 'record_id'), name='unique_transaction_per_owner')),
        migrations.AddConstraint(model_name='transaction', constraint=models.UniqueConstraint(fields=('owner', 'code'), name='unique_transaction_code_per_owner')),
    ]
