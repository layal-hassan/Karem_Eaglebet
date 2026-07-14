<template>
  <section class="space-y-6">
    <PageHeader
      title="الإعدادات"
      description="إعدادات واجهية للنظام تشمل التفضيلات، الإشعارات، وخيارات الطباعة والتقارير."
      eyebrow="Settings"
      :breadcrumb="['الرئيسية', 'الإعدادات']"
    />

    <article class="panel p-5">
      <Tabs value="general">
        <TabList>
          <Tab value="general">عام</Tab>
          <Tab value="notifications">الإشعارات</Tab>
          <Tab value="printing">الطباعة</Tab>
        </TabList>
        <TabPanels class="mt-6">
          <TabPanel value="general">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="panel-muted flex items-center justify-between p-4">
                <div>
                  <p class="font-bold">العمل باتجاه RTL</p>
                  <p class="muted-text text-sm">مفعل افتراضياً لكل الواجهات.</p>
                </div>
                <ToggleSwitch v-model="rtlEnabled" />
              </div>
              <div class="panel-muted flex items-center justify-between p-4">
                <div>
                  <p class="font-bold">إظهار التلميحات</p>
                  <p class="muted-text text-sm">تحسين تجربة المستخدمين الجدد.</p>
                </div>
                <ToggleSwitch v-model="tipsEnabled" />
              </div>
            </div>
          </TabPanel>

          <TabPanel value="notifications">
            <div class="space-y-4">
              <div class="panel-muted flex items-center justify-between p-4">
                <div>
                  <p class="font-bold">تنبيهات الرصيد المتراكم</p>
                  <p class="muted-text text-sm">إشعارات عند تجاوز حدود الرصيد الحالية.</p>
                </div>
                <ToggleSwitch v-model="balanceAlerts" />
              </div>
              <Button class="ghost-button !rounded-2xl !px-5" label="تصفير تفضيلات الإشعارات" @click="confirmReset" />
            </div>
          </TabPanel>

          <TabPanel value="printing">
            <div class="space-y-4">
              <div class="panel-muted flex items-center justify-between p-4">
                <div>
                  <p class="font-bold">إخفاء Sidebar عند الطباعة</p>
                  <p class="muted-text text-sm">مفعل في CSS الخاص بالطباعة.</p>
                </div>
                <ToggleSwitch v-model="printOptimized" />
              </div>
              <div class="panel-muted p-4">
                <p class="font-bold">قالب التوقيع والختم</p>
                <p class="muted-text mt-2 text-sm">جاهز في صفحة كشف الحساب وسيُربط لاحقاً مع إعدادات المؤسسة.</p>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </article>
  </section>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'
import ToggleSwitch from 'primevue/toggleswitch'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'

const confirm = useConfirm()
const toast = useToast()

const rtlEnabled = ref(true)
const tipsEnabled = ref(true)
const balanceAlerts = ref(true)
const printOptimized = ref(true)

const confirmReset = () => {
  confirm.require({
    message: 'سيتم تصفير تفضيلات الإشعارات ضمن الواجهة الحالية فقط. هل تريد المتابعة؟',
    header: 'تأكيد العملية',
    acceptLabel: 'تأكيد',
    rejectLabel: 'إلغاء',
    accept: () => {
      balanceAlerts.value = false
      toast.add({
        severity: 'success',
        summary: 'تم الحفظ',
        detail: 'تم تصفير تفضيلات الإشعارات في الواجهة.',
        life: 2500,
      })
    },
  })
}
</script>
