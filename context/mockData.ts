import {
  User, TeamMember, CompanyInfo, Product, Supplier, Task, ActivityLog,
  ProcessFlow, WaterHaccpPlan, Sensor, SupportTicket,
  BusinessType, TrainingProgram,
  ProductionOrder, Customer, SalesOrder, MaterialReceipt, Equipment, PRPKey, Attendee, SupplierEvaluation
} from '../types.ts';

export const users: User[] = [
  {
    id: 'company_1',
    email: 'info@foodsafety.com.sa',
    password: 'password',
    companyName: 'مصنع الأغذية الحديثة',
    role: 'COMPANY_ADMIN',
    status: 'active',
    joined: '2023-01-15T09:00:00Z',
    businessType: 'factory',
    region: 'الرياض',
    industry: 'تصنيع أغذية'
  },
  {
    id: 'company_2',
    email: 'info@pestpractes.sa',
    password: 'password',
    companyName: 'مطابخ الإعاشة السعودية',
    role: 'COMPANY_ADMIN',
    status: 'active',
    joined: '2023-03-20T11:30:00Z',
    businessType: 'kitchen',
    region: 'جدة',
    industry: 'إعاشة وتموين'
  },
  {
    id: 'platform_admin',
    email: 'admin@foodsafety.com',
    password: 'admin',
    companyName: 'إدارة المنصة',
    role: 'PLATFORM_ADMIN',
    status: 'active',
    joined: '2023-01-01T08:00:00Z',
    businessType: 'factory', // Placeholder
  },
   {
    id: 'company_pending',
    email: 'pending@company.com',
    password: 'password',
    companyName: 'شركة تحت المراجعة',
    role: 'COMPANY_ADMIN',
    status: 'pending',
    joined: new Date().toISOString(),
    businessType: 'restaurant',
    region: 'الدمام',
    industry: 'مطاعم'
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: 'team_1',
    name: 'أحمد علي',
    email: 'ahmed@factory.com',
    password: 'password',
    companyId: 'company_1',
    companyName: 'مصنع الأغذية الحديثة',
    position: 'مشرف جودة',
    haccpRole: 'قائد فريق الهاسب',
    responsibilities: 'الإشراف على تطبيق خطة الهاسب',
    role: 'TEAM_MEMBER',
    status: 'active',
    joined: '2023-02-01T10:00:00Z',
    businessType: 'factory',
    permissions: [
      'product:view', 'product:edit',
      'haccp:view_water_plan', 'haccp:manage_water_plan',
      'prp:view', 'prp:manage',
      'team:view', 'task:view'
    ]
  },
  {
    id: 'team_2',
    name: 'سارة محمد',
    email: 'sara@kitchen.com',
    password: 'password',
    companyId: 'company_2',
    companyName: 'مطابخ الإعاشة السعودية',
    position: 'شيف تنفيذي',
    haccpRole: 'عضو فريق الهاسب',
    responsibilities: 'مسؤولة عن عمليات الطهي والتحضير',
    role: 'TEAM_MEMBER',
    status: 'active',
    joined: '2023-04-01T09:00:00Z',
    businessType: 'kitchen',
    permissions: ['product:view', 'product:create', 'production:view', 'production:create', 'task:view', 'task:create']
  },
  {
    id: 'user-hesma',
    email: 'HESHAMABASS2050@GMAIL.COM',
    password: 'password',
    companyName: 'مصنع الأغذية الحديثة',
    companyId: 'company_1',
    name: 'هشام عباس',
    position: 'مدير الجودة',
    haccpRole: 'عضو فريق',
    responsibilities: 'متابعة الجودة',
    role: 'TEAM_MEMBER',
    status: 'active',
    joined: '2023-05-10T10:00:00.000Z',
    permissions: [
        "product:view", "product:create", "product:edit", "product:delete",
        "supplier:view", "supplier:create", "supplier:edit", "supplier:delete", "supplier:evaluate",
        "inventory:view",
        "sales:view",
        "team:view",
        "task:view", "task:create", "task:edit"
    ],
    businessType: 'factory'
  }
];

export const companyInfo: CompanyInfo = {
  companyName: 'مصنع الأغذية الحديثة',
  address: 'المدينة الصناعية الثانية، الرياض',
  contactPerson: 'خالد عبدالله',
  phone: '011-1234567',
  email: 'info@factory.com'
};

export const suppliers: Supplier[] = [
  {
    id: 'sup_1',
    name: 'مورد الدواجن الوطني',
    materials: ['دجاج طازج'],
    phone: '050-1112222',
    email: 'sales@poultry.com',
    address: 'القصيم',
    commercialRegistrationNo: '1010123456',
    taxNo: '300123456700003',
    qualityCertificates: 'ISO 22000, Halal Certificate',
    requiredTests: ['Salmonella Test', 'E. coli Test'],
    otherRequirements: 'يجب أن تكون درجة حرارة الاستلام أقل من 4 درجات مئوية',
    evaluations: [
      { id: 'eval_1', date: '2023-06-01', evaluator: 'أحمد علي', score: 4, notes: 'جودة ممتازة، التزام بالمواعيد.' }
    ]
  },
  {
    id: 'sup_2',
    name: 'شركة الخضروات والفواكه',
    materials: ['خضروات طازجة', 'فواكه', 'بهارات', 'بقسماط', 'أرز بسمتي'],
    phone: '050-3334444',
    email: 'orders@veg.com',
    address: 'الرياض',
    commercialRegistrationNo: '1010654321',
    taxNo: '300765432100003',
    evaluations: []
  }
];

export const products: Product[] = [
  {
    id: 'prod_1',
    name: 'برجر دجاج مجمد',
    description: 'برجر دجاج عالي الجودة معد للتجميد.',
    barcode: '6281234567890',
    sizeOrWeight: '100g',
    ingredients: [
      { id: 'ing_1', name: 'صدور دجاج', amount: 80, unit: 'g', supplierId: 'sup_1' },
      { id: 'ing_2', name: 'بقسماط', amount: 15, unit: 'g', supplierId: 'sup_2' },
      { id: 'ing_3', name: 'بهارات', amount: 5, unit: 'g', supplierId: 'sup_2' }
    ],
    category: 'lunch',
    allergens: ['Gluten'],
    preparationSteps: ['استلام المواد الخام', 'التخزين المبرد', 'فرم وخلط المكونات', 'تشكيل البرجر', 'التجميد السريع', 'التغليف', 'الكشف عن المعادن', 'التخزين المجمد'],
    cookingInstructions: [
        { id: 'cook_1', temperature: '180°C', time: '15 min', tools: 'فرن حراري', responsiblePersonId: 'team_2' }
    ],
    servingMethod: { packaging: 'تغليف مفرغ من الهواء', servingCondition: 'external_transport', requiresExpiryPrinting: true },
    headChefId: 'team_2'
  },
  {
    id: 'prod_2',
    name: 'وجبة كبسة دجاج',
    description: 'وجبة غداء جاهزة للأكل',
    barcode: 'N/A',
    sizeOrWeight: '1 serving',
     ingredients: [
      { id: 'ing_1', name: 'صدور دجاج', amount: 150, unit: 'g', supplierId: 'sup_1' },
      { id: 'ing_4', name: 'أرز بسمتي', amount: 100, unit: 'g', supplierId: 'sup_2' }
    ],
    category: 'lunch',
    allergens: [],
    preparationSteps: ['استلام الدجاج والخضروات', 'الغسل والتقطيع', 'غسل الأرز', 'طبخ الكبسة', 'الحفظ الساخن', 'التعبئة والتغليف', 'التقديم'],
    cookingInstructions: [],
    servingMethod: { packaging: 'علبة حافظة للحرارة', servingCondition: 'immediate', requiresExpiryPrinting: false },
    headChefId: 'team_2'
  }
];

export const tasks: Task[] = [
  {
    id: 'task_1',
    title: 'معايرة ميزان الحرارة رقم 3',
    description: 'معايرة ميزان الحرارة المستخدم في قسم الطهي.',
    assignedTo: 'team_1',
    status: 'inprogress',
    progress: 50,
    comments: [
        { authorId: 'company_1', authorName: 'مصنع الأغذية الحديثة', timestamp: new Date().toISOString(), text: 'هل تم الانتهاء من هذا؟' }
    ],
    dueDate: '2024-08-15'
  },
  {
    id: 'task_2',
    title: 'تدريب الموظفين الجدد على النظافة الشخصية',
    description: '',
    assignedTo: 'team_1',
    status: 'todo',
    progress: 0,
    comments: [],
     dueDate: '2024-08-20'
  },
  {
    id: 'task_3',
    title: 'مراجعة سجلات HACCP للشهر الماضي',
    description: '',
    assignedTo: 'team_2',
    status: 'done',
    progress: 100,
    comments: [],
  }
];

export const activityLogs: ActivityLog[] = [
  {
    id: 'log_3',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    userId: 'team_2',
    userName: 'سارة محمد',
    action: 'أضافت وجبة جديدة: كبسة دجاج'
  },
  {
    id: 'log_2',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    userId: 'company_1',
    userName: 'مصنع الأغذية الحديثة',
    action: 'قام بتسجيل الدخول.'
  },
  {
    id: 'log_1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 'team_1',
    userName: 'أحمد علي',
    action: 'قام بتحديث خطة هاسب المياه.'
  },
];

export const processFlows: ProcessFlow[] = [
  {
    id: 'prod_1',
    productId: 'prod_1',
    steps: [
      { id: 's1', stepNumber: 1, description: 'استلام المواد الخام', hazardAnalysis: null },
      { id: 's2', stepNumber: 2, description: 'التخزين المبرد', hazardAnalysis: null },
      { id: 's3', stepNumber: 3, description: 'الطهي', hazardAnalysis: null },
      { id: 's4', stepNumber: 4, description: 'التبريد السريع', hazardAnalysis: null },
      { id: 's5', stepNumber: 5, description: 'التغليف', hazardAnalysis: null },
      { id: 's6', stepNumber: 6, description: 'الكشف عن المعادن', hazardAnalysis: null },
      { id: 's7', stepNumber: 7, description: 'التخزين المجمد', hazardAnalysis: null },
      { id: 's8', stepNumber: 8, description: 'التوزيع', hazardAnalysis: null },
    ]
  }
];

export const ccpDeterminations: Record<string, string> = {};
export const criticalLimits: Record<string, string> = {};
export const monitoringProcedures: Record<string, string> = {};
export const correctiveActions: Record<string, string> = {};
export const verificationProcedures: Record<string, string> = {};
export const recordKeeping: Record<string, string> = {};

export const prpPlans: Partial<Record<PRPKey, string>> = {};

export const waterHaccpPlan: WaterHaccpPlan | null = null;

export const sensors: Sensor[] = [
  { id: 'sensor_1', name: 'ثلاجة اللحوم', location: 'المستودع المبرد', type: 'refrigerator', currentValue: 2.5, targetMin: 0, targetMax: 4, warningThreshold: 1, unit: '°C' },
  { id: 'sensor_2', name: 'فريزر الدجاج', location: 'المستودع المجمد', type: 'freezer', currentValue: -18.2, targetMin: -22, targetMax: -18, warningThreshold: 2, unit: '°C' },
  { id: 'sensor_3', name: 'مستودع المواد الجافة', location: 'المستودع الجاف', type: 'site_section', subType: 'dry_storage', currentValue: 24.1, targetMin: 18, targetMax: 25, warningThreshold: 2, unit: '°C' },
];

export const supportTickets: SupportTicket[] = [
    { id: 'ticket_1', companyId: 'company_1', companyName: 'مصنع الأغذية الحديثة', subject: 'مشكلة في طباعة التقارير', message: 'عند محاولة طباعة تقرير الهاسب، تظهر الصفحة فارغة.', createdAt: new Date().toISOString(), status: 'open' },
    { id: 'ticket_2', companyId: 'company_2', companyName: 'المطبخ المركزي الفاخر', subject: 'اقتراح إضافة ميزة', message: 'نود اقتراح إضافة إمكانية تحميل صور للمنتجات.', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'closed', reply: 'شكراً لاقتراحك، فريق التطوير يدرس إمكانية إضافة هذه الميزة في التحديثات القادمة.' },
];

export const trainingPrograms: TrainingProgram[] = [];
export const productionOrders: ProductionOrder[] = [];
export const customers: Customer[] = [];
export const salesOrders: SalesOrder[] = [];
export const materialReceipts: MaterialReceipt[] = [];
export const equipment: Equipment[] = [];

export const adminDashboardData = {
    usersByRegion: { 'الرياض': 1, 'جدة': 1, 'الدمام': 1, 'أخرى': 0 },
    usersByIndustry: { 'تصنيع أغذية': 1, 'إعاشة وتموين': 1, 'مطاعم': 1 },
    accountStatus: { active: 3, inactive: 0 },
};
