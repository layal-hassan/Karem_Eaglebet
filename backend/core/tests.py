from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


class AccountingApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='owner', password='safe-test-password')
        self.other_user = get_user_model().objects.create_user(username='other', password='safe-test-password')
        self.client.force_authenticate(self.user)

    def agent_payload(self, **overrides):
        payload = {
            'id': 'agent-1', 'code': 'AG-001', 'name': 'Test Agent', 'phone': '12345678',
            'username': 'agent.user', 'region': 'Riyadh', 'currency': 'USD',
            'accountingType': 'profit-share', 'agentRate': 20, 'companyRate': 80,
            'bonusMode': '', 'bonusValue': None, 'notes': '', 'status': 'active',
            'createdAt': '2026-08-02T10:00:00Z', 'updatedAt': '2026-08-02T10:00:00Z',
            'typeLabel': 'main-agent',
        }
        payload.update(overrides)
        return payload

    def transaction_payload(self, **overrides):
        payload = {
            'id': 'tx-1', 'code': 'TRX-001', 'agentId': 'agent-1', 'type': 'شراء',
            'amount': 125.5, 'receivedBalance': 125.5, 'currency': 'USD', 'status': 'مؤكدة',
            'createdAt': '2026-08-02T11:00:00Z', 'createdBy': 'Owner',
            'reference': 'REF-001', 'note': '',
        }
        payload.update(overrides)
        return payload

    def test_agent_and_transaction_round_trip_use_normalized_fields(self):
        agent_response = self.client.post('/api/agents/', self.agent_payload(), format='json')
        self.assertEqual(agent_response.status_code, 201)
        self.assertEqual(agent_response.data['result']['id'], 'agent-1')

        transaction_response = self.client.post('/api/transactions/', self.transaction_payload(), format='json')
        self.assertEqual(transaction_response.status_code, 201)
        self.assertEqual(transaction_response.data['result']['agentId'], 'agent-1')
        self.assertEqual(transaction_response.data['result']['amount'], 125.5)

    def test_transaction_rejects_unknown_or_other_users_agent(self):
        self.client.force_authenticate(self.other_user)
        self.client.post('/api/agents/', self.agent_payload(), format='json')
        self.client.force_authenticate(self.user)

        response = self.client.post('/api/transactions/', self.transaction_payload(), format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('agentId', response.data['result'])

    def test_transaction_currency_must_match_agent(self):
        self.client.post('/api/agents/', self.agent_payload(), format='json')
        response = self.client.post('/api/transactions/', self.transaction_payload(currency='SYP'), format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('currency', response.data['result'])

    def test_agent_currency_is_locked_after_first_transaction(self):
        self.client.post('/api/agents/', self.agent_payload(), format='json')
        self.client.post('/api/transactions/', self.transaction_payload(), format='json')
        response = self.client.put('/api/agents/agent-1/', self.agent_payload(currency='SYP'), format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('currency', response.data['result'])

    def test_confirmed_transactions_build_an_immutable_balance(self):
        self.client.post('/api/agents/', self.agent_payload(), format='json')
        purchase = self.client.post('/api/transactions/', self.transaction_payload(receivedBalance=100), format='json')
        self.assertEqual(purchase.status_code, 201)

        payment = self.client.post('/api/transactions/', self.transaction_payload(
            id='tx-2', code='TRX-002', type='دفعة واردة', amount=30, receivedBalance=None,
        ), format='json')
        self.assertEqual(payment.status_code, 201)

        withdrawal = self.client.post('/api/transactions/', self.transaction_payload(
            id='tx-3', code='TRX-003', type='سحب', amount=25, returnedBalance=20, receivedBalance=None,
        ), format='json')
        self.assertEqual(withdrawal.status_code, 201)

        pending = self.client.post('/api/transactions/', self.transaction_payload(
            id='tx-4', code='TRX-004', type='دفعة واردة', amount=40,
            receivedBalance=None, status='قيد المراجعة',
        ), format='json')
        self.assertEqual(pending.status_code, 201)

        agents = self.client.get('/api/agents/')
        self.assertEqual(agents.data['result'][0]['currentBalance'], 50.0)

        immutable = self.client.put('/api/transactions/tx-1/', self.transaction_payload(amount=999), format='json')
        self.assertEqual(immutable.status_code, 405)
