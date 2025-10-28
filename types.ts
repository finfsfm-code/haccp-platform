// FIX: Create full content for types.ts to define all data structures used in the application.

export type Role = 'COMPANY_ADMIN' | 'TEAM_MEMBER' | 'PLATFORM_ADMIN';
export type BusinessType = 'factory' | 'kitchen' | 'restaurant';
export type UserStatus = 'pending' | 'active' | 'inactive';
export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'coffee_break' | 'desserts' | 'banquets' | 'custom';
export type TaskStatus = 'todo' | 'inprogress' | 'done';

export interface User {
  id: string;
  email: string;
  password?: string;
  companyName: string;
  role: Role;
  status: UserStatus;
  joined: string;
  businessType: BusinessType;
  region?: string;
  industry?: string;
}

export interface TeamMember extends User {
  name: string;
  companyId: string;
  position: string;
  haccpRole: string;
  responsibilities: string;
  permissions: Permission[];
}

export interface CompanyInfo {
  companyName: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: 'g' | 'kg' | 'ml' | 'l' | 'piece';
  supplierId: string;
  reorderPoint?: number;
}

export interface CookingInstructions {
  id: string;
  temperature: string;
  time: string;
  tools: string;
  responsiblePersonId: string;
}

export interface ServingMethod {
    packaging: string;
    servingCondition: 'immediate' | 'internal_transport' | 'external_transport';
    hotHoldingTemperature?: string;
    coldHoldingTemperature?: string;
    requiresExpiryPrinting: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  barcode: string;
  sizeOrWeight: string;
  ingredients: Ingredient[];
  category: MealCategory;
  allergens: string[];
  preparationSteps: string[];
  cookingInstructions: CookingInstructions[];
  servingMethod: ServingMethod;
  headChefId: string;
}

export interface SupplierEvaluation {
    id: string;
    date: string;
    evaluator: string;
    score: number; // 1 to 5
    notes: string;
}

export interface Supplier {
  id: string;
  name: string;
  materials: string[];
  phone: string;
  email: string;
  address: string;
  commercialRegistrationNo?: string;
  taxNo?: string;
  qualityCertificates?: string;
  requiredTests?: string[];
  otherRequirements?: string;
  evaluations: SupplierEvaluation[];
}

export interface TaskComment {
    authorId: string;
    authorName: string;
    timestamp: string;
    text: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: TaskStatus;
  progress: number;
  comments: TaskComment[];
  relatedEquipmentId?: string;
  dueDate?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
}

export interface HazardAnalysisResult {
    hazards: { type: 'biological' | 'chemical' | 'physical'; description: string }[];
    cause: string;
    controlMeasures: string;
    isCCP?: boolean; // Deprecated, use controlPointType
    controlPointType: 'PRP' | 'oPRP' | 'CCP';
    justification: string;
}

export interface ProcessStep {
    id: string;
    stepNumber: number;
    description: string;
    hazardAnalysis: HazardAnalysisResult | null;
}

export interface ProcessFlow {
    id: string;
    productId: string;
    steps: ProcessStep[];
}

export type WaterSource = 'public_network' | 'well' | 'tanker' | 'bottled';

export interface WaterHaccpPlan {
    source: WaterSource;
    sketchUrl?: string;
    requiredTests: { id: string; name: string; frequency: string; lastCheck: string | null }[];
    recommendedFilters: { id: string; type: string; maintenanceSchedule: string }[];
    chemicals: string[];
    haccpDetails: string;
}

export type SensorType = 'site_section' | 'refrigerator' | 'freezer' | 'oven' | 'hot_holding' | 'transport_cart';
export type SiteSectionSubType = 'dry_storage' | 'cold_storage' | 'freezer_storage' | 'receiving' | 'prep_general' | 'prep_salad' | 'prep_pastry' | 'bakery' | 'washing' | 'waste_room';
export type TransportCartSubType = 'hot' | 'cold';


export interface Sensor {
    id: string;
    name: string;
    location: string;
    type: SensorType;
    subType?: SiteSectionSubType | TransportCartSubType;
    currentValue: number;
    targetMin: number;
    targetMax: number;
    warningThreshold: number;
    unit: '°C' | '%';
}

export interface SupportTicket {
    id: string;
    companyId: string;
    companyName: string;
    subject: string;
    message: string;
    createdAt: string;
    status: 'open' | 'closed';
    reply?: string;
}

export const PERMISSION_GROUPS = {
    product: {
        label: 'المنتجات',
        permissions: {
            'product:view': 'عرض المنتجات',
            'product:create': 'إضافة منتجات',
            'product:edit': 'تعديل المنتجات',
            'product:delete': 'حذف المنتجات',
        } as Partial<Record<Permission, string>>,
    },
    supplier: {
        label: 'الموردون',
        permissions: {
            'supplier:view': 'عرض الموردين',
            'supplier:create': 'إضافة موردين',
            'supplier:edit': 'تعديل الموردين',
            'supplier:delete': 'حذف الموردين',
            'supplier:evaluate': 'تقييم الموردين',
        } as Partial<Record<Permission, string>>,
    },
    inventory: {
        label: 'المخزون',
        permissions: {
            'inventory:view': 'عرض المخزون',
            'inventory:manage': 'إدارة المخزون (استلام)',
        } as Partial<Record<Permission, string>>,
    },
    production: {
        label: 'الإنتاج',
        permissions: {
            'production:view': 'عرض أوامر التشغيل',
            'production:create': 'إنشاء أوامر تشغيل',
            'production:manage': 'إدارة أوامر التشغيل',
        } as Partial<Record<Permission, string>>,
    },
    sales: {
        label: 'المبيعات',
        permissions: {
            'sales:view': 'عرض العملاء والمبيعات',
            'sales:create': 'إنشاء عملاء وأوامر بيع',
            'sales:delete': 'حذف العملاء',
        } as Partial<Record<Permission, string>>,
    },
    haccp: {
        label: 'الهاسب',
        permissions: {
            'haccp:view_water_plan': 'عرض هاسب المياه',
            'haccp:manage_water_plan': 'إدارة هاسب المياه',
            'haccp:view_temp_monitoring': 'عرض رصد الحرارة',
            'haccp:manage_temp_monitoring': 'إدارة حساسات الحرارة',
        } as Partial<Record<Permission, string>>,
    },
    prp: {
        label: 'البرامج الأولية',
        permissions: {
            'prp:view': 'عرض البرامج الأولية',
            'prp:manage': 'إنشاء وتعديل البرامج الأولية',
        } as Partial<Record<Permission, string>>,
    },
    maintenance: {
        label: 'الصيانة',
        permissions: {
            'maintenance:view': 'عرض سجلات الصيانة',
            'maintenance:manage': 'إدارة المعدات والصيانة',
        } as Partial<Record<Permission, string>>,
    },
    team: {
        label: 'فريق العمل',
        permissions: {
            'team:view': 'عرض فريق العمل',
            'team:invite': 'دعوة أعضاء جدد',
            'team:edit': 'تعديل بيانات الأعضاء',
            'team:delete': 'حذف أعضاء',
            'team:assign_permissions': 'إدارة الصلاحيات',
        } as Partial<Record<Permission, string>>,
    },
    task: {
        label: 'المهام',
        permissions: {
            'task:view': 'عرض المهام',
            'task:create': 'إنشاء مهام',
            'task:edit': 'تعديل المهام',
        } as Partial<Record<Permission, string>>,
    },
    training: {
        label: 'التدريب',
        permissions: {
            'training:view': 'عرض برامج التدريب',
            'training:create': 'إنشاء برامج تدريب',
            'training:delete': 'حذف برامج تدريب',
            'training:manage_attendees': 'إدارة الحضور',
        } as Partial<Record<Permission, string>>,
    },
    traceability: {
        label: 'التتبع والاستدعاء',
        permissions: {
            'traceability:view': 'عرض شاشة التتبع',
            'traceability:manage': 'إدارة عمليات الاستدعاء',
        } as Partial<Record<Permission, string>>,
    }
};

export type Permission = 
  | 'product:view' | 'product:create' | 'product:edit' | 'product:delete'
  | 'supplier:view' | 'supplier:create' | 'supplier:edit' | 'supplier:delete' | 'supplier:evaluate'
  | 'inventory:view' | 'inventory:manage'
  | 'production:view' | 'production:create' | 'production:manage'
  | 'sales:view' | 'sales:create' | 'sales:delete'
  | 'haccp:view_water_plan' | 'haccp:manage_water_plan' | 'haccp:view_temp_monitoring' | 'haccp:manage_temp_monitoring'
  | 'prp:view' | 'prp:manage'
  | 'maintenance:view' | 'maintenance:manage'
  | 'team:view' | 'team:invite' | 'team:edit' | 'team:delete' | 'team:assign_permissions'
  | 'task:view' | 'task:create' | 'task:edit'
  | 'training:view' | 'training:create' | 'training:delete' | 'training:manage_attendees'
  | 'traceability:view' | 'traceability:manage';


export interface Notification {
  message: string;
  type: 'success' | 'error';
}


export type PRPKey = 'personalHygiene' | 'cleaningAndSanitation' | 'pestControl' | 'supplierControl';
export const prpLibrary: Record<PRPKey, { title: string; description: string }> = {
    personalHygiene: { title: 'النظافة الشخصية', description: 'إجراءات النظافة الشخصية للعاملين.' },
    cleaningAndSanitation: { title: 'التنظيف والتطهير', description: 'إجراءات تنظيف وتطهير الأسطح والمعدات.' },
    pestControl: { title: 'مكافحة الآفات', description: 'إجراءات منع ومكافحة الآفات في المنشأة.' },
    supplierControl: { title: 'التحكم في الموردين', description: 'إجراءات اختيار وتقييم الموردين.' },
};

export interface Attendee {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
}

export interface TrainingProgram {
  id: string;
  name: string;
  trainer: string;
  location: string;
  date: string;
  topics: string;
  attendees: Attendee[];
  assessments: any[];
  evaluations: any[];
}


export interface MaterialReceipt {
    id: string;
    receiptDate: string;
    supplierId: string;
    ingredientId: string;
    ingredientName: string;
    batchNumber: string;
    quantity: number;
    unit: 'g' | 'kg' | 'piece';
    expiryDate: string;
    actualTemperature: number;
    requiredTemperature: number;
    packagingIntact: boolean;
    colorAndOdorNormal: boolean;
    pestFree: boolean;
    isCompliant: boolean;
    temperatureCompliant: boolean;
}

export interface UsedIngredient {
    ingredientId: string;
    quantityUsed: number;
    unit: 'g' | 'kg' | 'piece';
}

export interface ProductionOrder {
    id: string;
    orderNumber?: string;
    productId: string;
    quantity: number;
    batchNumber: string;
    productionDate: string;
    expiryDate: string;
    status: 'planned' | 'materials-issued' | 'in-progress' | 'completed';
    notes: string;
    usedIngredients: UsedIngredient[];
    materialsIssued: boolean;
    rawMaterialBatchNumbers?: { ingredientId: string; batchNumber: string; }[];
}

export interface Customer {
    id: string;
    name: string;
    type: 'customer' | 'distributor' | 'sales_rep';
    phone: string;
    email: string;
    website?: string;
    address?: string;
}

export interface SalesOrderProduct {
    productId: string;
    quantity: number;
    batchNumber: string;
}

export interface SalesOrder {
    id: string;
    orderNumber: string;
    date: string;
    customer: Customer;
    products: SalesOrderProduct[];
    deliveryDate: string;
    deliveryDriver: string;
    deliveryLocation: string;
    salesPersonId: string;
}

export interface TraceabilityResult {
    product: Product;
    productionOrder: ProductionOrder;
    backward: MaterialReceipt[];
    forward: SalesOrder[];
}

export interface MaintenanceLog {
    id: string;
    date: string;
    type: 'maintenance' | 'repair' | 'calibration';
    notes: string;
    performedBy: string;
}

export interface Equipment {
    id: string;
    type: string;
    customType?: string;
    name: string;
    manufacturer: string;
    manufactureDate: string;
    installationDate: string;
    maintenanceSchedule: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'none';
    responsiblePersonId: string;
    warrantyPeriod: string;
    maintenanceLog: MaintenanceLog[];
    lastCleaned?: string;
    sopContent?: string;
    cleaningInstructions?: string;
}


// Recall Management Types
export interface RecallDrillTeamMember {
  memberId: string;
  role: string;
}

export interface RecallDrillTask {
  id: string;
  category: 'communication' | 'logistics' | 'product_handling';
  title: string;
  assignedTo: string;
  status: TaskStatus;
}

export interface MockRecallDrill {
  id: string;
  targetBatchNumber: string;
  startTime: number; // timestamp
  endTime: number | null; // timestamp
  status: 'in-progress' | 'completed';
  currentStep: number; // 1 to 4
  traceabilityResults: {
    backward: ProductionOrder | null;
    forward: SalesOrder[];
  };
  team: RecallDrillTeamMember[];
  tasks: RecallDrillTask[];
  finalDecision: string;
  correctiveActions: string;
}

export interface RecallProcess {
    id: string;
    batchNumber: string;
    reason: string;
    initiatedAt: string;
    status: 'active' | 'completed';
    team: { memberId: string, role: string }[];
    affectedCustomers: {
        customerId: string;
        customerName: string;
        notified: boolean;
        quantity: number;
        quantityRestored: number;
        actionTaken: 'pending' | 'isolated' | 'disposed' | 'returned';
    }[];
    processingTasks: Task[];
    disposalTasks: Task[];
}

export interface PrintableCompanyReportData {
    company: User;
    team: TeamMember[];
    tasks: Task[];
    activityLogs: ActivityLog[];
}