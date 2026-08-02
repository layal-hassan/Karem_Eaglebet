from decimal import Decimal


CONFIRMED_STATUS = 'مؤكدة'
PURCHASE_TYPE = 'شراء'
INCOMING_PAYMENT_TYPE = 'دفعة واردة'
WITHDRAWAL_TYPE = 'سحب'
BALANCE_ADJUSTMENT_TYPE = 'تعديل رصيد'

TRANSACTION_TYPES = {
    PURCHASE_TYPE,
    INCOMING_PAYMENT_TYPE,
    WITHDRAWAL_TYPE,
    BALANCE_ADJUSTMENT_TYPE,
}
TRANSACTION_STATUSES = {'مؤكدة', 'قيد المراجعة', 'مرفوضة', 'ملغاة'}


def transaction_delta(transaction):
    if transaction.transaction_type == PURCHASE_TYPE:
        return transaction.received_balance or Decimal('0')
    if transaction.transaction_type == INCOMING_PAYMENT_TYPE:
        return -transaction.amount
    if transaction.transaction_type == WITHDRAWAL_TYPE:
        return -(transaction.returned_balance if transaction.returned_balance is not None else transaction.amount)
    if transaction.transaction_type == BALANCE_ADJUSTMENT_TYPE:
        return transaction.amount
    raise ValueError(f'Unsupported transaction type: {transaction.transaction_type}')
