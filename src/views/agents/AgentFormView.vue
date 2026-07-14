<template>
  <section class="space-y-6">
    <PageHeader
      :title="isEdit ? 'تعديل بيانات الوكيل' : 'إضافة وكيل جديد'"
      :description="
        isEdit
          ? 'تحديث بيانات الوكيل مع تأكيد إضافي عند تغيير نوع المحاسبة.'
          : 'إنشاء وكيل جديد ضمن بنية قابلة للربط لاحقاً مع API.'
      "
      eyebrow="Agent Form"
      :breadcrumb="['الرئيسية', 'الوكلاء', isEdit ? 'تعديل' : 'إضافة']"
    />

    <div v-if="isEdit && currentAgent" class="grid gap-4 md:grid-cols-2">
      <div class="panel p-4">
        <p class="muted-text text-sm">تاريخ إنشاء الوكيل</p>
        <p class="mt-2 text-lg font-bold">{{ formatDateTime(currentAgent.createdAt) }}</p>
      </div>
      <div class="panel p-4">
        <p class="muted-text text-sm">آخر تعديل</p>
        <p class="mt-2 text-lg font-bold">{{ formatDateTime(currentAgent.updatedAt) }}</p>
      </div>
    </div>

    <form class="panel space-y-6 p-6" @submit.prevent="submitForm">
      <div
        v-if="isEdit && accountingChanged"
        class="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200"
      >
        تم تغيير نوع المحاسبة. سيظهر تأكيد إضافي قبل الحفظ لأن هذا قد يؤثر على العمليات اللاحقة.
      </div>

      <div class="grid gap-5 md:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-semibold">اسم الوكيل</label>
          <InputText v-model="name" :invalid="Boolean(errors.name)" />
          <small v-if="errors.name" class="text-red-300">{{ errors.name }}</small>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold">رقم الهاتف</label>
          <InputText v-model="phone" :invalid="Boolean(errors.phone)" />
          <small v-if="errors.phone" class="text-red-300">{{ errors.phone }}</small>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold">اسم المستخدم</label>
          <InputText v-model="username" />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold">الدولة أو المنطقة</label>
          <InputText v-model="region" :invalid="Boolean(errors.region)" />
          <small v-if="errors.region" class="text-red-300">{{ errors.region }}</small>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold">العملة الأساسية</label>
          <Dropdown
            v-model="currency"
            :options="currencyOptions"
            option-label="label"
            option-value="value"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold">نوع المحاسبة</label>
          <Dropdown
            v-model="accountingType"
            :options="accountingOptions"
            option-label="label"
            option-value="value"
          />
        </div>
      </div>

      <div v-if="accountingType === 'نسبة من الربح'" class="grid gap-5 md:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-semibold">نسبة الوكيل</label>
          <InputNumber v-model="agentRate" :max="100" :min="0" fluid />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-semibold">نسبة الشركة</label>
          <InputNumber v-model="companyRate" :max="100" :min="0" fluid />
        </div>
      </div>

      <div v-if="accountingType === 'Bonus'" class="grid gap-5 md:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-semibold">نوع Bonus</label>
          <Dropdown
            v-model="bonusMode"
            :options="bonusModeOptions"
            option-label="label"
            option-value="value"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-semibold">قيمة أو نسبة Bonus</label>
          <InputNumber v-model="bonusValue" :min="0" fluid />
        </div>
      </div>

      <div class="grid gap-5 md:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-semibold">حالة الوكيل</label>
          <Dropdown
            v-model="status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold">تصنيف الوكيل</label>
          <Dropdown
            v-model="typeLabel"
            :options="typeOptions"
            option-label="label"
            option-value="value"
          />
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-semibold">ملاحظات</label>
        <Textarea v-model="notes" auto-resize rows="5" />
      </div>

      <div class="flex flex-wrap justify-end gap-3">
        <Button
          class="ghost-button !rounded-2xl !px-5"
          label="إلغاء"
          type="button"
          @click="router.push('/agents')"
        />
        <Button
          class="gold-button !rounded-2xl !border-0 !px-6"
          :label="isEdit ? 'حفظ التعديلات' : 'إضافة الوكيل'"
          type="submit"
        />
      </div>
    </form>

    <ConfirmationModal
      :description="confirmationText"
      title="تأكيد قبل الحفظ"
      :visible="confirmVisible"
      confirm-label="تأكيد الحفظ"
      @cancel="confirmVisible = false"
      @confirm="persistChanges"
      @update:visible="confirmVisible = $event"
    />
  </section>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { z } from 'zod'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { useAccountingStore } from '@/stores/accounting'
import type { AgentRecord } from '@/types'
import { formatDateTime } from '@/utils/formatters'

const router = useRouter()
const route = useRoute()
const store = useAccountingStore()
const toast = useToast()
const confirmVisible = ref(false)
const pendingPayload = ref<AgentRecord | null>(null)

const isEdit = computed(() => Boolean(route.params.id))
const currentAgent = computed(() => store.agents.find((agent) => agent.id === route.params.id))
const originalAccountingType = ref(currentAgent.value?.accountingType ?? 'بدون نسبة')

const agentFormSchema = z.object({
  name: z.string().min(3, 'اسم الوكيل مطلوب'),
  phone: z.string().min(8, 'رقم الهاتف غير صالح'),
  username: z.string().optional(),
  region: z.string().min(2, 'المنطقة مطلوبة'),
  currency: z.enum(['USD', 'SYP']),
  accountingType: z.enum(['نسبة من الربح', 'Bonus', 'بدون نسبة']),
  agentRate: z.number().optional(),
  companyRate: z.number().optional(),
  bonusMode: z.enum(['قيمة ثابتة', 'نسبة مئوية']).optional(),
  bonusValue: z.number().optional(),
  notes: z.string().default(''),
  status: z.enum(['فعال', 'موقوف']),
  typeLabel: z.enum(['وكيل رئيسي', 'وكيل فرعي', 'وكيل ذهبي']),
})

type AgentFormValues = z.infer<typeof agentFormSchema>

const { defineField, errors, handleSubmit, resetForm, values } = useForm<AgentFormValues>({
  validationSchema: toTypedSchema(agentFormSchema),
  initialValues: {
    name: '',
    phone: '',
    username: '',
    region: '',
    currency: 'USD',
    accountingType: 'نسبة من الربح',
    agentRate: 20,
    companyRate: 80,
    bonusMode: 'قيمة ثابتة',
    bonusValue: 0,
    notes: '',
    status: 'فعال',
    typeLabel: 'وكيل فرعي',
  },
})

const [name] = defineField('name')
const [phone] = defineField('phone')
const [username] = defineField('username')
const [region] = defineField('region')
const [currency] = defineField('currency')
const [accountingType] = defineField('accountingType')
const [agentRate] = defineField('agentRate')
const [companyRate] = defineField('companyRate')
const [bonusMode] = defineField('bonusMode')
const [bonusValue] = defineField('bonusValue')
const [notes] = defineField('notes')
const [status] = defineField('status')
const [typeLabel] = defineField('typeLabel')

const currencyOptions = [
  { label: 'دولار أمريكي - USD', value: 'USD' },
  { label: 'ليرة سورية - SYP', value: 'SYP' },
]

const accountingOptions = [
  { label: 'نسبة من الربح', value: 'نسبة من الربح' },
  { label: 'Bonus', value: 'Bonus' },
  { label: 'بدون نسبة', value: 'بدون نسبة' },
]

const bonusModeOptions = [
  { label: 'قيمة ثابتة', value: 'قيمة ثابتة' },
  { label: 'نسبة مئوية', value: 'نسبة مئوية' },
]

const statusOptions = [
  { label: 'فعال', value: 'فعال' },
  { label: 'موقوف', value: 'موقوف' },
]

const typeOptions = [
  { label: 'وكيل رئيسي', value: 'وكيل رئيسي' },
  { label: 'وكيل فرعي', value: 'وكيل فرعي' },
  { label: 'وكيل ذهبي', value: 'وكيل ذهبي' },
]

const accountingChanged = computed(
  () => isEdit.value && values.accountingType !== originalAccountingType.value,
)

const confirmationText = computed(() =>
  accountingChanged.value
    ? 'سيؤدي تغيير نوع المحاسبة إلى تحديث إعدادات الوكيل وقد يؤثر على العمليات اللاحقة. هل تريد المتابعة؟'
    : 'سيتم حفظ التعديلات على بيانات الوكيل الحالية.',
)

const buildPayload = (formValues: AgentFormValues): AgentRecord => ({
  id: currentAgent.value?.id ?? `agent-${Date.now()}`,
  code: currentAgent.value?.code ?? `AG-${Math.floor(Math.random() * 9000 + 1000)}`,
  name: formValues.name,
  phone: formValues.phone,
  username: formValues.username,
  region: formValues.region,
  currency: formValues.currency,
  accountingType: formValues.accountingType,
  agentRate: formValues.accountingType === 'نسبة من الربح' ? formValues.agentRate : undefined,
  companyRate:
    formValues.accountingType === 'نسبة من الربح' ? formValues.companyRate : undefined,
  bonusMode: formValues.accountingType === 'Bonus' ? formValues.bonusMode : undefined,
  bonusValue: formValues.accountingType === 'Bonus' ? formValues.bonusValue : undefined,
  notes: formValues.notes,
  status: formValues.status,
  createdAt: currentAgent.value?.createdAt ?? new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  typeLabel: formValues.typeLabel,
})

const submitForm = handleSubmit(
  async (formValues) => {
    pendingPayload.value = buildPayload(formValues)

    if (isEdit.value) {
      confirmVisible.value = true
      return
    }

    await persistChanges()
  },
  ({ errors }) => {
    const firstError = Object.values(errors)[0]

    toast.add({
      severity: 'warn',
      summary: 'تحقق من الحقول',
      detail: firstError ?? 'يوجد حقل مطلوب أو قيمة غير صالحة.',
      life: 3000,
    })
  },
)

const persistChanges = async () => {
  if (!pendingPayload.value) return

  let targetAgentId: string | null = null

  try {
    if (isEdit.value) {
      const updated = await store.updateAgent(pendingPayload.value.id, pendingPayload.value)
      targetAgentId = updated.id
      toast.add({
        severity: 'success',
        summary: 'تم الحفظ',
        detail: `تم تحديث بيانات الوكيل ${updated.name}.`,
        life: 2500,
      })
    } else {
      const created = await store.createAgent(pendingPayload.value)
      targetAgentId = created.id
      toast.add({
        severity: 'success',
        summary: 'تمت الإضافة',
        detail: `تم إنشاء الوكيل ${created.name}.`,
        life: 2500,
      })
    }
  } catch (error) {
    console.error('Agent save failed:', error)

    const detail =
      error instanceof Error && error.message
        ? error.message
        : 'حدثت مشكلة أثناء حفظ بيانات الوكيل.'

    toast.add({
      severity: 'error',
      summary: 'تعذر الحفظ',
      detail,
      life: 4500,
    })
    return
  }

  confirmVisible.value = false
  pendingPayload.value = null

  if (!targetAgentId) {
    await router.push('/agents')
    return
  }

  try {
    await router.push(`/agents/${targetAgentId}`)
  } catch (error) {
    console.error('Agent navigation failed:', error)

    toast.add({
      severity: 'warn',
      summary: 'تم الحفظ',
      detail: 'تم حفظ الوكيل لكن تعذر فتح صفحة التفاصيل، وسيتم تحويلك إلى القائمة.',
      life: 3000,
    })

    await router.push('/agents')
  }
}

watch(
  currentAgent,
  (agent) => {
    if (!agent) return

    originalAccountingType.value = agent.accountingType
    resetForm({
      values: {
        name: agent.name,
        phone: agent.phone,
        username: agent.username ?? '',
        region: agent.region,
        currency: agent.currency,
        accountingType: agent.accountingType,
        agentRate: agent.agentRate ?? 20,
        companyRate: agent.companyRate ?? 80,
        bonusMode: agent.bonusMode ?? 'قيمة ثابتة',
        bonusValue: agent.bonusValue ?? 0,
        notes: agent.notes,
        status: agent.status,
        typeLabel: agent.typeLabel,
      },
    })
  },
  { immediate: true },
)
</script>
