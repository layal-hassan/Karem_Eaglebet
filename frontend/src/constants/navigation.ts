import {
  ArrowDownToLine,
  ArrowUpFromLine,
  FileBarChart2,
  Home,
  LogOut,
  ReceiptText,
  Settings,
  Users,
  Wallet,
} from 'lucide-vue-next'

export const navigationItems = [
  { label: 'الرئيسية', to: '/dashboard', icon: Home },
  { label: 'الوكلاء', to: '/agents', icon: Users },
  {
    label: 'العمليات',
    to: '/transactions',
    icon: ReceiptText,
    children: [
      { label: 'سجل العمليات', to: '/transactions', icon: ReceiptText },
      { label: 'شراء رصيد', to: '/transactions/purchase', icon: Wallet },
      { label: 'دفعة واردة', to: '/transactions/payment', icon: ArrowDownToLine },
      { label: 'سحب', to: '/transactions/withdrawal', icon: ArrowUpFromLine },
    ],
  },
  { label: 'التقارير', to: '/reports', icon: FileBarChart2 },
  { label: 'الإعدادات', to: '/settings', icon: Settings },
  { label: 'تسجيل الخروج', action: 'logout', icon: LogOut },
] as const
