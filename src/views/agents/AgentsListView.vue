<template>
  <section class="space-y-6">
    <PageHeader
      title="قائمة الوكلاء"
      description="إدارة الوكلاء والبحث في الأرصدة والدفعات والحالات مع إمكانات فرز وتصدير واجهية."
      eyebrow="Agents"
      :breadcrumb="['الرئيسية', 'الوكلاء']"
    >
      <template #actions>
        <Button class="ghost-button !rounded-2xl !px-5" label="تصدير Excel" @click="showExportToast('Excel')" />
        <Button class="ghost-button !rounded-2xl !px-5" label="تصدير PDF" @click="showExportToast('PDF')" />
        <Button class="gold-button !rounded-2xl !border-0 !px-5" label="إضافة وكيل" @click="router.push('/agents/create')" />
      </template>
    </PageHeader>

    <FilterBar>
      <div class="min-w-[220px] flex-1">
        <label class="mb-2 block text-sm font-semibold">بحث</label>
        <SearchInput v-model="filters.search" placeholder="ابحث باسم الوكيل أو الهاتف أو الكود" />
      </div>
      <div class="min-w-[180px] flex-1">
        <label class="mb-2 block text-sm font-semibold">الحالة</label>
        <Dropdown v-model="filters.status" class="w-full" :options="statusOptions" option-label="label" option-value="value" />
      </div>
      <div class="min-w-[200px] flex-1">
        <label class="mb-2 block text-sm font-semibold">نوع المحاسبة</label>
        <Dropdown v-model="filters.accountingType" class="w-full" :options="accountingOptions" option-label="label" option-value="value" />
      </div>
      <div class="min-w-[180px] flex-1">
        <label class="mb-2 block text-sm font-semibold">ترتيب النتائج</label>
        <Dropdown v-model="filters.sortBy" class="w-full" :options="sortOptions" option-label="label" option-value="value" />
      </div>
    </FilterBar>

    <DataTable :items-length="pagedAgents.length" :value="pagedAgents">
      <Column field="code" header="رقم الوكيل" />
      <Column field="name" header="اسم الوكيل" />
      <Column field="phone" header="رقم الهاتف" />
      <Column field="accountingType" header="نوع المحاسبة" />
      <Column header="نسبة الوكيل">
        <template #body="{ data }">
          {{ data.agentRate ? `${data.agentRate}%` : data.bonusValue ? `${data.bonusValue}${data.bonusMode === 'قيمة ثابتة' ? '' : '%'}` : '-' }}
        </template>
      </Column>
      <Column header="إجمالي الرصيد المشترى">
        <template #body="{ data }">
          <CurrencyBadge :amount="data.metrics.totalPurchased" :currency="data.currency" />
        </template>
      </Column>
      <Column header="إجمالي الدفعات">
        <template #body="{ data }">
          <CurrencyBadge :amount="data.metrics.totalPayments" :currency="data.currency" />
        </template>
      </Column>
      <Column header="الرصيد الحالي">
        <template #body="{ data }">
          <CurrencyBadge :amount="data.metrics.currentBalance" :currency="data.currency" />
        </template>
      </Column>
      <Column header="الحالة">
        <template #body="{ data }">
          <StatusBadge :status="data.status" />
        </template>
      </Column>
      <Column header="آخر عملية">
        <template #body="{ data }">
          {{ formatDateTime(data.lastTransactionAt) }}
        </template>
      </Column>
      <Column header="إجراءات">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button aria-label="عرض" icon="pi pi-eye" rounded text @click="router.push(`/agents/${data.id}`)" />
            <Button aria-label="تعديل" icon="pi pi-pencil" rounded text @click="router.push(`/agents/${data.id}/edit`)" />
            <Button
              aria-label="تعطيل"
              icon="pi pi-ban"
              rounded
              text
              @click="openStatusModal(data.id)"
            />
          </div>
        </template>
      </Column>

      <template #mobile>
        <article v-for="agent in pagedAgents" :key="agent.id" class="panel-muted space-y-3 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-bold">{{ agent.name }}</p>
              <p class="muted-text text-sm">{{ agent.code }} - {{ agent.phone }}</p>
            </div>
            <StatusBadge :status="agent.status" />
          </div>
          <div class="grid gap-2 sm:grid-cols-2">
            <CurrencyBadge :amount="agent.metrics.totalPurchased" :currency="agent.currency" />
            <CurrencyBadge :amount="agent.metrics.currentBalance" :currency="agent.currency" />
          </div>
          <div class="flex gap-2">
            <Button class="!flex-1" label="عرض" outlined @click="router.push(`/agents/${agent.id}`)" />
            <Button class="!flex-1" label="تعديل" outlined @click="router.push(`/agents/${agent.id}/edit`)" />
          </div>
        </article>
      </template>
    </DataTable>

    <Pagination :first="first" :rows="rows" :total-records="filteredAgents.length" @update:first="first = $event" />

    <ConfirmationModal
      :description="selectedAgent?.status === 'فعال' ? 'سيتم إيقاف الوكيل في الواجهة مع إبقاء بياناته وسجلاته.' : 'سيتم إعادة تفعيل الوكيل وإظهاره كوكيل نشط.'"
      :title="selectedAgent?.status === 'فعال' ? 'تأكيد تعطيل الوكيل' : 'تأكيد تفعيل الوكيل'"
      :visible="statusModalVisible"
      confirm-label="حفظ الحالة"
      @cancel="statusModalVisible = false"
      @confirm="toggleStatus"
      @update:visible="statusModalVisible = $event"
    />
  </section>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import CurrencyBadge from '@/components/common/CurrencyBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchInput from '@/components/common/SearchInput.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import FilterBar from '@/components/forms/FilterBar.vue'
import DataTable from '@/components/tables/DataTable.vue'
import Pagination from '@/components/tables/Pagination.vue'
import { useAccountingStore } from '@/stores/accounting'
import { formatDateTime } from '@/utils/formatters'

const router = useRouter()
const store = useAccountingStore()
const first = ref(0)
const rows = 10
const statusModalVisible = ref(false)
const selectedAgentId = ref<string | null>(null)

const filters = reactive({
  search: '',
  status: 'الكل',
  accountingType: 'الكل',
  sortBy: 'recent',
})

const statusOptions = [
  { label: 'الكل', value: 'الكل' },
  { label: 'فعال', value: 'فعال' },
  { label: 'موقوف', value: 'موقوف' },
]

const accountingOptions = [
  { label: 'الكل', value: 'الكل' },
  { label: 'نسبة من الربح', value: 'نسبة من الربح' },
  { label: 'Bonus', value: 'Bonus' },
  { label: 'بدون نسبة', value: 'بدون نسبة' },
]

const sortOptions = [
  { label: 'الأحدث حركة', value: 'recent' },
  { label: 'الاسم', value: 'name' },
  { label: 'الرصيد الحالي', value: 'balance' },
]

const filteredAgents = computed(() => {
  const keyword = filters.search.trim().toLowerCase()

  return [...store.agentSummaries]
    .filter((agent) => {
      if (filters.status !== 'الكل' && agent.status !== filters.status) return false
      if (filters.accountingType !== 'الكل' && agent.accountingType !== filters.accountingType) return false

      if (!keyword) return true

      return [agent.name, agent.phone, agent.code, agent.region].some((value) => value.toLowerCase().includes(keyword))
    })
    .sort((left, right) => {
      if (filters.sortBy === 'name') return left.name.localeCompare(right.name, 'ar')
      if (filters.sortBy === 'balance') return right.metrics.currentBalance - left.metrics.currentBalance

      const rightRecent = new Date(
        right.lastTransactionAt ?? right.updatedAt ?? right.createdAt,
      ).getTime()
      const leftRecent = new Date(
        left.lastTransactionAt ?? left.updatedAt ?? left.createdAt,
      ).getTime()

      return rightRecent - leftRecent
    })
})

const pagedAgents = computed(() => filteredAgents.value.slice(first.value, first.value + rows))

const selectedAgent = computed(() => store.agentSummaries.find((agent) => agent.id === selectedAgentId.value) ?? null)

const openStatusModal = (agentId: string) => {
  selectedAgentId.value = agentId
  statusModalVisible.value = true
}

const toggleStatus = async () => {
  if (!selectedAgent.value) return

  const updatedStatus = selectedAgent.value.status === 'فعال' ? 'موقوف' : 'فعال'
  await store.updateAgent(selectedAgent.value.id, {
    ...selectedAgent.value,
    status: updatedStatus,
    updatedAt: new Date().toISOString(),
  })
  statusModalVisible.value = false
}

const showExportToast = (type: string) => {
  window.alert(`واجهة فقط: سيتم لاحقاً تنفيذ تصدير ${type}.`)
}
</script>
