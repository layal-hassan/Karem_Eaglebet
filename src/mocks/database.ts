import { addDays, formatISO, set } from 'date-fns'
import type {
  AgentRecord,
  CurrencyCode,
  NotificationItem,
  TransactionRecord,
  UserProfile,
} from '@/types'

const today = new Date('2026-07-14T12:00:00')

const atDate = (offsetDays: number, hour: number, minute = 0) =>
  formatISO(set(addDays(today, offsetDays), { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 }))

const users: UserProfile[] = [
  {
    id: 'user-1',
    name: 'أحمد الخالد',
    role: 'مدير المحاسبة',
    avatar: 'https://i.pravatar.cc/120?img=68',
  },
]

export const seedAgents: AgentRecord[] = [
  {
    id: 'agent-1',
    code: 'AG-1001',
    name: 'محمود العلي',
    phone: '0945123456',
    username: 'mahmoud.ali',
    region: 'دمشق',
    currency: 'SYP',
    accountingType: 'نسبة من الربح',
    agentRate: 22,
    companyRate: 78,
    notes: 'وكيل ثابت ويعتمد على حوالات داخلية.',
    status: 'فعال',
    createdAt: atDate(-180, 11),
    updatedAt: atDate(-3, 9),
    typeLabel: 'وكيل رئيسي',
  },
  {
    id: 'agent-2',
    code: 'AG-1002',
    name: 'سامر الحسن',
    phone: '0933445566',
    username: 'samer.hassan',
    region: 'حلب',
    currency: 'SYP',
    accountingType: 'Bonus',
    bonusMode: 'قيمة ثابتة',
    bonusValue: 250000,
    notes: 'يعتمد عروض Bonus شهرية.',
    status: 'فعال',
    createdAt: atDate(-160, 10),
    updatedAt: atDate(-5, 12),
    typeLabel: 'وكيل ذهبي',
  },
  {
    id: 'agent-3',
    code: 'AG-1003',
    name: 'ياسر النجار',
    phone: '0955551122',
    username: 'yasser.najjar',
    region: 'حمص',
    currency: 'USD',
    accountingType: 'بدون نسبة',
    notes: 'حساب بالدولار بدون نسب.',
    status: 'فعال',
    createdAt: atDate(-140, 13),
    updatedAt: atDate(-8, 14),
    typeLabel: 'وكيل فرعي',
  },
  {
    id: 'agent-4',
    code: 'AG-1004',
    name: 'طارق المصري',
    phone: '0922448877',
    username: 'tareq.masri',
    region: 'اللاذقية',
    currency: 'USD',
    accountingType: 'نسبة من الربح',
    agentRate: 18,
    companyRate: 82,
    notes: 'يتعامل غالباً مع شراء رصيد سريع.',
    status: 'فعال',
    createdAt: atDate(-120, 15),
    updatedAt: atDate(-10, 16),
    typeLabel: 'وكيل رئيسي',
  },
  {
    id: 'agent-5',
    code: 'AG-1005',
    name: 'خالد الشامي',
    phone: '0988776655',
    username: 'khaled.shami',
    region: 'درعا',
    currency: 'SYP',
    accountingType: 'بدون نسبة',
    notes: 'مبيعاته موسمية لكنه ملتزم بالسداد.',
    status: 'موقوف',
    createdAt: atDate(-110, 9),
    updatedAt: atDate(-14, 11),
    typeLabel: 'وكيل فرعي',
  },
  {
    id: 'agent-6',
    code: 'AG-1006',
    name: 'أمير زيدان',
    phone: '0949988112',
    username: 'amir.zeidan',
    region: 'حماة',
    currency: 'USD',
    accountingType: 'Bonus',
    bonusMode: 'نسبة مئوية',
    bonusValue: 7,
    notes: 'يستخدم Bonus كنسبة على كل عملية شراء.',
    status: 'فعال',
    createdAt: atDate(-105, 12),
    updatedAt: atDate(-2, 13),
    typeLabel: 'وكيل ذهبي',
  },
  {
    id: 'agent-7',
    code: 'AG-1007',
    name: 'باسل قاسم',
    phone: '0939001122',
    username: 'basel.qassem',
    region: 'إدلب',
    currency: 'SYP',
    accountingType: 'نسبة من الربح',
    agentRate: 20,
    companyRate: 80,
    notes: 'نشط في السوق المحلي.',
    status: 'فعال',
    createdAt: atDate(-95, 10),
    updatedAt: atDate(-6, 12),
    typeLabel: 'وكيل رئيسي',
  },
  {
    id: 'agent-8',
    code: 'AG-1008',
    name: 'علاء داغر',
    phone: '0952223344',
    username: 'alaa.dagher',
    region: 'طرطوس',
    currency: 'USD',
    accountingType: 'بدون نسبة',
    notes: 'وكيل ثابت لحسابات الدولار.',
    status: 'فعال',
    createdAt: atDate(-90, 14),
    updatedAt: atDate(-12, 10),
    typeLabel: 'وكيل فرعي',
  },
  {
    id: 'agent-9',
    code: 'AG-1009',
    name: 'وسام رحال',
    phone: '0925112233',
    username: 'wisam.rahal',
    region: 'الرقة',
    currency: 'SYP',
    accountingType: 'Bonus',
    bonusMode: 'قيمة ثابتة',
    bonusValue: 175000,
    notes: 'يتعامل مع دفعات يومية صغيرة.',
    status: 'فعال',
    createdAt: atDate(-88, 11),
    updatedAt: atDate(-1, 15),
    typeLabel: 'وكيل فرعي',
  },
  {
    id: 'agent-10',
    code: 'AG-1010',
    name: 'شادي كنعان',
    phone: '0941010101',
    username: 'shadi.kenaan',
    region: 'الحسكة',
    currency: 'USD',
    accountingType: 'نسبة من الربح',
    agentRate: 16,
    companyRate: 84,
    notes: 'مستقر لكن يتأخر أحياناً في التسوية.',
    status: 'فعال',
    createdAt: atDate(-80, 9),
    updatedAt: atDate(-4, 17),
    typeLabel: 'وكيل رئيسي',
  },
  {
    id: 'agent-11',
    code: 'AG-1011',
    name: 'فهد قدور',
    phone: '0932121212',
    username: 'fahd.qaddour',
    region: 'دمشق',
    currency: 'SYP',
    accountingType: 'بدون نسبة',
    notes: 'يفضل معاملات نقدية وسريعة.',
    status: 'فعال',
    createdAt: atDate(-70, 10),
    updatedAt: atDate(-7, 11),
    typeLabel: 'وكيل ذهبي',
  },
  {
    id: 'agent-12',
    code: 'AG-1012',
    name: 'نورس بركات',
    phone: '0999556677',
    username: 'nawras.barakat',
    region: 'حمص',
    currency: 'USD',
    accountingType: 'Bonus',
    bonusMode: 'نسبة مئوية',
    bonusValue: 5,
    notes: 'سحوباته قليلة لكن مشترياته مرتفعة.',
    status: 'فعال',
    createdAt: atDate(-66, 13),
    updatedAt: atDate(-9, 10),
    typeLabel: 'وكيل رئيسي',
  },
  {
    id: 'agent-13',
    code: 'AG-1013',
    name: 'هيثم صبح',
    phone: '0966060606',
    username: 'haitham.sobh',
    region: 'السويداء',
    currency: 'SYP',
    accountingType: 'نسبة من الربح',
    agentRate: 19,
    companyRate: 81,
    notes: 'يرسل إيصالات بانتظام.',
    status: 'فعال',
    createdAt: atDate(-58, 11),
    updatedAt: atDate(-2, 16),
    typeLabel: 'وكيل فرعي',
  },
  {
    id: 'agent-14',
    code: 'AG-1014',
    name: 'ريان الحلبي',
    phone: '0912333444',
    username: 'rayan.halabi',
    region: 'حلب',
    currency: 'USD',
    accountingType: 'بدون نسبة',
    notes: 'وكيل جديد نسبياً تحت المتابعة.',
    status: 'فعال',
    createdAt: atDate(-46, 14),
    updatedAt: atDate(-3, 18),
    typeLabel: 'وكيل فرعي',
  },
  {
    id: 'agent-15',
    code: 'AG-1015',
    name: 'جلال منصور',
    phone: '0948773344',
    username: 'jalal.mansour',
    region: 'حماة',
    currency: 'SYP',
    accountingType: 'Bonus',
    bonusMode: 'قيمة ثابتة',
    bonusValue: 300000,
    notes: 'وكيل نشط جداً ويطلب تقارير متكررة.',
    status: 'فعال',
    createdAt: atDate(-40, 10),
    updatedAt: atDate(-1, 12),
    typeLabel: 'وكيل ذهبي',
  },
]

const baseAmount = (currency: CurrencyCode, factor: number) =>
  currency === 'SYP' ? factor * 1000000 : factor * 220

const shareForAgent = (amount: number, rate?: number, bonusMode?: AgentRecord['bonusMode'], bonusValue?: number) => {
  if (rate) return amount * (rate / 100)
  if (bonusMode === 'نسبة مئوية' && bonusValue) return amount * (bonusValue / 100)
  if (bonusMode === 'قيمة ثابتة' && bonusValue) return bonusValue
  return 0
}

const purchaseRecord = (
  agent: AgentRecord,
  index: number,
  offsetDays: number,
  amountFactor: number,
  balanceFactor: number,
): TransactionRecord => {
  const paidAmount = baseAmount(agent.currency, amountFactor)
  const receivedBalance = baseAmount(agent.currency, balanceFactor)
  const agentShare = shareForAgent(receivedBalance, agent.agentRate, agent.bonusMode, agent.bonusValue)
  const companyShare = Math.max(receivedBalance - agentShare, 0)

  return {
    id: `tx-p-${agent.id}-${index}`,
    code: `TRX-P-${1000 + index}`,
    agentId: agent.id,
    type: 'شراء',
    amount: paidAmount,
    paidAmount,
    receivedBalance,
    currency: agent.currency,
    status: index % 9 === 0 ? 'قيد المراجعة' : 'مؤكدة',
    createdAt: atDate(offsetDays, 9 + (index % 6), 15),
    createdBy: index % 2 === 0 ? 'أحمد الخالد' : 'لينا ناصر',
    reference: `PUR-${agent.code}-${index}`,
    note: `شراء رصيد للوكيل ${agent.name}`,
    agentShare,
    companyShare,
    netAmount: companyShare,
    exchangeRate: agent.currency === 'SYP' ? 15000 : undefined,
  }
}

const paymentRecord = (agent: AgentRecord, index: number, offsetDays: number, amountFactor: number): TransactionRecord => {
  const amount = baseAmount(agent.currency, amountFactor)

  return {
    id: `tx-i-${agent.id}-${index}`,
    code: `TRX-I-${2000 + index}`,
    agentId: agent.id,
    type: 'دفعة واردة',
    amount,
    currency: agent.currency,
    status: index % 10 === 0 ? 'مرفوضة' : index % 7 === 0 ? 'قيد المراجعة' : 'مؤكدة',
    createdAt: atDate(offsetDays, 13 + (index % 4), 20),
    createdBy: 'أحمد الخالد',
    reference: `PAY-${agent.code}-${index}`,
    transferReference: `WT-${3200 + index}`,
    paymentMethod: index % 3 === 0 ? 'تحويل بنكي' : index % 3 === 1 ? 'حوالة' : 'USDT',
    attachmentName: `receipt-${index}.png`,
    note: `دفعة واردة من الوكيل ${agent.name}`,
  }
}

const withdrawalRecord = (
  agent: AgentRecord,
  index: number,
  offsetDays: number,
  amountFactor: number,
  refundFactor: number,
): TransactionRecord => {
  const amount = baseAmount(agent.currency, amountFactor)
  const refundAmount = baseAmount(agent.currency, refundFactor)
  const profitLoss = refundAmount - amount * 0.12

  return {
    id: `tx-w-${agent.id}-${index}`,
    code: `TRX-W-${3000 + index}`,
    agentId: agent.id,
    type: 'سحب',
    amount,
    currency: agent.currency,
    status: index % 11 === 0 ? 'ملغاة' : 'مؤكدة',
    createdAt: atDate(offsetDays, 16 + (index % 3), 10),
    createdBy: index % 2 === 0 ? 'لينا ناصر' : 'أحمد الخالد',
    reference: `WTH-${agent.code}-${index}`,
    note: `تسجيل سحب للوكيل ${agent.name}`,
    withdrawalType: index % 2 === 0 ? 'سحب مباشر' : 'تسوية رصيد',
    siteBalanceRequested: amount * 1.4,
    previousPaidAmount: amount * 0.7,
    returnedBalance: amount * 0.85,
    refundAmount,
    profitLoss,
  }
}

export const seedTransactions: TransactionRecord[] = seedAgents.flatMap((agent, index) => {
  const purchase1 = purchaseRecord(agent, index + 1, -30 + index, 3 + (index % 4), 4.6 + (index % 3))
  const payment1 = paymentRecord(agent, index + 21, -24 + index, 1.4 + (index % 3))
  const purchase2 = purchaseRecord(agent, index + 41, -14 + index, 2.2 + (index % 2), 3.4 + (index % 4))
  const withdrawal = withdrawalRecord(agent, index + 61, -6 + index, 1.5 + (index % 3), 1.1 + (index % 2))

  return index % 3 === 0 ? [purchase1, payment1, purchase2, withdrawal] : [purchase1, payment1, purchase2]
})

export const notificationsSeed: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'دفعة بانتظار المراجعة',
    description: 'دفعة الوكيل سامر الحسن ما تزال بحالة قيد المراجعة.',
    createdAt: atDate(-1, 9),
    unread: true,
  },
  {
    id: 'notif-2',
    title: 'رصيد متراكم',
    description: 'الوكيل جلال منصور تجاوز حد الرصيد المسموح لهذا الأسبوع.',
    createdAt: atDate(-1, 14),
    unread: true,
  },
  {
    id: 'notif-3',
    title: 'فاتورة جاهزة للطباعة',
    description: 'تم تجهيز كشف حساب الوكيل محمود العلي للفترة الحالية.',
    createdAt: atDate(-2, 11),
    unread: false,
  },
]

export const mockSessionUser = users[0]
