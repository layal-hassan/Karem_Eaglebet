<template>
  <section class="space-y-6">
    <PageHeader
      title="تسجيل شراء رصيد"
      description="إدخال عملية شراء رصيد جديدة مع صندوق حساب مباشر يوضح الحصص والصافي قبل الحفظ."
      eyebrow="Transactions"
      :breadcrumb="['الرئيسية', 'العمليات', 'شراء رصيد']"
    />

    <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <form class="panel space-y-5 p-6" @submit.prevent="submitForm">
        <div class="grid gap-5 md:grid-cols-2">
          <div class="space-y-2 md:col-span-2">
            <label class="text-sm font-semibold">اختيار الوكيل</label>
            <Dropdown
              v-model="agentId"
              :options="agentOptions"
              option-label="label"
              option-value="value"
              placeholder="اختر وكيلاً"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">المبلغ المدفوع</label>
            <InputNumber v-model="paidAmount" :min="1" fluid />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">قيمة الرصيد المستلم</label>
            <InputNumber v-model="receivedBalance" :min="1" fluid />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">العملة</label>
            <Dropdown v-model="currency" :options="currencyOptions" option-label="label" option-value="value" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">سعر الصرف</label>
            <InputNumber v-model="exchangeRate" :min="0" fluid />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">نسبة الوكيل</label>
            <InputNumber v-model="agentRate" :max="100" :min="0" fluid />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">نسبة الشركة</label>
            <InputNumber v-model="companyRate" :max="100" :min="0" fluid />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">تاريخ العملية</label>
            <Calendar v-model="operationDate" class="w-full" date-format="yy/mm/dd" show-icon />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">رقم المرجع</label>
            <InputText v-model="reference" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold">ملاحظات</label>
          <Textarea v-model="notes" auto-resize rows="4" />
        </div>

        <Button class="gold-button !rounded-2xl !border-0 !px-6" label="حفظ العملية" type="submit" />
      </form>

      <article class="panel space-y-5 p-6">
        <div>
          <p class="eyebrow text-xs font-semibold">Live Calculation</p>
          <h3 class="mt-2 text-2xl font-extrabold">ملخص العملية</h3>
        </div>

        <div class="grid gap-3">
          <div class="panel-muted flex items-center justify-between p-4">
            <span class="muted-text">المبلغ المدفوع</span>
            <strong>{{ formatCurrency(paidAmount ?? 0, currency || 'USD') }}</strong>
          </div>
          <div class="panel-muted flex items-center justify-between p-4">
            <span class="muted-text">الرصيد الذي سيحصل عليه الوكيل</span>
            <strong>{{ formatCurrency(receivedBalance ?? 0, currency || 'USD') }}</strong>
          </div>
          <div class="panel-muted flex items-center justify-between p-4">
            <span class="muted-text">حصة الوكيل</span>
            <strong>{{ formatCurrency(agentShare, currency || 'USD') }}</strong>
          </div>
          <div class="panel-muted flex items-center justify-between p-4">
            <span class="muted-text">حصة الشركة</span>
            <strong>{{ formatCurrency(companyShare, currency || 'USD') }}</strong>
          </div>
          <div class="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4">
            <p class="muted-text text-sm">مثال توضيحي</p>
            <p class="mt-2 font-bold">الوكيل دفع 5,000,000 ويحصل على رصيد 7,000,000 مع توزيع مباشر للحصص.</p>
            <p class="mt-3 text-lg font-extrabold text-[#f1deb0]">صافي العملية: {{ formatCurrency(companyShare, currency || 'USD') }}</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { computed, watch } from 'vue'
import { z } from 'zod'
import PageHeader from '@/components/common/PageHeader.vue'
import { useAccountingStore } from '@/stores/accounting'
import { formatCurrency } from '@/utils/formatters'

const store = useAccountingStore()
const toast = useToast()

const purchaseSchema = z.object({
  agentId: z.string().min(1),
  paidAmount: z.number().positive(),
  receivedBalance: z.number().positive(),
  currency: z.enum(['USD', 'SYP']),
  exchangeRate: z.number().optional(),
  agentRate: z.number().optional(),
  companyRate: z.number().optional(),
  operationDate: z.date(),
  reference: z.string().min(3),
  notes: z.string().optional(),
})

type PurchaseFormValues = z.infer<typeof purchaseSchema>

const { defineField, handleSubmit } = useForm<PurchaseFormValues>({
  validationSchema: toTypedSchema(purchaseSchema),
  initialValues: {
    agentId: '',
    paidAmount: 5000000,
    receivedBalance: 7000000,
    currency: 'SYP',
    exchangeRate: 15000,
    agentRate: 20,
    companyRate: 80,
    operationDate: new Date(),
    reference: `PUR-${Date.now().toString().slice(-6)}`,
    notes: '',
  },
})

const [agentId] = defineField('agentId')
const [paidAmount] = defineField('paidAmount')
const [receivedBalance] = defineField('receivedBalance')
const [currency] = defineField('currency')
const [exchangeRate] = defineField('exchangeRate')
const [agentRate] = defineField('agentRate')
const [companyRate] = defineField('companyRate')
const [operationDate] = defineField('operationDate')
const [reference] = defineField('reference')
const [notes] = defineField('notes')

const agentOptions = computed(() => store.agentSummaries.map((agent) => ({ label: `${agent.name} - ${agent.code}`, value: agent.id })))
const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'SYP', value: 'SYP' },
]

const selectedAgent = computed(() => store.agentSummaries.find((agent) => agent.id === agentId.value))
const agentShare = computed(() => ((receivedBalance.value ?? 0) * (agentRate.value ?? 0)) / 100)
const companyShare = computed(() => Math.max((receivedBalance.value ?? 0) - agentShare.value, 0))

watch(selectedAgent, (agent) => {
  if (!agent) return
  currency.value = agent.currency
  agentRate.value = agent.agentRate ?? (agent.accountingType === 'Bonus' && agent.bonusMode === 'نسبة مئوية' ? agent.bonusValue ?? 0 : 0)
  companyRate.value = agent.companyRate ?? 100 - (agentRate.value ?? 0)
})

const submitForm = handleSubmit(async (values) => {
  await store.createTransaction({
    id: `tx-${Date.now()}`,
    code: `TRX-P-${Date.now().toString().slice(-5)}`,
    agentId: values.agentId,
    type: 'شراء',
    amount: values.paidAmount,
    paidAmount: values.paidAmount,
    receivedBalance: values.receivedBalance,
    currency: values.currency,
    status: 'مؤكدة',
    createdAt: values.operationDate.toISOString(),
    createdBy: store.currentUser?.name ?? 'مدير النظام',
    reference: values.reference,
    note: values.notes ?? '',
    exchangeRate: values.exchangeRate,
    agentShare: agentShare.value,
    companyShare: companyShare.value,
    netAmount: companyShare.value,
  })

  toast.add({
    severity: 'success',
    summary: 'تم الحفظ',
    detail: 'تم تسجيل عملية شراء الرصيد بنجاح.',
    life: 3000,
  })
})
</script>
