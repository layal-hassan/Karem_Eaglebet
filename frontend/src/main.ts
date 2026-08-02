import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import Aura from '@primeuix/themes/aura'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from './stores/pinia'
import './styles/main.css'

document.documentElement.lang = 'ar'
document.documentElement.dir = 'rtl'
document.documentElement.classList.add('eaglebet-dark')

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  ripple: true,
  inputVariant: 'filled',
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.eaglebet-dark',
      cssLayer: false,
    },
  },
  locale: {
    startsWith: 'يبدأ بـ',
    contains: 'يحتوي',
    notContains: 'لا يحتوي',
    endsWith: 'ينتهي بـ',
    equals: 'يساوي',
    notEquals: 'لا يساوي',
    noFilter: 'بدون فلترة',
    lt: 'أصغر من',
    lte: 'أصغر من أو يساوي',
    gt: 'أكبر من',
    gte: 'أكبر من أو يساوي',
    dateIs: 'التاريخ يساوي',
    dateIsNot: 'التاريخ لا يساوي',
    dateBefore: 'قبل',
    dateAfter: 'بعد',
    clear: 'مسح',
    apply: 'تطبيق',
    matchAll: 'مطابقة الكل',
    matchAny: 'مطابقة أي',
    addRule: 'إضافة شرط',
    removeRule: 'حذف شرط',
    accept: 'موافقة',
    reject: 'إلغاء',
    choose: 'اختيار',
    upload: 'رفع',
    cancel: 'إلغاء',
    today: 'اليوم',
    weekHeader: 'أسب',
    firstDayOfWeek: 6,
    dayNames: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    dayNamesShort: ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
    dayNamesMin: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
    monthNames: [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ],
    monthNamesShort: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'],
    emptyMessage: 'لا توجد بيانات',
    emptyFilterMessage: 'لا توجد نتائج مطابقة',
  },
})
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')
