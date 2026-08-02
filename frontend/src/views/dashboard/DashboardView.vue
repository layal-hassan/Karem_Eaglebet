<template>
  <section class="space-y-6">
    <PageHeader
      title="لوحة التحكم الرئيسية"
      description="متابعة شاملة لحركة الشراء والدفعات وأداء الوكلاء والتنبيهات اليومية."
      eyebrow="Dashboard"
      :breadcrumb="['الرئيسية']"
    >
      <template #actions>
        <div class="panel-muted flex items-center gap-2 p-2">
          <button
            v-for="option in presetOptions"
            :key="option.label"
            class="rounded-2xl px-4 py-2 text-sm font-semibold transition"
            :class="selectedPreset === option.value ? 'gold-button' : 'ghost-button'"
            type="button"
            @click="selectedPreset = option.value"
          >
            {{ option.label }}
          </button>
        </div>
        <div
          v-if="selectedPreset === 'فترة مخصصة'"
          class="w-full md:w-[280px]"
        >
          <DateRangePicker v-model="customRange" />
        </div>
      </template>
    </PageHeader>

    <LoadingSkeleton v-if="store.loading && !store.initialized" />

    <template v-else>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <StatCard
          :icon="Users"
          title="عدد الوكلاء"
          :value="store.dashboardTotals.totalAgents"
          footer="إجمالي الوكلاء النشطين والموقوفين"
        />
        <StatCard
          :icon="Wallet"
          title="إجمالي الرصيد المشترى"
          :value="formattedPurchased.USD"
          :secondary="formattedPurchased.SYP"
        />
        <StatCard
          :icon="ArrowDownToLine"
          title="إجمالي الدفعات الواصلة"
          :value="formattedPayments.USD"
          :secondary="formattedPayments.SYP"
        />
        <StatCard
          :icon="ArrowUpFromLine"
          title="إجمالي عمليات السحب"
          :value="formattedWithdrawals.USD"
          :secondary="formattedWithdrawals.SYP"
        />
        <StatCard
          :icon="Landmark"
          title="مستحقات الشركة"
          :value="formattedCompanyDue.USD"
          :secondary="formattedCompanyDue.SYP"
        />
        <StatCard
          :icon="Scale"
          title="المبالغ المستحقة للوكلاء"
          :value="formattedAgentsDue.USD"
          :secondary="formattedAgentsDue.SYP"
        />
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article class="panel p-5">
          <div class="mb-5">
            <h3 class="text-xl font-bold">ملخص الحركة للفترة</h3>
            <p class="muted-text text-sm">
              تم تبسيط هذا القسم وإزالة المخططات بالكامل.
            </p>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="panel-muted p-4">
              <p class="muted-text text-sm">عدد الأيام المعروضة</p>
              <p class="mt-2 text-2xl font-extrabold">
                {{ filteredTrend.length }}
              </p>
            </div>
            <div class="panel-muted p-4">
              <p class="muted-text text-sm">إجمالي الشراء</p>
              <p class="mt-2 text-2xl font-extrabold">
                {{ periodPurchases }}
              </p>
            </div>
            <div class="panel-muted p-4">
              <p class="muted-text text-sm">إجمالي الدفعات</p>
              <p class="mt-2 text-2xl font-extrabold">
                {{ periodPayments }}
              </p>
            </div>
            <div class="panel-muted p-4">
              <p class="muted-text text-sm">صافي الحركة</p>
              <p class="mt-2 text-2xl font-extrabold">
                {{ periodNet }}
              </p>
            </div>
          </div>
        </article>

        <article class="panel p-5">
          <div class="mb-5">
            <h3 class="text-xl font-bold">توزيع أنواع الوكلاء</h3>
            <p class="muted-text text-sm">
              عرض مختصر حسب التصنيف الداخلي.
            </p>
          </div>
          <div class="space-y-3">
            <div
              v-for="item in store.agentTypeDistribution"
              :key="item.name"
              class="panel-muted flex items-center justify-between p-4"
            >
              <p class="font-bold">{{ item.name }}</p>
              <span
                class="rounded-2xl bg-amber-400/10 px-3 py-2 text-sm font-bold text-[#f1deb0]"
              >
                {{ item.value }} وكلاء
              </span>
            </div>
          </div>
        </article>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section class="space-y-6">
          <article class="panel p-5">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold">آخر 8 عمليات</h3>
                <p class="muted-text text-sm">
                  سجل سريع لأحدث الحركة المحاسبية.
                </p>
              </div>
            </div>
            <DataTable
              :items-length="store.recentTransactions.length"
              :value="store.recentTransactions"
            >
              <Column field="code" header="رقم العملية" />
              <Column header="الوكيل">
                <template #body="{ data }">
                  {{ agentName(data.agentId) }}
                </template>
              </Column>
              <Column field="type" header="النوع" />
              <Column header="المبلغ">
                <template #body="{ data }">
                  <CurrencyBadge
                    :amount="
                      data.type === 'شراء'
                        ? (data.receivedBalance ?? data.amount)
                        : data.amount
                    "
                    :currency="data.currency"
                  />
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

              <template #mobile>
                <article
                  v-for="transaction in store.recentTransactions"
                  :key="transaction.id"
                  class="panel-muted space-y-3 p-4"
                >
                  <div class="flex items-center justify-between gap-3">
                    <p class="font-bold">{{ transaction.code }}</p>
                    <StatusBadge :status="transaction.status" />
                  </div>
                  <p class="muted-text text-sm">
                    {{ agentName(transaction.agentId) }} - {{ transaction.type }}
                  </p>
                  <CurrencyBadge
                    :amount="
                      transaction.type === 'شراء'
                        ? (transaction.receivedBalance ?? transaction.amount)
                        : transaction.amount
                    "
                    :currency="transaction.currency"
                  />
                </article>
              </template>
            </DataTable>
          </article>
        </section>

        <section class="space-y-6">
          <article class="panel p-5">
            <div class="mb-4">
              <h3 class="text-xl font-bold">أكثر 5 وكلاء نشاطاً</h3>
              <p class="muted-text text-sm">
                بحسب إجمالي الرصيد المشترى.
              </p>
            </div>
            <div class="space-y-3">
              <div
                v-for="agent in store.topActiveAgents"
                :key="agent.id"
                class="panel-muted flex items-center justify-between gap-3 p-4"
              >
                <div>
                  <p class="font-bold">{{ agent.name }}</p>
                  <p class="muted-text text-sm">
                    {{ agent.code }} - {{ agent.typeLabel }}
                  </p>
                </div>
                <CurrencyBadge
                  :amount="agent.metrics.totalPurchased"
                  :currency="agent.currency"
                />
              </div>
            </div>
          </article>

          <article class="panel p-5">
            <div class="mb-4">
              <h3 class="text-xl font-bold">تنبيهات المحاسبة</h3>
              <p class="muted-text text-sm">
                حالات تحتاج متابعة أو مراجعة.
              </p>
            </div>
            <div class="space-y-3">
              <div
                v-for="alert in store.alerts"
                :key="alert.id"
                class="rounded-2xl border px-4 py-3"
                :class="
                  alert.severity === 'danger'
                    ? 'border-red-400/20 bg-red-500/10'
                    : 'border-amber-400/20 bg-amber-400/10'
                "
              >
                <p class="font-bold">{{ alert.title }}</p>
                <p class="muted-text mt-1 text-sm">
                  {{ alert.description }}
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Landmark,
  Scale,
  Users,
  Wallet,
} from 'lucide-vue-next'
import Column from 'primevue/column'
import { computed, ref } from 'vue'
import CurrencyBadge from '@/components/common/CurrencyBadge.vue'
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import DateRangePicker from '@/components/forms/DateRangePicker.vue'
import DataTable from '@/components/tables/DataTable.vue'
import { useAccountingStore } from '@/stores/accounting'
import { formatCurrency, formatDateTime, formatTotalsPair } from '@/utils/formatters'

const store = useAccountingStore()

const presetOptions = [
  { label: 'اليوم', value: 'اليوم' },
  { label: 'الأسبوع', value: 'الأسبوع' },
  { label: 'الشهر', value: 'الشهر' },
  { label: 'فترة مخصصة', value: 'فترة مخصصة' },
] as const

const selectedPreset = ref<(typeof presetOptions)[number]['value']>('الشهر')
const customRange = ref<Date[] | null>(null)

const formattedPurchased = computed(() => formatTotalsPair(store.dashboardTotals.purchased))
const formattedPayments = computed(() => formatTotalsPair(store.dashboardTotals.incomingPayments))
const formattedWithdrawals = computed(() => formatTotalsPair(store.dashboardTotals.withdrawals))
const formattedCompanyDue = computed(() => formatTotalsPair(store.dashboardTotals.companyDue))
const formattedAgentsDue = computed(() => formatTotalsPair(store.dashboardTotals.agentsDue))

const filteredTrend = computed(() => {
  if (selectedPreset.value === 'اليوم') return store.trendData.slice(-1)
  if (selectedPreset.value === 'الأسبوع') return store.trendData.slice(-7)
  if (selectedPreset.value === 'الشهر') return store.trendData.slice(-30)

  if (!customRange.value || customRange.value.length < 2) return store.trendData

  const from = customRange.value[0]
  const to = customRange.value[1]

  return store.trendData.filter((item) => {
    const date = new Date(item.date)
    return date >= from && date <= to
  })
})

const periodPurchases = computed(() =>
  formatCurrency(
    filteredTrend.value.reduce((sum, item) => sum + item.purchases, 0),
    'SYP',
  ),
)

const periodPayments = computed(() =>
  formatCurrency(
    filteredTrend.value.reduce((sum, item) => sum + item.payments, 0),
    'SYP',
  ),
)

const periodNet = computed(() =>
  formatCurrency(
    filteredTrend.value.reduce((sum, item) => sum + item.purchases - item.payments, 0),
    'SYP',
  ),
)

const agentName = (agentId: string) =>
  store.agentSummaries.find((agent) => agent.id === agentId)?.name ?? 'وكيل غير معروف'
</script>
