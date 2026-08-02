<template>
  <section class="space-y-6">
    <PageHeader
      title="التقارير"
      description="تقارير يومية وأسبوعية وشهرية وتقارير حسب الوكيل مع فصل واضح بين الدولار والليرة."
      eyebrow="Reports"
      :breadcrumb="['الرئيسية', 'التقارير']"
    >
      <template #actions>
        <Button class="ghost-button !rounded-2xl !px-5" label="PDF" @click="notify('تجهيز تصدير PDF كواجهة فقط')" />
        <Button class="ghost-button !rounded-2xl !px-5" label="Excel" @click="notify('تجهيز تصدير Excel كواجهة فقط')" />
        <Button class="gold-button !rounded-2xl !border-0 !px-5" label="طباعة" @click="handlePrint" />
      </template>
    </PageHeader>

    <FilterBar>
      <div class="min-w-[250px] flex-1">
        <label class="mb-2 block text-sm font-semibold">الفترة</label>
        <DateRangePicker v-model="dateRange" />
      </div>
      <div class="min-w-[220px] flex-1">
        <label class="mb-2 block text-sm font-semibold">الوكيل</label>
        <Dropdown v-model="selectedAgentId" :options="agentOptions" option-label="label" option-value="value" />
      </div>
      <div class="min-w-[160px] flex-1">
        <label class="mb-2 block text-sm font-semibold">العملة</label>
        <Dropdown v-model="selectedCurrency" :options="currencyOptions" option-label="label" option-value="value" />
      </div>
    </FilterBar>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard :icon="Wallet" title="إجمالي الرصيد" :value="reportPurchased.USD" :secondary="reportPurchased.SYP" />
      <StatCard :icon="ArrowDownToLine" title="الدفعات" :value="reportPayments.USD" :secondary="reportPayments.SYP" />
      <StatCard :icon="ArrowUpFromLine" title="السحوبات" :value="reportWithdrawals.USD" :secondary="reportWithdrawals.SYP" />
      <StatCard :icon="BadgeDollarSign" title="الأرباح والخسائر" :value="reportProfit.USD" :secondary="reportProfit.SYP" />
    </div>

    <article class="panel p-4 md:p-5">
      <div class="panel-muted overflow-x-auto p-2">
        <div class="flex min-w-max gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="rounded-2xl px-4 py-3 text-sm font-bold whitespace-nowrap transition"
            :class="
              activeTab === tab.value
                ? 'bg-amber-400/14 text-[#f1deb0]'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            "
            type="button"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="mt-5 grid gap-4 lg:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div class="panel-muted p-4">
          <h3 class="mb-4 text-lg font-bold">{{ currentTab.label }}</h3>

          <div class="grid gap-3 md:hidden">
            <article
              v-for="row in reportRows"
              :key="row.id"
              class="rounded-2xl border border-white/8 bg-black/10 p-4"
            >
              <p class="mb-3 font-bold">{{ row.label }}</p>
              <div class="grid gap-3">
                <div class="rounded-2xl bg-white/5 p-3">
                  <p class="muted-text mb-1 text-xs">المشتريات</p>
                  <p class="text-sm font-semibold">{{ formatCurrency(row.purchases.USD, 'USD') }}</p>
                  <p class="muted-text text-sm">{{ formatCurrency(row.purchases.SYP, 'SYP') }}</p>
                </div>
                <div class="rounded-2xl bg-white/5 p-3">
                  <p class="muted-text mb-1 text-xs">الدفعات</p>
                  <p class="text-sm font-semibold">{{ formatCurrency(row.payments.USD, 'USD') }}</p>
                  <p class="muted-text text-sm">{{ formatCurrency(row.payments.SYP, 'SYP') }}</p>
                </div>
                <div class="rounded-2xl bg-white/5 p-3">
                  <p class="muted-text mb-1 text-xs">السحوبات</p>
                  <p class="text-sm font-semibold">{{ formatCurrency(row.withdrawals.USD, 'USD') }}</p>
                  <p class="muted-text text-sm">{{ formatCurrency(row.withdrawals.SYP, 'SYP') }}</p>
                </div>
                <div class="rounded-2xl bg-white/5 p-3">
                  <p class="muted-text mb-1 text-xs">الربح</p>
                  <p class="text-sm font-semibold">{{ formatCurrency(row.profit.USD, 'USD') }}</p>
                  <p class="muted-text text-sm">{{ formatCurrency(row.profit.SYP, 'SYP') }}</p>
                </div>
              </div>
            </article>
          </div>

          <div class="hidden md:block">
            <DataTable :items-length="reportRows.length" :value="reportRows">
              <Column field="label" header="البيان" />
              <Column header="المشتريات">
                <template #body="{ data }">
                  <div class="space-y-1 text-sm">
                    <div>{{ formatCurrency(data.purchases.USD, 'USD') }}</div>
                    <div>{{ formatCurrency(data.purchases.SYP, 'SYP') }}</div>
                  </div>
                </template>
              </Column>
              <Column header="الدفعات">
                <template #body="{ data }">
                  <div class="space-y-1 text-sm">
                    <div>{{ formatCurrency(data.payments.USD, 'USD') }}</div>
                    <div>{{ formatCurrency(data.payments.SYP, 'SYP') }}</div>
                  </div>
                </template>
              </Column>
              <Column header="السحوبات">
                <template #body="{ data }">
                  <div class="space-y-1 text-sm">
                    <div>{{ formatCurrency(data.withdrawals.USD, 'USD') }}</div>
                    <div>{{ formatCurrency(data.withdrawals.SYP, 'SYP') }}</div>
                  </div>
                </template>
              </Column>
              <Column header="الربح">
                <template #body="{ data }">
                  <div class="space-y-1 text-sm">
                    <div>{{ formatCurrency(data.profit.USD, 'USD') }}</div>
                    <div>{{ formatCurrency(data.profit.SYP, 'SYP') }}</div>
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>

        <div class="panel-muted p-4">
          <h3 class="mb-4 text-lg font-bold">مخطط التقرير</h3>
          <TrendChart :data="chartData" />
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ArrowDownToLine, ArrowUpFromLine, BadgeDollarSign, Wallet } from 'lucide-vue-next'
import Button from 'primevue/button'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import TrendChart from '@/components/charts/TrendChart.vue'
import DateRangePicker from '@/components/forms/DateRangePicker.vue'
import FilterBar from '@/components/forms/FilterBar.vue'
import DataTable from '@/components/tables/DataTable.vue'
import { useAccountingStore } from '@/stores/accounting'
import { buildDashboardTotals, buildReportRows, filterTransactions } from '@/utils/accounting'
import { formatCurrency, formatTotalsPair } from '@/utils/formatters'

const store = useAccountingStore()
const toast = useToast()
const selectedAgentId = ref('')
const selectedCurrency = ref<'الكل' | 'USD' | 'SYP'>('الكل')
const dateRange = ref<Date[] | null>(null)
const activeTab = ref('daily')
const filters = ref({
  from: '',
  to: '',
})

watch(dateRange, (value) => {
  filters.value.from = value?.[0]?.toISOString() ?? ''
  filters.value.to = value?.[1]?.toISOString() ?? ''
})

const tabs = [
  { label: 'تقرير يومي', value: 'daily' },
  { label: 'تقرير أسبوعي', value: 'weekly' },
  { label: 'تقرير شهري', value: 'monthly' },
  { label: 'حسب الوكيل', value: 'agent' },
  { label: 'الأرباح والخسائر', value: 'profit' },
  { label: 'غير المسددة', value: 'unpaid' },
  { label: 'حركة الرصيد', value: 'movement' },
]

const currentTab = computed(() => tabs.find((tab) => tab.value === activeTab.value) ?? tabs[0])

const agentOptions = computed(() => [
  { label: 'كل الوكلاء', value: '' },
  ...store.agentSummaries.map((agent) => ({
    label: `${agent.name} - ${agent.code}`,
    value: agent.id,
  })),
])

const currencyOptions = [
  { label: 'الكل', value: 'الكل' },
  { label: 'USD', value: 'USD' },
  { label: 'SYP', value: 'SYP' },
]

const scopedAgents = computed(() =>
  selectedAgentId.value
    ? store.agents.filter((agent) => agent.id === selectedAgentId.value)
    : store.agents,
)

const scopedTransactions = computed(() =>
  filterTransactions(store.transactions, {
    agentId: selectedAgentId.value,
    type: 'الكل',
    status: 'الكل',
    currency: selectedCurrency.value,
    from: filters.value.from || undefined,
    to: filters.value.to || undefined,
  }),
)

const reportTotals = computed(() => buildDashboardTotals(scopedAgents.value, scopedTransactions.value))
const reportRows = computed(() => buildReportRows(scopedAgents.value, scopedTransactions.value))
const reportPurchased = computed(() => formatTotalsPair(reportTotals.value.purchased))
const reportPayments = computed(() => formatTotalsPair(reportTotals.value.incomingPayments))
const reportWithdrawals = computed(() => formatTotalsPair(reportTotals.value.withdrawals))
const reportProfit = computed(() => formatTotalsPair(reportTotals.value.companyDue))

const chartData = computed(() =>
  store.trendData.slice(-10).map((item) => ({
    ...item,
    purchases: selectedCurrency.value === 'SYP' ? item.purchases : item.purchases / 15000,
    payments: selectedCurrency.value === 'SYP' ? item.payments : item.payments / 15000,
  })),
)

const notify = (detail: string) => {
  toast.add({ severity: 'info', summary: 'واجهة فقط', detail, life: 2500 })
}

const handlePrint = () => {
  window.print()
}
</script>
