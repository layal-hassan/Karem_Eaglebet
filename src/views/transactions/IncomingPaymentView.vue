<template>
  <section class="space-y-6">
    <PageHeader
      title="تسجيل دفعة واردة"
      description="تسجيل المبالغ الواصلة من الوكلاء مع إيصال واجهي وملخص رصيد قبل وبعد العملية."
      eyebrow="Transactions"
      :breadcrumb="['الرئيسية', 'العمليات', 'دفعة واردة']"
    />

    <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <form class="panel space-y-5 p-6" @submit.prevent="submitForm">
        <div class="grid gap-5 md:grid-cols-2">
          <div class="space-y-2 md:col-span-2">
            <label class="text-sm font-semibold">الوكيل</label>
            <Dropdown v-model="agentId" :options="agentOptions" option-label="label" option-value="value" placeholder="اختر الوكيل" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">المبلغ</label>
            <InputNumber v-model="amount" :min="1" fluid />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">العملة</label>
            <Dropdown v-model="currency" :options="currencyOptions" option-label="label" option-value="value" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">طريقة الدفع</label>
            <Dropdown v-model="paymentMethod" :options="paymentMethodOptions" option-label="label" option-value="value" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">رقم الحوالة أو المرجع</label>
            <InputText v-model="transferReference" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">تاريخ ووقت الدفع</label>
            <Calendar v-model="paymentDate" class="w-full" date-format="yy/mm/dd" :show-time="true" show-icon />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">حالة الدفعة</label>
            <Dropdown v-model="status" :options="statusOptions" option-label="label" option-value="value" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold">رفع صورة إيصال</label>
          <FileUpload
            mode="basic"
            choose-label="اختيار ملف"
            custom-upload
            @select="selectedReceipt = $event.files?.[0]?.name ?? ''"
          />
          <small v-if="selectedReceipt" class="muted-text">الملف المختار: {{ selectedReceipt }}</small>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold">ملاحظات</label>
          <Textarea v-model="notes" auto-resize rows="4" />
        </div>

        <Button class="gold-button !rounded-2xl !border-0 !px-6" label="حفظ الدفعة" type="submit" />
      </form>

      <article class="panel space-y-4 p-6">
        <h3 class="text-2xl font-extrabold">ملخص الرصيد</h3>
        <div class="panel-muted flex items-center justify-between p-4">
          <span class="muted-text">الرصيد قبل الدفعة</span>
          <strong>{{ beforeBalance }}</strong>
        </div>
        <div class="panel-muted flex items-center justify-between p-4">
          <span class="muted-text">قيمة الدفعة</span>
          <strong>{{ formatCurrency(amount ?? 0, currency || 'USD') }}</strong>
        </div>
        <div class="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p class="muted-text text-sm">الرصيد بعد الدفعة</p>
          <p class="mt-2 text-2xl font-extrabold">{{ afterBalance }}</p>
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
import FileUpload from 'primevue/fileupload'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import PageHeader from '@/components/common/PageHeader.vue'
import { useAccountingStore } from '@/stores/accounting'
import { formatCurrency } from '@/utils/formatters'

const store = useAccountingStore()
const toast = useToast()
const selectedReceipt = ref('')

const incomingPaymentSchema = z.object({
  agentId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'SYP']),
  paymentMethod: z.enum(['حوالة', 'تحويل بنكي', 'نقدي', 'USDT']),
  transferReference: z.string().min(3),
  paymentDate: z.date(),
  status: z.enum(['قيد المراجعة', 'مؤكدة', 'مرفوضة']),
  notes: z.string().optional(),
})

type IncomingPaymentFormValues = z.infer<typeof incomingPaymentSchema>

const { defineField, handleSubmit } = useForm<IncomingPaymentFormValues>({
  validationSchema: toTypedSchema(incomingPaymentSchema),
  initialValues: {
    agentId: '',
    amount: 2500000,
    currency: 'SYP',
    paymentMethod: 'حوالة',
    transferReference: `PAY-${Date.now().toString().slice(-6)}`,
    paymentDate: new Date(),
    status: 'قيد المراجعة',
    notes: '',
  },
})

const [agentId] = defineField('agentId')
const [amount] = defineField('amount')
const [currency] = defineField('currency')
const [paymentMethod] = defineField('paymentMethod')
const [transferReference] = defineField('transferReference')
const [paymentDate] = defineField('paymentDate')
const [status] = defineField('status')
const [notes] = defineField('notes')

const agentOptions = computed(() => store.agentSummaries.map((agent) => ({ label: `${agent.name} - ${agent.code}`, value: agent.id })))
const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'SYP', value: 'SYP' },
]
const paymentMethodOptions = [
  { label: 'حوالة', value: 'حوالة' },
  { label: 'تحويل بنكي', value: 'تحويل بنكي' },
  { label: 'نقدي', value: 'نقدي' },
  { label: 'USDT', value: 'USDT' },
]
const statusOptions = [
  { label: 'قيد المراجعة', value: 'قيد المراجعة' },
  { label: 'مؤكدة', value: 'مؤكدة' },
  { label: 'مرفوضة', value: 'مرفوضة' },
]

const selectedAgent = computed(() => store.agentSummaries.find((agent) => agent.id === agentId.value))
const beforeBalance = computed(() => formatCurrency(selectedAgent.value?.metrics.currentBalance ?? 0, selectedAgent.value?.currency ?? currency.value ?? 'USD'))
const afterBalance = computed(() =>
  formatCurrency(
    Math.max((selectedAgent.value?.metrics.currentBalance ?? 0) - (amount.value ?? 0), 0),
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
    code: `TRX-I-${Date.now().toString().slice(-5)}`,
    agentId: values.agentId,
    type: 'دفعة واردة',
    amount: values.amount,
    currency: values.currency,
    status: values.status,
    createdAt: values.paymentDate.toISOString(),
    createdBy: store.currentUser?.name ?? 'مدير النظام',
    reference: values.transferReference,
    transferReference: values.transferReference,
    paymentMethod: values.paymentMethod,
    attachmentName: selectedReceipt.value,
    note: values.notes ?? '',
  })

  toast.add({
    severity: 'success',
    summary: 'تم الحفظ',
    detail: 'تم تسجيل الدفعة الواردة بنجاح.',
    life: 3000,
  })
})
</script>
