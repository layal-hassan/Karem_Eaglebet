from decimal import Decimal

from django.db import migrations, models
import django.db.models.deletion


def transaction_delta(record):
    if record.transaction_type == 'شراء':
        return record.received_balance or Decimal('0')
    if record.transaction_type == 'دفعة واردة':
        return -record.amount
    if record.transaction_type == 'سحب':
        return -(record.returned_balance if record.returned_balance is not None else record.amount)
    if record.transaction_type == 'تعديل رصيد':
        return record.amount
    raise RuntimeError(f'Unsupported transaction type {record.transaction_type!r} in transaction {record.record_id}.')


def build_ledger(apps, schema_editor):
    Transaction = apps.get_model('core', 'Transaction')
    LedgerEntry = apps.get_model('core', 'LedgerEntry')
    balances = {}
    records = Transaction.objects.filter(status='مؤكدة').order_by('occurred_at', 'id')
    for record in records.iterator():
        key = (record.agent_id, record.currency)
        delta = transaction_delta(record)
        balance = balances.get(key, Decimal('0')) + delta
        LedgerEntry.objects.create(
            transaction_id=record.id,
            agent_id=record.agent_id,
            currency=record.currency,
            delta=delta,
            balance_after=balance,
        )
        balances[key] = balance


class Migration(migrations.Migration):
    dependencies = [('core', '0002_normalize_accounting_records')]

    operations = [
        migrations.CreateModel(
            name='LedgerEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('currency', models.CharField(max_length=3)),
                ('delta', models.DecimalField(decimal_places=3, max_digits=24)),
                ('balance_after', models.DecimalField(decimal_places=3, max_digits=24)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('agent', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='ledger_entries', to='core.agent')),
                ('transaction', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, related_name='ledger_entry', to='core.transaction')),
            ],
            options={'ordering': ('created_at', 'id')},
        ),
        migrations.RunPython(build_ledger, migrations.RunPython.noop),
    ]
