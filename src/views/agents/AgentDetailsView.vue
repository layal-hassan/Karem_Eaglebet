<template>
  <section v-if="agent" class="space-y-6">
    <PageHeader
      :title="agent.name"
      :description="`رقم الوكيل ${agent.code} - ${agent.accountingType}`"
      eyebrow="Agent Details"
      :breadcrumb="['الرئيسية', 'الوكلاء', agent.name]"
    >
      <template #actions>
        <StatusBadge :status="agent.status" />
        <Button class="ghost-button !rounded-2xl !px-5" label="تعديل" @click="router.push(`/agents/${agent.id}/edit`)" />
        <Button class="gold-button !rounded-2xl !border-0 !px-5" label="إضافة عملية" @click="router.push('/transactions/purchase')" />
      </template>
    </PageHeader>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard :icon="Wallet" title="إجمالي الرصيد المشترى" :value="formatCurrency(agent.metrics.totalPurchased, agent.currency)" />
      <StatCard :icon="ArrowDownToLine" title="إجمالي الدفعات الواصلة" :value="formatCurrency(agent.metrics.totalPayments, agent.currency)" />
      <StatCard :icon="ArrowUpFromLine" title="إجمالي السحب" :value="formatCurrency(agent.metrics.totalWithdrawals, agent.currency)" />
      <StatCard :icon="BadgeDollarSign" title="ربح الوكيل" :value="formatCurrency(agent.metrics.agentProfit, agent.currency)" />
      <StatCard :icon="Landmark" title="ربح الشركة" :value="formatCurrency(agent.metrics.companyProfit, agent.currency)" />
      <StatCard :icon="Scale" title="الرصيد المتبقي" :value="formatCurrency(agent.metrics.currentBalance, agent.currency)" />
      <StatCard :icon="HandCoins" title="آخر دفعة" :value="formatCurrency(agent.metrics.lastPayment, agent.currency)" />
      <StatCard :icon="CalendarClock" title="آخر حركة" :value="formatDateTime(agent.lastTransactionAt)" />
    </div>

    <article class="panel p-5">
      <Tabs value="overview">
        <TabList>
          <Tab value="overview">نظرة عامة</Tab>
          <Tab value="statement">كشف الحساب</Tab>
          <Tab value="purchases">عمليات الشراء</Tab>
          <Tab value="payments">الدفعات</Tab>
          <Tab value="withdrawals">السحوبات</Tab>
          <Tab value="notes">الملاحظات</Tab>
        </TabList>
        <TabPanels class="mt-6">
          <TabPanel value="overview">
            <div class="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <div class="panel-muted p-4">
                <h3 class="mb-4 text-lg font-bold">حركة الحساب</h3>
                <TrendChart :data="agentTrendData" />
              </div>
              <div class="space-y-4">
                <div class="panel-muted p-4">
                  <p class="muted-text text-sm">المنطقة</p>
                  <p class="mt-2 font-bold">{{ agent.region }}</p>
                </div>
                <div class="panel-muted p-4">
                  <p class="muted-text text-sm">الهاتف</p>
                  <p class="mt-2 font-bold">{{ agent.phone }}</p>
                </div>
                <div class="panel-muted p-4">
                  <p class="muted-text text-sm">العملة</p>
                  <p class="mt-2 font-bold">{{ agent.currency }}</p>
                </div>
              </div>
            </div>

            <div class="mt-6">
              <h3 class="mb-4 text-lg font-bold">آخر العمليات</h3>
              <DataTable :items-length="recentTransactions.length" :value="recentTransactions">
                <Column field="code" header="رقم العملية" />
                <Column field="type" header="النوع" />
                <Column header="المبلغ">
                  <template #body="{ data }">
                    <CurrencyBadge :amount="displayAmount(data)" :currency="data.currency" />
                  </template>
                </Column>
                <Column header="الحالة">
                  <template #body="{ data }">
                    <StatusBadge :status="data.status" />
                  </template>
                </Column>
                <Column header="التاريخ">
                  <template #body="{ data }">
                    {{ formatDateTime(data.createdAt) }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel value="statement">
            <div class="grid gap-3">
              <div v-for="transaction in agentTransactions" :key="transaction.id" class="panel-muted flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p class="font-bold">{{ transaction.type }} - {{ transaction.code }}</p>
                  <p class="muted-text text-sm">{{ formatDateTime(transaction.createdAt) }}</p>
                </div>
                <CurrencyBadge :amount="displayAmount(transaction)" :currency="transaction.currency" />
              </div>
            </div>
          </TabPanel>

          <TabPanel value="purchases">
            <div class="grid gap-3">
              <div v-for="transaction in purchases" :key="transaction.id" class="panel-muted p-4">
                <div class="flex items-center justify-between">
                  <p class="font-bold">{{ transaction.code }}</p>
                  <CurrencyBadge :amount="transaction.receivedBalance ?? transaction.amount" :currency="transaction.currency" />
                </div>
                <p class="muted-text mt-2 text-sm">{{ transaction.note }}</p>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="payments">
            <div class="grid gap-3">
              <div v-for="transaction in payments" :key="transaction.id" class="panel-muted p-4">
                <div class="flex items-center justify-between">
                  <p class="font-bold">{{ transaction.code }}</p>
                  <CurrencyBadge :amount="transaction.amount" :currency="transaction.currency" />
                </div>
                <p class="muted-text mt-2 text-sm">{{ transaction.paymentMethod }} - {{ transaction.reference }}</p>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="withdrawals">
            <div class="grid gap-3">
              <div v-for="transaction in withdrawals" :key="transaction.id" class="panel-muted p-4">
                <div class="flex items-center justify-between">
                  <p class="font-bold">{{ transaction.code }}</p>
                  <CurrencyBadge :amount="transaction.amount" :currency="transaction.currency" />
                </div>
                <p class="muted-text mt-2 text-sm">{{ transaction.withdrawalType }} - {{ transaction.note }}</p>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="notes">
            <div class="panel-muted p-5">
              <p class="text-lg font-bold">ملاحظات الوكيل</p>
              <p class="muted-text mt-3 leading-8">{{ agent.notes }}</p>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </article>
  </section>

  <section v-else>
    <PageHeader title="تفاصيل الوكيل" description="تعذر العثور على الوكيل المطلوب." eyebrow="Agent Details" :breadcrumb="['الرئيسية', 'الوكلاء']" />
  </section>
</template>

<script setup lang="ts">
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BadgeDollarSign,
  CalendarClock,
  HandCoins,
  Landmark,
  Scale,
  Wallet,
} from 'lucide-vue-next'
import Button from 'primevue/button'
import Column from 'primevue/column'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CurrencyBadge from '@/components/common/CurrencyBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import TrendChart from '@/components/charts/TrendChart.vue'
import DataTable from '@/components/tables/DataTable.vue'
import { useAccountingStore } from '@/stores/accounting'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const store = useAccountingStore()

const agent = computed(() => store.agentSummaries.find((item) => item.id === route.params.id))
const agentTransactions = computed(() => store.transactions.filter((transaction) => transaction.agentId === route.params.id))
const recentTransactions = computed(() => agentTransactions.value.slice(0, 6))
const purchases = computed(() => agentTransactions.value.filter((transaction) => transaction.type === 'شراء'))
const payments = computed(() => agentTransactions.value.filter((transaction) => transaction.type === 'دفعة واردة'))
const withdrawals = computed(() => agentTransactions.value.filter((transaction) => transaction.type === 'سحب'))

const agentTrendData = computed(() =>
  agentTransactions.value
    .slice()
    .reverse()
    .slice(-10)
    .map((transaction) => ({
      date: transaction.createdAt.slice(5, 10),
      purchases: transaction.type === 'شراء' ? transaction.receivedBalance ?? transaction.amount : 0,
      payments: transaction.type === 'دفعة واردة' ? transaction.amount : transaction.type === 'سحب' ? transaction.amount : 0,
    })),
)

const displayAmount = (transaction: (typeof agentTransactions.value)[number]) =>
  transaction.type === 'شراء' ? transaction.receivedBalance ?? transaction.amount : transaction.amount
</script>
