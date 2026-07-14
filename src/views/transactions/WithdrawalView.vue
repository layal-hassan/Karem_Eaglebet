<template>
  <section class="space-y-6">
    <PageHeader
      title="تسجيل سحب"
      description="تسجيل سحب جديد مع قيم قابلة للتعديل للحساب النهائي دون فرض صيغة محاسبية جامدة."
      eyebrow="Transactions"
      :breadcrumb="['الرئيسية', 'العمليات', 'سحب']"
    />

    <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <form class="panel space-y-5 p-6" @submit.prevent="submitForm">
        <div class="grid gap-5 md:grid-cols-2">
          <div class="space-y-2 md:col-span-2">
            <label class="text-sm font-semibold">الوكيل</label>
            <Dropdown v-model="agentId" :options="agentOptions" option-label="label" option-value="value" placeholder="اختر الوكيل" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">مبلغ السحب</label>
            <InputNumber v-model="amount" :min="1" fluid />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">العملة</label>
            <Dropdown v-model="currency" :options="currencyOptions" option-label="label" option-value="value" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">نوع السحب</label>
            <Dropdown v-model="withdrawalType" :options="withdrawalTypeOptions" option-label="label" option-value="value" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">الرصيد المطلوب من الموقع</label>
            <InputNumber v-model="siteBalanceRequested" :min="0" fluid />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">المبلغ الذي دفعه الوكيل سابقاً</label>
            <InputNumber v-model="previousPaidAmount" :min="0" fluid />
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

        <Button class="gold-button !rounded-2xl !border-0 !px-6" label="حفظ عملية السحب" type="submit" />
      </form>

      <article class="panel space-y-4 p-6">
        <h3 class="text-2xl font-extrabold">نتيجة العملية</h3>
        <div class="space-y-3">
          <div class="space-y-2">
            <label class="text-sm font-semibold">قيمة الرصيد الذي أُعيد</label>
            <InputNumber v-model="returnedBalance" :min="0" fluid />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">المبلغ المسترد</label>
            <InputNumber v-model="refundAmount" :min="0" fluid />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">ربح أو خسارة العملية</label>
            <InputNumber v-model="profitLoss" fluid />
          </div>
          <div class="rounded-3xl border border-white/8 bg-white/4 p-4">
            <p class="muted-text text-sm">شرح واجهي</p>
            <p class="mt-2 leading-8">
              تم دفع 5 مليون، حصة الموقع 3 مليون، ثم تم طلب سحب 10 مليون. يمكنك تعديل القيم أعلاه مباشرة للوصول
              للحساب النهائي المناسب لحالتك الفعلية.
            </p>
          </div>
          <div class="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4">
            <p class="muted-text text-sm">الرصيد بعد السحب</p>
            <p class="mt-2 text-2xl font-extrabold">{{ afterWithdrawalBalance }}</p>
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

const withdrawalSchema = z.object({
  agentId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'SYP']),
  withdrawalType: z.enum(['سحب مباشر', 'تسوية رصيد', 'استرداد جزئي']),
  siteBalanceRequested: z.number().optional(),
  previousPaidAmount: z.number().optional(),
  operationDate: z.date(),
  reference: z.string().min(3),
  notes: z.string().optional(),
  returnedBalance: z.number().optional(),
  refundAmount: z.number().optional(),
  profitLoss: z.number().optional(),
})

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>

const { defineField, handleSubmit } = useForm<WithdrawalFormValues>({
  validationSchema: toTypedSchema(withdrawalSchema),
  initialValues: {
    agentId: '',
    amount: 10000000,
    currency: 'SYP',
    withdrawalType: 'سحب مباشر',
    siteBalanceRequested: 10000000,
    previousPaidAmount: 5000000,
    operationDate: new Date(),
    reference: `WTH-${Date.now().toString().slice(-6)}`,
    notes: '',
    returnedBalance: 8500000,
    refundAmount: 4200000,
    profitLoss: -300000,
  },
})

const [agentId] = defineField('agentId')
const [amount] = defineField('amount')
const [currency] = defineField('currency')
const [withdrawalType] = defineField('withdrawalType')
const [siteBalanceRequested] = defineField('siteBalanceRequested')
const [previousPaidAmount] = defineField('previousPaidAmount')
const [operationDate] = defineField('operationDate')
const [reference] = defineField('reference')
const [notes] = defineField('notes')
const [returnedBalance] = defineField('returnedBalance')
const [refundAmount] = defineField('refundAmount')
const [profitLoss] = defineField('profitLoss')

const agentOptions = computed(() => store.agentSummaries.map((agent) => ({ label: `${agent.name} - ${agent.code}`, value: agent.id })))
const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'SYP', value: 'SYP' },
]
const withdrawalTypeOptions = [
  { label: 'سحب مباشر', value: 'سحب مباشر' },
  { label: 'تسوية رصيد', value: 'تسوية رصيد' },
  { label: 'استرداد جزئي', value: 'استرداد جزئي' },
]

const selectedAgent = computed(() => store.agentSummaries.find((agent) => agent.id === agentId.value))
const afterWithdrawalBalance = computed(() =>
  formatCurrency(
    Math.max((selectedAgent.value?.metrics.currentBalance ?? 0) - (returnedBalance.value ?? 0), 0),
    selectedAgent.value?.currency ?? currency.value ?? 'USD',
  ),
)

watch(selectedAgent, (agent) => {
  if (!agent) return
  currency.value = agent.currency
})

const submitForm = handleSubmit(async (values) => {
  await store.createTransaction({
    id: `tx-${Date.now()}`,
    code: `TRX-W-${Date.now().toString().slice(-5)}`,
    agentId: values.agentId,
    type: 'سحب',
    amount: values.amount,
    currency: values.currency,
    status: 'مؤكدة',
    createdAt: values.operationDate.toISOString(),
    createdBy: store.currentUser?.name ?? 'مدير النظام',
    reference: values.reference,
    note: values.notes ?? '',
    withdrawalType: values.withdrawalType,
    siteBalanceRequested: values.siteBalanceRequested,
    previousPaidAmount: values.previousPaidAmount,
    returnedBalance: values.returnedBalance,
    refundAmount: values.refundAmount,
    profitLoss: values.profitLoss,
  })

  toast.add({
    severity: 'success',
    summary: 'تم الحفظ',
    detail: 'تم تسجيل عملية السحب بنجاح.',
    life: 3000,
  })
})
</script>
