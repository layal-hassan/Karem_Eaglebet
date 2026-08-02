<template>
  <section class="space-y-6">
    <PageHeader
      title="سجل العمليات"
      description="جدول موحد لكل العمليات مع فلاتر سريعة وتفاصيل داخل Drawer وطباعة واجهية."
      eyebrow="Transactions"
      :breadcrumb="['الرئيسية', 'العمليات']"
    >
      <template #actions>
        <Button class="gold-button !rounded-2xl !border-0 !px-5" label="دفعة واردة" @click="router.push('/transactions/payment')" />
        <Button class="ghost-button !rounded-2xl !px-5" label="شراء رصيد" @click="router.push('/transactions/purchase')" />
        <Button class="ghost-button !rounded-2xl !px-5" label="سحب" @click="router.push('/transactions/withdrawal')" />
        <Button class="ghost-button !rounded-2xl !px-5" label="طباعة النتائج" @click="handlePrint" />
        <Button class="ghost-button !rounded-2xl !px-5" label="تصدير" @click="exportResults" />
      </template>
    </PageHeader>

    <FilterBar>
      <div class="min-w-[220px] flex-1">
        <label class="mb-2 block text-sm font-semibold">الوكيل</label>
        <Dropdown v-model="filters.agentId" :options="agentOptions" option-label="label" option-value="value" />
      </div>
      <div class="min-w-[180px] flex-1">
        <label class="mb-2 block text-sm font-semibold">نوع العملية</label>
        <Dropdown v-model="filters.type" :options="typeOptions" option-label="label" option-value="value" />
      </div>
      <div class="min-w-[180px] flex-1">
        <label class="mb-2 block text-sm font-semibold">الحالة</label>
        <Dropdown v-model="filters.status" :options="statusOptions" option-label="label" option-value="value" />
      </div>
      <div class="min-w-[160px] flex-1">
        <label class="mb-2 block text-sm font-semibold">العملة</label>
        <Dropdown v-model="filters.currency" :options="currencyOptions" option-label="label" option-value="value" />
      </div>
      <div class="min-w-[260px] flex-1">
        <label class="mb-2 block text-sm font-semibold">الفترة الزمنية</label>
        <DateRangePicker v-model="dateRange" />
      </div>
      <div class="min-w-[150px] flex-1">
        <label class="mb-2 block text-sm font-semibold">أدنى مبلغ</label>
        <InputNumber v-model="filters.minAmount" fluid />
      </div>
      <div class="min-w-[150px] flex-1">
        <label class="mb-2 block text-sm font-semibold">أعلى مبلغ</label>
        <InputNumber v-model="filters.maxAmount" fluid />
      </div>
    </FilterBar>

    <DataTable :items-length="pagedTransactions.length" :value="pagedTransactions">
      <Column field="code" header="رقم العملية" />
      <Column header="التاريخ والوقت">
        <template #body="{ data }">
          {{ formatDateTime(data.createdAt) }}
        </template>
      </Column>
      <Column header="الوكيل">
        <template #body="{ data }">
          {{ agentName(data.agentId) }}
        </template>
      </Column>
      <Column field="type" header="نوع العملية" />
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
      <Column field="createdBy" header="المستخدم" />
      <Column field="reference" header="المرجع" />
      <Column header="إجراءات">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button aria-label="تفاصيل" icon="pi pi-eye" rounded text @click="openDrawer(data.id)" />
            <Button aria-label="طباعة" icon="pi pi-print" rounded text @click="handlePrint" />
          </div>
        </template>
      </Column>

      <template #mobile>
        <article v-for="transaction in pagedTransactions" :key="transaction.id" class="panel-muted space-y-3 p-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-bold">{{ transaction.code }}</p>
              <p class="muted-text text-sm">{{ agentName(transaction.agentId) }}</p>
            </div>
            <StatusBadge :status="transaction.status" />
          </div>
          <CurrencyBadge :amount="displayAmount(transaction)" :currency="transaction.currency" />
          <Button class="!w-full" label="تفاصيل العملية" outlined @click="openDrawer(transaction.id)" />
        </article>
      </template>
    </DataTable>

    <Pagination :first="first" :rows="rows" :total-records="filteredTransactions.length" @update:first="first = $event" />

    <FormDrawer
      :description="selectedTransaction ? `${agentName(selectedTransaction.agentId)} - ${selectedTransaction.type}` : ''"
      title="تفاصيل العملية"
      :visible="drawerVisible"
      @update:visible="drawerVisible = $event"
    >
      <div v-if="selectedTransaction" class="space-y-4">
        <div class="panel-muted grid gap-4 p-4">
          <div class="flex items-center justify-between">
            <span class="muted-text">رقم العملية</span>
            <strong>{{ selectedTransaction.code }}</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="muted-text">التاريخ</span>
            <strong>{{ formatDateTime(selectedTransaction.createdAt) }}</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="muted-text">المبلغ</span>
            <CurrencyBadge :amount="displayAmount(selectedTransaction)" :currency="selectedTransaction.currency" />
          </div>
          <div class="flex items-center justify-between">
            <span class="muted-text">الحالة</span>
            <StatusBadge :status="selectedTransaction.status" />
          </div>
          <div class="flex items-center justify-between">
            <span class="muted-text">المرجع</span>
            <strong>{{ selectedTransaction.reference }}</strong>
          </div>
          <div>
            <p class="muted-text mb-2">ملاحظات</p>
            <p class="leading-7">{{ selectedTransaction.note || 'لا توجد ملاحظات' }}</p>
          </div>
        </div>
      </div>
    </FormDrawer>
  </section>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import CurrencyBadge from '@/components/common/CurrencyBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import DateRangePicker from '@/components/forms/DateRangePicker.vue'
import FilterBar from '@/components/forms/FilterBar.vue'
import FormDrawer from '@/components/forms/FormDrawer.vue'
import DataTable from '@/components/tables/DataTable.vue'
import Pagination from '@/components/tables/Pagination.vue'
import { useAccountingStore } from '@/stores/accounting'
import type { TransactionFilters, TransactionRecord } from '@/types'
import { filterTransactions } from '@/utils/accounting'
import { formatDateTime } from '@/utils/formatters'

const store = useAccountingStore()
const router = useRouter()
const rows = 10
const first = ref(0)
const drawerVisible = ref(false)
const selectedTransactionId = ref<string | null>(null)
const dateRange = ref<Date[] | null>(null)

const filters = reactive<TransactionFilters>({
  agentId: '',
  type: 'الكل',
  status: 'الكل',
  currency: 'الكل',
})

watch(dateRange, (value) => {
  filters.from = value?.[0]?.toISOString()
  filters.to = value?.[1]?.toISOString()
})

const agentOptions = computed(() => [
  { label: 'كل الوكلاء', value: '' },
  ...store.agentSummaries.map((agent) => ({
    label: `${agent.name} - ${agent.code}`,
    value: agent.id,
  })),
])

const typeOptions = [
  { label: 'الكل', value: 'الكل' },
  { label: 'شراء', value: 'شراء' },
  { label: 'دفعة واردة', value: 'دفعة واردة' },
  { label: 'سحب', value: 'سحب' },
  { label: 'تعديل رصيد', value: 'تعديل رصيد' },
]

const statusOptions = [
  { label: 'الكل', value: 'الكل' },
  { label: 'مؤكدة', value: 'مؤكدة' },
  { label: 'قيد المراجعة', value: 'قيد المراجعة' },
  { label: 'مرفوضة', value: 'مرفوضة' },
  { label: 'ملغاة', value: 'ملغاة' },
]

const currencyOptions = [
  { label: 'الكل', value: 'الكل' },
  { label: 'USD', value: 'USD' },
  { label: 'SYP', value: 'SYP' },
]

const filteredTransactions = computed(() => filterTransactions(store.transactions, filters))
const pagedTransactions = computed(() =>
  filteredTransactions.value.slice(first.value, first.value + rows),
)
const selectedTransaction = computed(
  () => store.transactions.find((transaction) => transaction.id === selectedTransactionId.value) ?? null,
)

const agentName = (agentId: string) =>
  store.agentSummaries.find((agent) => agent.id === agentId)?.name ?? 'غير معروف'

const displayAmount = (transaction: TransactionRecord) =>
  transaction.type === 'شراء' ? (transaction.receivedBalance ?? transaction.amount) : transaction.amount

const openDrawer = (id: string) => {
  selectedTransactionId.value = id
  drawerVisible.value = true
}

const exportResults = () => {
  window.alert('واجهة فقط: سيتم لاحقاً تنفيذ التصدير الفعلي للنتائج.')
}

const handlePrint = () => {
  window.print()
}
</script>
