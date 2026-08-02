<template>
  <main class="min-h-screen px-4 py-10">
    <div class="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl overflow-hidden rounded-[36px] border border-white/10 bg-black/20 shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
      <section class="relative hidden overflow-hidden bg-[#111317] p-10 lg:flex lg:flex-col lg:justify-between">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(213,172,87,0.16),transparent_25%)]"></div>
        <div class="relative">
          <div class="mb-8 inline-flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
            <img alt="EAGLEBET" class="h-14 w-14 rounded-2xl object-cover" src="/eaglebet-logo.png" />
            <div>
              <p class="text-2xl font-extrabold">EAGLEBET</p>
              <p class="muted-text">منصة الإدارة المالية الداخلية</p>
            </div>
          </div>

          <div class="max-w-xl space-y-5">
            <p class="eyebrow text-sm font-semibold">Enterprise Accounting Suite</p>
            <h1 class="text-5xl font-extrabold leading-tight">
              تحكم مركزي في أرصدة الوكلاء والدفعات والتقارير من واجهة عربية واحدة.
            </h1>
            <p class="muted-text text-lg">
              الواجهة مصممة لتعمل لاحقاً فوق Django REST API بدون إعادة بناء الصفحات أو النماذج.
            </p>
          </div>
        </div>

        <div class="relative grid gap-4 md:grid-cols-3">
          <div class="panel-muted p-5">
            <p class="muted-text text-sm">المتابعة اليومية</p>
            <p class="mt-3 text-2xl font-extrabold">50+</p>
            <p class="muted-text mt-2 text-sm">عملية محاسبية تجريبية جاهزة.</p>
          </div>
          <div class="panel-muted p-5">
            <p class="muted-text text-sm">الوكلاء</p>
            <p class="mt-3 text-2xl font-extrabold">15</p>
            <p class="muted-text mt-2 text-sm">وكيلاً بعملات وأنواع محاسبة مختلفة.</p>
          </div>
          <div class="panel-muted p-5">
            <p class="muted-text text-sm">جاهزية الربط</p>
            <p class="mt-3 text-2xl font-extrabold">100%</p>
            <p class="muted-text mt-2 text-sm">طبقة Services مستقلة وقابلة للاستبدال.</p>
          </div>
        </div>
      </section>

      <section class="flex items-center justify-center bg-[#0d0f13] px-6 py-10 sm:px-10">
        <div class="w-full max-w-xl space-y-8">
          <div class="space-y-3 text-center lg:text-right">
            <img alt="EAGLEBET" class="mx-auto h-20 w-20 rounded-3xl object-cover lg:mx-0" src="/eaglebet-logo.png" />
            <h2 class="text-3xl font-extrabold">تسجيل الدخول إلى النظام المحاسبي</h2>
            <p class="muted-text">أدخل بيانات حسابك للوصول إلى نظام المحاسبة.</p>
          </div>

          <form class="panel space-y-5 p-6 md:p-8" @submit.prevent="submitForm">
            <div class="space-y-2">
              <label class="text-sm font-semibold" for="username">اسم المستخدم</label>
              <InputText
                id="username"
                v-model="username"
                aria-label="اسم المستخدم"
                :invalid="Boolean(errors.username)"
                placeholder="أدخل اسم المستخدم"
              />
              <small v-if="errors.username" class="text-red-300">{{ errors.username }}</small>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-semibold" for="password">كلمة المرور</label>
              <Password
                id="password"
                v-model="password"
                aria-label="كلمة المرور"
                fluid
                input-class="w-full"
                :invalid="Boolean(errors.password)"
                placeholder="أدخل كلمة المرور"
                :toggle-mask="true"
              />
              <small v-if="errors.password" class="text-red-300">{{ errors.password }}</small>
            </div>

            <div class="flex items-center justify-between gap-4">
              <label class="flex items-center gap-2 text-sm">
                <Checkbox v-model="rememberMe" binary input-id="remember" />
                <span>تذكرني</span>
              </label>
              <span class="muted-text text-sm">الوصول محصور داخلياً</span>
            </div>

            <Button
              class="gold-button !w-full !rounded-2xl !border-0 !py-3 !text-base !font-bold"
              :loading="loading"
              type="submit"
            >
              تسجيل الدخول
            </Button>
          </form>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { useAccountingStore } from '@/stores/accounting'

const router = useRouter()
const store = useAccountingStore()
const loading = ref(false)

const loginSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب أن لا يقل عن 3 أحرف'),
  password: z.string().min(6, 'كلمة المرور يجب أن لا تقل عن 6 أحرف'),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

const { defineField, errors, handleSubmit } = useForm<LoginFormValues>({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    username: '',
    password: '',
    rememberMe: true,
  },
})

const [username] = defineField('username')
const [password] = defineField('password')
const [rememberMe] = defineField('rememberMe')

const submitForm = handleSubmit(async (values) => {
  loading.value = true
  try {
    await store.login(values.username, values.password)
    await router.push('/dashboard')
  } finally {
    loading.value = false
  }
})
</script>
