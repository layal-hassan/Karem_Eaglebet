<template>
  <section class="space-y-6">
    <PageHeader
      title="الفاتورة وكشف الحساب"
      description="معاينة وتهيئة كشف حساب احترافي قابل للطباعة مع إخفاء عناصر الواجهة أثناء الطباعة."
      eyebrow="Statements"
      :breadcrumb="['الرئيسية', 'كشف الحساب']"
    >
      <template #actions>
        <Button class="ghost-button !rounded-2xl !px-5" label="معاينة" @click="generatePreview" />
        <Button class="ghost-button !rounded-2xl !px-5" label="طباعة" @click="handlePrint" />
        <Button class="gold-button !rounded-2xl !border-0 !px-5" label="تنزيل PDF" @click="notifyPdf" />
      </template>
    </PageHeader>

    <FilterBar>
      <div class="min-w-[260px] flex-1">
        <label class="mb-2 block text-sm font-semibold">اختيار الوكيل</label>
        <Dropdown v-model="selectedAgentId" :options="agentOptions" option-label="label" option-value="value" />
      </div>
      <div class="min-w-[280px] flex-1">
        <label class="mb-2 block text-sm font-semibold">اختيار الفترة</label>
        <DateRangePicker v-model="dateRange" />
      </div>
    </FilterBar>

    <PrintLayout v-if="preview" class="no-print:!hidden">
      <div class="flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
        <div class="flex items-center gap-4">
          <img alt="EAGLEBET" class="h-20 w-20 rounded-3xl object-cover" src="/eaglebet-logo.png" />
          <div>
            <h2 class="text-3xl font-extrabold">EAGLEBET</h2>
            <p class="text-sm text-slate-600">فاتورة / كشف حساب</p>
          </div>
        </div>
        <div class="text-left">
          <p class="text-sm text-slate-500">رقم الكشف</p>
          <p class="text-xl font-bold">INV-{{ preview.agent.code }}</p>
        </div>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <p class="text-sm text-slate-500">اسم الوكيل</p>
          <p class="mt-1 font-bold">{{ preview.agent.name }}</p>
          <p class="text-sm text-slate-600">{{ preview.agent.phone }} - {{ preview.agent.region }}</p>
        </div>
        <div class="text-left">
          <p class="text-sm text-slate-500">الفترة</p>
          <p class="mt-1 font-bold">{{ formatDate(preview.from) }} - {{ formatDate(preview.to) }}</p>
        </div>
      </div>

      <div class="mt-8 grid gap-4 md:grid-cols-4">
        <div class="rounded-3xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500">الرصيد الافتتاحي</p>
          <p class="mt-2 text-xl font-bold">{{ formatCurrency(preview.summary.openingBalance, preview.agent.currency) }}</p>
        </div>
        <div class="rounded-3xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500">إجمالي الشراء</p>
          <p class="mt-2 text-xl font-bold">{{ formatCurrency(preview.summary.totalPurchases, preview.agent.currency) }}</p>
        </div>
        <div class="rounded-3xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500">إجمالي الدفعات</p>
          <p class="mt-2 text-xl font-bold">{{ formatCurrency(preview.summary.totalPayments, preview.agent.currency) }}</p>
        </div>
        <div class="rounded-3xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500">الرصيد النهائي</p>
          <p class="mt-2 text-xl font-bold">{{ formatCurrency(preview.summary.closingBalance, preview.agent.currency) }}</p>
        </div>
      </div>

      <table class="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500">
            <th class="py-3 text-right">التاريخ</th>
            <th class="py-3 text-right">العملية</th>
            <th class="py-3 text-right">المرجع</th>
            <th class="py-3 text-right">المبلغ</th>
            <th class="py-3 text-right">الملاحظات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in preview.entries" :key="entry.id" class="border-b border-slate-100">
            <td class="py-3">{{ formatDate(entry.createdAt) }}</td>
            <td class="py-3">{{ entry.type }}</td>
            <td class="py-3">{{ entry.reference }}</td>
            <td class="py-3">{{ formatCurrency(entry.type === 'شراء' ? (entry.receivedBalance ?? entry.amount) : entry.amount, entry.currency) }}</td>
            <td class="py-3">{{ entry.note || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="mt-8 grid gap-4 md:grid-cols-3">
        <div class="rounded-3xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500">ربح الوكيل</p>
          <p class="mt-2 font-bold">{{ formatCurrency(preview.summary.agentProfit, preview.agent.currency) }}</p>
        </div>
        <div class="rounded-3xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500">حصة الشركة</p>
          <p class="mt-2 font-bold">{{ formatCurrency(preview.summary.companyShare, preview.agent.currency) }}</p>
        </div>
        <div class="rounded-3xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500">ملاحظات</p>
          <p class="mt-2 font-bold">{{ preview.agent.notes }}</p>
        </div>
      </div>

      <div class="mt-14 grid gap-10 md:grid-cols-2">
        <div>
          <p class="text-sm text-slate-500">التوقيع</p>
          <div class="mt-4 h-24 rounded-3xl border border-dashed border-slate-300"></div>
        </div>
        <div>
          <p class="text-sm text-slate-500">الختم</p>
          <div class="mt-4 h-24 rounded-3xl border border-dashed border-slate-300"></div>
        </div>
      </div>
    </PrintLayout>
  </section>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import PrintLayout from '@/components/common/PrintLayout.vue'
import DateRangePicker from '@/components/forms/DateRangePicker.vue'
import FilterBar from '@/components/forms/FilterBar.vue'
import { useAccountingStore } from '@/stores/accounting'
import type { StatementPreview } from '@/types'
import { buildStatementPreview } from '@/utils/accounting'
import { formatCurrency, formatDate } from '@/utils/formatters'

const store = useAccountingStore()
const toast = useToast()
const selectedAgentId = ref(store.agentSummaries[0]?.id ?? '')
const dateRange = ref<Date[] | null>([new Date('2026-06-15'), new Date('2026-07-14')])
const preview = ref<StatementPreview | null>(null)

const agentOptions = computed(() => store.agentSummaries.map((agent) => ({ label: `${agent.name} - ${agent.code}`, value: agent.id })))

const generatePreview = () => {
  const agent = store.agentSummaries.find((item) => item.id === selectedAgentId.value)
  if (!agent || !dateRange.value?.[0] || !dateRange.value?.[1]) return

  preview.value = buildStatementPreview(
    agent,
    store.transactions,
    dateRange.value[0].toISOString(),
    dateRange.value[1].toISOString(),
  )
}

generatePreview()

const notifyPdf = () => {
  toast.add({
    severity: 'info',
    summary: 'واجهة فقط',
    detail: 'تنزيل PDF سيُربط لاحقاً مع خدمة توليد ملفات.',
    life: 2500,
  })
}

const handlePrint = () => {
  window.print()
}
</script>
