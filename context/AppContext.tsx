import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User, TeamMember, CompanyInfo, Product, Supplier, Task, ActivityLog,
  ProcessFlow, WaterHaccpPlan, Sensor, SupportTicket,
  Permission, BusinessType, SensorType,
  SiteSectionSubType, TransportCartSubType, TrainingProgram, Attendee,
  ProductionOrder, UsedIngredient, Customer, SalesOrder, MaterialReceipt, TraceabilityResult,
  Equipment, MockRecallDrill, RecallProcess, PrintableCompanyReportData, PRPKey, WaterSource, SupplierEvaluation
} from '../types.ts';
import * as mockData from './mockData.ts';
import * as geminiService from '../services/geminiService.ts';
// FIX: Import Notification component to resolve name collision with browser Notification API.
import Notification from '../components/Notification.tsx';


interface AppContextType {
  currentUser: User | TeamMember | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (companyName: string, email: string, password: string, businessType: BusinessType) => Promise<User | null>;
  activePage: string;
  setActivePage: (page: string) => void;
  notification: { message: string, type: 'success' | 'error' } | null;
  showNotification: (message: string, type: 'success' | 'error') => void;
  hasPermission: (permission: Permission) => boolean;
  getCompanyBusinessType: () => BusinessType | undefined;

  // State
  users: User[];
  team: TeamMember[];
  companyInfo: CompanyInfo;
  products: Product[];
  suppliers: Supplier[];
  tasks: Task[];
  activityLogs: ActivityLog[];
  processFlows: ProcessFlow[];
  ccpDeterminations: Record<string, string>;
  criticalLimits: Record<string, string>;
  monitoringProcedures: Record<string, string>;
  correctiveActions: Record<string, string>;
  verificationProcedures: Record<string, string>;
  recordKeeping: Record<string, string>;
  prpPlans: Partial<Record<PRPKey, string>>;
  waterHaccpPlan: WaterHaccpPlan | null;
  sensors: Sensor[];
  setSensors: React.Dispatch<React.SetStateAction<Sensor[]>>;
  supportTickets: SupportTicket[];
  trainingPrograms: TrainingProgram[];
  productionOrders: ProductionOrder[];
  customers: Customer[];
  salesOrders: SalesOrder[];
  materialReceipts: MaterialReceipt[];
  equipment: Equipment[];
  recallProcesses: RecallProcess[];
  recallPlans: Record<string, string>;


  // Functions
  addTeamMember: (member: Omit<TeamMember, 'id' | 'companyId' | 'companyName' | 'role' | 'joined' | 'status' | 'businessType'>) => Promise<void>;
  updateTeamMember: (member: TeamMember) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  resetTeamMemberPassword: (id: string) => void;
  
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addSupplier: (supplier: Omit<Supplier, 'id' | 'evaluations'>) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addSupplierEvaluation: (supplierId: string, evaluation: Omit<SupplierEvaluation, 'id'>) => Promise<void>;

  addTask: (task: Omit<Task, 'id' | 'progress' | 'comments'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  addTaskComment: (taskId: string, text: string) => Promise<void>;

  updateCompanyInfo: (info: CompanyInfo) => Promise<void>;

  addOrUpdateProcessFlow: (flow: ProcessFlow) => Promise<void>;
  generateAndSaveHazardAnalysis: (flow: ProcessFlow) => Promise<void>;
  generateAndSaveCCPs: (productId: string) => Promise<void>;
  generateAndSaveCriticalLimits: (productId: string) => Promise<void>;
  generateAndSaveMonitoring: (productId: string) => Promise<void>;
  generateAndSaveCorrectiveActions: (productId: string) => Promise<void>;
  generateAndSaveVerification: (productId: string) => Promise<void>;
  generateAndSaveRecordKeeping: (productId: string) => Promise<void>;

  generateAndSavePRP: (prpKey: PRPKey, businessType: BusinessType, imageData?: { base64: string, mimeType: string }) => Promise<void>;
  
  generateAndSaveWaterHaccpPlan: (source: WaterSource, sketchData?: { base64: string, mimeType: string }) => Promise<void>;
  updateWaterHaccpTestDate: (testId: string) => Promise<void>;

  addSensor: (sensorData: { name: string; type: SensorType; subType?: SiteSectionSubType | TransportCartSubType }) => void;
  
  // Equipment
  addEquipment: (equip: Omit<Equipment, 'id' | 'maintenanceLog' | 'lastCleaned'>) => Promise<void>;
  updateEquipment: (equip: Equipment) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;

  // Platform Admin
  getAllCompanyAdmins: () => User[];
  getPendingCompanies: () => User[];
  approveRegistration: (userId: string) => Promise<void>;
  rejectRegistration: (userId: string) => Promise<void>;
  updateUserStatus: (userId: string, status: 'active' | 'inactive') => Promise<void>;
  deleteCompany: (userId: string) => Promise<void>;
  updateCompanyAdmin: (user: User) => Promise<void>;
  resetUserPassword: (userId: string) => void;
  impersonateUser: (userId: string) => void;
  adminDashboardData: any;
  updateSupportTicket: (ticketId: string, reply: string) => Promise<void>;

  // Training
  addTrainingProgram: (program: Omit<TrainingProgram, 'id' | 'attendees' | 'assessments' | 'evaluations'>) => Promise<void>;
  deleteTrainingProgram: (programId: string) => Promise<void>;
  addAttendee: (programId: string, attendee: Omit<Attendee, 'id'>) => Promise<void>;
  removeAttendee: (programId: string, attendeeId: string) => Promise<void>;
  sendTrainingInvitation: (email: string, name: string, programName: string) => void;

  // Production & Sales
  addProductionOrder: (order: Omit<ProductionOrder, 'id' | 'usedIngredients' | 'materialsIssued' | 'rawMaterialBatchNumbers'>) => Promise<void>;
  updateProductionOrder: (order: ProductionOrder) => Promise<void>;
  issueMaterialsForProduction: (orderId: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  addSalesOrder: (order: Omit<SalesOrder, 'id' | 'orderNumber' | 'date'>) => Promise<void>;
  receiveMaterials: (receipt: Omit<MaterialReceipt, 'id'>) => Promise<void>;

  // Traceability & Recall
  performTraceabilitySearch: (batchNumber: string) => Promise<TraceabilityResult | null>;
  initiateRecall: (batchNumber: string, reason: string) => Promise<void>;
  updateRecallProcess: (process: RecallProcess) => Promise<void>;

  // Mock Recall
  mockRecallDrill: MockRecallDrill | null;
  startMockRecall: () => Promise<void>;
  updateMockRecallDrill: (drill: MockRecallDrill) => Promise<void>;
  completeMockRecallDrill: (drill: MockRecallDrill) => Promise<void>;
  
  // Printable states
  haccpProductIdForPlan: string | null;
  setHaccpProductIdForPlan: (id: string | null) => void;
  printablePlanProductId: string | null;
  setPrintablePlanProductId: (id: string | null) => void;
  printableProcessFlowProductId: string | null;
  setPrintableProcessFlowProductId: (id: string | null) => void;
  printableMockRecall: MockRecallDrill | null;
  setPrintableMockRecall: (drill: MockRecallDrill | null) => void;
  printableRecallPlanBatchNumber: string | null;
  setPrintableRecallPlanBatchNumber: (batch: string | null) => void;
  printableCompanyReportData: PrintableCompanyReportData | null;
  setPrintableCompanyReportData: (data: PrintableCompanyReportData | null) => void;
  printableWaterHACCP: boolean;
  setPrintableWaterHACCP: (status: boolean) => void;

  verifyEmail: (token: string) => Promise<boolean>;
}


const AppContext = createContext<AppContextType>(null!);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This would be replaced with API calls in a real app
  const [users, setUsers] = useState<User[]>(mockData.users);
  const [team, setTeam] = useState<TeamMember[]>(mockData.teamMembers);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(mockData.companyInfo);
  const [products, setProducts] = useState<Product[]>(mockData.products);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockData.suppliers);
  const [tasks, setTasks] = useState<Task[]>(mockData.tasks);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockData.activityLogs);
  const [processFlows, setProcessFlows] = useState<ProcessFlow[]>(mockData.processFlows);
  const [ccpDeterminations, setCcpDeterminations] = useState<Record<string, string>>(mockData.ccpDeterminations);
  const [criticalLimits, setCriticalLimits] = useState<Record<string, string>>(mockData.criticalLimits);
  const [monitoringProcedures, setMonitoringProcedures] = useState<Record<string, string>>(mockData.monitoringProcedures);
  const [correctiveActions, setCorrectiveActions] = useState<Record<string, string>>(mockData.correctiveActions);
  const [verificationProcedures, setVerificationProcedures] = useState<Record<string, string>>(mockData.verificationProcedures);
  const [recordKeeping, setRecordKeeping] = useState<Record<string, string>>(mockData.recordKeeping);
  const [prpPlans, setPrpPlans] = useState<Partial<Record<PRPKey, string>>>(mockData.prpPlans);
  const [waterHaccpPlan, setWaterHaccpPlan] = useState<WaterHaccpPlan | null>(mockData.waterHaccpPlan);
  const [sensors, setSensors] = useState<Sensor[]>(mockData.sensors);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(mockData.supportTickets);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>(mockData.trainingPrograms);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(mockData.productionOrders);
  const [customers, setCustomers] = useState<Customer[]>(mockData.customers);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(mockData.salesOrders);
  const [materialReceipts, setMaterialReceipts] = useState<MaterialReceipt[]>(mockData.materialReceipts);
  const [equipment, setEquipment] = useState<Equipment[]>(mockData.equipment);
  const [recallProcesses, setRecallProcesses] = useState<RecallProcess[]>([]);
  const [mockRecallDrill, setMockRecallDrill] = useState<MockRecallDrill | null>(null);
  const [recallPlans, setRecallPlans] = useState<Record<string, string>>({});


  const [currentUser, setCurrentUser] = useState<User | TeamMember | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activePage, setActivePage] = useState<string>('Dashboard');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Printable states
  const [haccpProductIdForPlan, setHaccpProductIdForPlan] = useState<string | null>(null);
  const [printablePlanProductId, setPrintablePlanProductId] = useState<string | null>(null);
  const [printableProcessFlowProductId, setPrintableProcessFlowProductId] = useState<string | null>(null);
  const [printableMockRecall, setPrintableMockRecall] = useState<MockRecallDrill | null>(null);
  const [printableRecallPlanBatchNumber, setPrintableRecallPlanBatchNumber] = useState<string | null>(null);
  const [printableCompanyReportData, setPrintableCompanyReportData] = useState<PrintableCompanyReportData | null>(null);
  const [printableWaterHACCP, setPrintableWaterHACCP] = useState<boolean>(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };
  
  const logAction = (action: string, user: User | TeamMember) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.role === 'TEAM_MEMBER' ? (user as TeamMember).name : user.companyName,
      action,
    };
    setActivityLogs(prev => [...prev, newLog]);
  };
  

  const login = async (email: string, password: string) => {
    const allUsers = [...users, ...team];
    const user = allUsers.find(u => u.email === email && u.password === password);
    if (user && user.status === 'active') {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      logAction('قام بتسجيل الدخول', user);
      showNotification('تم تسجيل الدخول بنجاح!', 'success');
    } else if (user && user.status !== 'active') {
      showNotification('الحساب غير نشط أو معلق.', 'error');
    } else {
      showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة.', 'error');
    }
  };

  const logout = () => {
    if(currentUser) {
        logAction('قام بتسجيل الخروج', currentUser);
    }
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = async (companyName: string, email: string, password: string, businessType: BusinessType) => {
    if (users.find(u => u.email === email)) {
      showNotification('هذا البريد الإلكتروني مسجل بالفعل.', 'error');
      return null;
    }
    const newUser: User = {
      id: `company_${Date.now()}`,
      email,
      password,
      companyName,
      role: 'COMPANY_ADMIN',
      status: 'pending', // Requires platform admin approval
      joined: new Date().toISOString(),
      businessType,
      region: 'غير محدد',
      industry: 'غير محدد'
    };
    setUsers(prev => [...prev, newUser]);
    showNotification('تم إرسال طلب التسجيل. سيتم مراجعته من قبل إدارة المنصة.', 'success');
    return newUser;
  };
  
  const verifyEmail = async (token: string): Promise<boolean> => {
    // Mock implementation
    const userId = token;
    const user = users.find(u => u.id === userId && u.status === 'pending');
    if(user) {
        updateUserStatus(userId, 'active');
        return true;
    }
    return false;
  }

  const hasPermission = (permission: Permission) => {
    if (!currentUser) return false;
    if (currentUser.role === 'COMPANY_ADMIN') return true; // Admins have all permissions for their company
    if (currentUser.role === 'PLATFORM_ADMIN') return true; // Platform admins have all permissions
    if (currentUser.role === 'TEAM_MEMBER') {
      return (currentUser as TeamMember).permissions.includes(permission);
    }
    return false;
  };

  const getCompanyBusinessType = () => {
      if (!currentUser) return undefined;
      if (currentUser.role === 'TEAM_MEMBER') {
          const companyAdmin = users.find(u => u.id === (currentUser as TeamMember).companyId);
          return companyAdmin?.businessType;
      }
      return currentUser.businessType;
  }
  
  // A helper to get the current company ID
  const getCompanyId = () => {
    if(!currentUser) return null;
    return currentUser.role === 'TEAM_MEMBER' ? (currentUser as TeamMember).companyId : currentUser.id;
  }

  const addTeamMember = async (memberData: Omit<TeamMember, 'id' | 'companyId' | 'companyName' | 'role' | 'joined' | 'status' | 'businessType'>) => {
    const companyId = getCompanyId();
    const company = users.find(u => u.id === companyId);
    if (!company) return;

    const newMember: TeamMember = {
      ...memberData,
      id: `team_${Date.now()}`,
      companyId: company.id,
      companyName: company.companyName,
      role: 'TEAM_MEMBER',
      joined: new Date().toISOString(),
      status: 'pending', // Team members need to accept invitation via email
      businessType: company.businessType,
    };
    setTeam(prev => [...prev, newMember]);
    logAction(`دعا ${newMember.name} للانضمام للفريق`, currentUser!);
  };
  
  const updateTeamMember = async (member: TeamMember) => {
    setTeam(prev => prev.map(m => m.id === member.id ? member : m));
     logAction(`حدّث بيانات ${member.name}`, currentUser!);
  };
  
  const deleteTeamMember = async (id: string) => {
    const member = team.find(m => m.id === id);
    setTeam(prev => prev.filter(m => m.id !== id));
    if(member) {
        logAction(`حذف ${member.name} من الفريق`, currentUser!);
    }
  };

  const resetTeamMemberPassword = (id: string) => {
    showNotification('تم إرسال رابط إعادة تعيين كلمة المرور.', 'success');
  };
  
  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: `prod_${Date.now()}` };
    setProducts(prev => [...prev, newProduct]);
     logAction(`أضاف منتج: ${newProduct.name}`, currentUser!);
  };
  
  const updateProduct = async (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
     logAction(`حدّث منتج: ${product.name}`, currentUser!);
  };
  
  const deleteProduct = async (id: string) => {
     const product = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    if(product) {
       logAction(`حذف منتج: ${product.name}`, currentUser!);
    }
  };
  
  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'evaluations'>) => {
    const newSupplier = { ...supplier, id: `sup_${Date.now()}`, evaluations: [] };
    setSuppliers(prev => [...prev, newSupplier]);
     logAction(`أضاف مورد: ${newSupplier.name}`, currentUser!);
  };
  
  const updateSupplier = async (supplier: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
     logAction(`حدّث مورد: ${supplier.name}`, currentUser!);
  };
  
  const deleteSupplier = async (id: string) => {
    const supplier = suppliers.find(s => s.id === id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
     if(supplier) {
       logAction(`حذف مورد: ${supplier.name}`, currentUser!);
    }
  };

  const addSupplierEvaluation = async (supplierId: string, evaluation: Omit<SupplierEvaluation, 'id'>) => {
    setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, evaluations: [...s.evaluations, { ...evaluation, id: `eval_${Date.now()}`}] } : s));
  };

  const addTask = async (task: Omit<Task, 'id' | 'progress' | 'comments'>) => {
    const newTask = { ...task, id: `task_${Date.now()}`, progress: 0, comments: [] };
    setTasks(prev => [...prev, newTask]);
    logAction(`أضاف مهمة: ${newTask.title}`, currentUser!);
  };

  const updateTask = async (task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
  };
  
  const addTaskComment = async (taskId: string, text: string) => {
    const newComment = {
        authorId: currentUser!.id,
        authorName: currentUser!.role === 'TEAM_MEMBER' ? (currentUser as TeamMember).name : currentUser!.companyName,
        timestamp: new Date().toISOString(),
        text: text,
    };
    setTasks(prev => prev.map(t => t.id === taskId ? {...t, comments: [...t.comments, newComment]} : t));
  };
  
  const updateCompanyInfo = async (info: CompanyInfo) => {
    setCompanyInfo(info);
  };
  
  const addOrUpdateProcessFlow = async (flow: ProcessFlow) => {
    setProcessFlows(prev => {
        const existing = prev.find(f => f.productId === flow.productId);
        if(existing) {
            return prev.map(f => f.productId === flow.productId ? flow : f);
        }
        return [...prev, flow];
    });
  };
  
  const generateAndSaveHazardAnalysis = async (flow: ProcessFlow) => {
    showNotification('جاري تحليل المخاطر...', 'success');
    const updatedSteps = await geminiService.generateHazardAnalysisForFlow(flow.steps);
    const updatedFlow = { ...flow, steps: updatedSteps };
    addOrUpdateProcessFlow(updatedFlow);
    showNotification('اكتمل تحليل المخاطر بنجاح.', 'success');
  };
  
  const generateAndSaveCCPs = async (productId: string) => {
    const flow = processFlows.find(f => f.productId === productId);
    if (!flow) return;
    showNotification('جاري تحديد نقاط التحكم الحرجة...', 'success');
    const result = await geminiService.generateCCPs(flow.steps);
    setCcpDeterminations(prev => ({...prev, [productId]: result}));
    showNotification('تم تحديد نقاط التحكم الحرجة.', 'success');
  }

  const generateAndSaveCriticalLimits = async (productId: string) => {
    const ccpResult = ccpDeterminations[productId];
    if(!ccpResult) return;
    showNotification('جاري اقتراح الحدود الحرجة...', 'success');
    const result = await geminiService.generateCriticalLimits(ccpResult);
    setCriticalLimits(prev => ({...prev, [productId]: result}));
    showNotification('تم اقتراح الحدود الحرجة بنجاح.', 'success');
  }

  const generateAndSaveMonitoring = async (productId: string) => {
     const limits = criticalLimits[productId];
     const flow = processFlows.find(f => f.productId === productId);
    if(!limits || !flow) return;
    showNotification('جاري إنشاء إجراءات الرصد...', 'success');
    const result = await geminiService.generateMonitoringProcedures(limits, flow);
    setMonitoringProcedures(prev => ({...prev, [productId]: result}));
    showNotification('تم إنشاء إجراءات الرصد بنجاح.', 'success');
  }

  const generateAndSaveCorrectiveActions = async (productId: string) => {
    const limits = criticalLimits[productId];
    const flow = processFlows.find(f => f.productId === productId);
    if(!limits || !flow) return;
    showNotification('جاري إنشاء الإجراءات التصحيحية...', 'success');
    const result = await geminiService.generateCorrectiveActions(limits, flow);
    setCorrectiveActions(prev => ({...prev, [productId]: result}));
    showNotification('تم إنشاء الإجراءات التصحيحية بنجاح.', 'success');
  }

  const generateAndSaveVerification = async (productId: string) => {
     const planSoFar = {
      ccps: ccpDeterminations[productId],
      limits: criticalLimits[productId],
      monitoring: monitoringProcedures[productId],
      actions: correctiveActions[productId]
    };
    if(!planSoFar.ccps) return;
    showNotification('جاري إنشاء إجراءات التحقق...', 'success');
    const result = await geminiService.generateVerificationProcedures(planSoFar);
    setVerificationProcedures(prev => ({...prev, [productId]: result}));
    showNotification('تم إنشاء إجراءات التحقق بنجاح.', 'success');
  }

  const generateAndSaveRecordKeeping = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if(!product) return;
    showNotification('جاري إنشاء خطة التوثيق...', 'success');
    const result = await geminiService.generateRecordKeepingPlan(product.name);
    setRecordKeeping(prev => ({...prev, [productId]: result}));
    showNotification('تم إنشاء خطة التوثيق بنجاح.', 'success');
  }

  const generateAndSavePRP = async (prpKey: PRPKey, businessType: BusinessType, imageData?: { base64: string, mimeType: string }) => {
    showNotification(`جاري إنشاء خطة ${prpKey}...`, 'success');
    const result = await geminiService.generatePRP(prpKey, businessType, imageData);
    setPrpPlans(prev => ({...prev, [prpKey]: result}));
    showNotification(`تم إنشاء خطة ${prpKey} بنجاح.`, 'success');
  }

  const generateAndSaveWaterHaccpPlan = async (source: WaterSource, sketchData?: { base64: string, mimeType: string }) => {
    showNotification('جاري إنشاء خطة هاسب المياه...', 'success');
    const result = await geminiService.generateWaterHaccpPlan(source, sketchData);
    setWaterHaccpPlan(result);
    showNotification('تم إنشاء خطة هاسب المياه بنجاح.', 'success');
  }
  
  const updateWaterHaccpTestDate = async (testId: string) => {
    if(!waterHaccpPlan) return;
    const updatedPlan = {
      ...waterHaccpPlan,
      requiredTests: waterHaccpPlan.requiredTests.map(t => 
        t.id === testId ? { ...t, lastCheck: new Date().toISOString().split('T')[0] } : t
      )
    };
    setWaterHaccpPlan(updatedPlan);
    showNotification('تم تحديث تاريخ الفحص.', 'success');
  };

  const addSensor = (sensorData: { name: string; type: SensorType; subType?: SiteSectionSubType | TransportCartSubType }) => {
    const defaults = {
        refrigerator: { min: 0, max: 4, unit: '°C' as const, threshold: 1, value: 2 },
        freezer: { min: -22, max: -18, unit: '°C' as const, threshold: 2, value: -20 },
        oven: { min: 160, max: 220, unit: '°C' as const, threshold: 10, value: 180 },
        hot_holding: { min: 63, max: 75, unit: '°C' as const, threshold: 5, value: 65 },
        site_section: { min: 18, max: 25, unit: '°C' as const, threshold: 2, value: 22 },
        transport_cart: { min: 0, max: 4, unit: '°C' as const, threshold: 2, value: 3 },
    };
    
    let config = defaults[sensorData.type];

    if(sensorData.type === 'transport_cart' && sensorData.subType === 'hot') {
        config = defaults.hot_holding;
    }

    const newSensor: Sensor = {
        id: `sensor_${Date.now()}`,
        name: sensorData.name,
        location: sensorData.subType || sensorData.type,
        type: sensorData.type,
        subType: sensorData.subType,
        currentValue: config.value,
        targetMin: config.min,
        targetMax: config.max,
        warningThreshold: config.threshold,
        unit: config.unit,
    };

    setSensors(prev => [...prev, newSensor]);
    showNotification('تمت إضافة الحساس بنجاح.', 'success');
  };

  const addEquipment = async (equip: Omit<Equipment, 'id' | 'maintenanceLog' | 'lastCleaned'>) => {
    const newEquipment: Equipment = {
      ...equip,
      id: `equip_${Date.now()}`,
      maintenanceLog: [],
    };
    setEquipment(prev => [...prev, newEquipment]);

    if (newEquipment.maintenanceSchedule !== 'none') {
        const scheduleMap = { daily: 1, weekly: 7, monthly: 30, quarterly: 90, annually: 365 };
        const dueDate = new Date(newEquipment.installationDate);
        dueDate.setDate(dueDate.getDate() + scheduleMap[newEquipment.maintenanceSchedule]);
        
        const maintenanceTask: Omit<Task, 'id' | 'progress' | 'comments'> = {
            title: `صيانة دورية لـ ${newEquipment.name}`,
            description: `إجراء الصيانة ${scheduleMap[newEquipment.maintenanceSchedule]} المجدولة.`,
            assignedTo: newEquipment.responsiblePersonId,
            status: 'todo',
            relatedEquipmentId: newEquipment.id,
            dueDate: dueDate.toISOString().split('T')[0],
        };
        await addTask(maintenanceTask);
    }
    
    // Asynchronously generate SOP and cleaning instructions
    setTimeout(async () => {
        try {
            const [sop, cleaning] = await Promise.all([
                geminiService.generateEquipmentSOP(newEquipment.type, newEquipment.name),
                geminiService.generateCleaningInstructions(newEquipment.type, newEquipment.name)
            ]);
            setEquipment(prev => prev.map(e => e.id === newEquipment.id ? { ...e, sopContent: sop, cleaningInstructions: cleaning } : e));
        } catch (error) {
            console.error("Failed to generate AI content for equipment", error);
        }
    }, 100);

  };
  
  const updateEquipment = async (equip: Equipment) => {
    setEquipment(prev => prev.map(e => e.id === equip.id ? equip : e));
  };

  const deleteEquipment = async (id: string) => {
    setEquipment(prev => prev.filter(e => e.id !== id));
  };
  
  // Platform Admin functions
  const getAllCompanyAdmins = () => users.filter(u => u.role === 'COMPANY_ADMIN' && u.status !== 'pending');
  const getPendingCompanies = () => users.filter(u => u.status === 'pending');

  const approveRegistration = async (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active' } : u));
    showNotification('تمت الموافقة على طلب التسجيل.', 'success');
  };

  const rejectRegistration = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    showNotification('تم رفض وحذف طلب التسجيل.', 'success');
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'inactive') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  };
  
  const deleteCompany = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    // Also delete team members of that company
    setTeam(prev => prev.filter(t => t.companyId !== userId));
  };
  
  const updateCompanyAdmin = async (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
  };
  
  const resetUserPassword = (userId: string) => {
    showNotification('تم إرسال رابط إعادة تعيين كلمة المرور للمستخدم.', 'success');
  };

  const impersonateUser = (userId: string) => {
    const userToImpersonate = users.find(u => u.id === userId);
    if (userToImpersonate) {
        localStorage.setItem('realUser', JSON.stringify(currentUser));
        setCurrentUser(userToImpersonate);
        showNotification(`أنت الآن تتصفح كـ ${userToImpersonate.companyName}`, 'success');
    }
  };
  
  const updateSupportTicket = async (ticketId: string, reply: string) => {
    setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, reply, status: 'closed' } : t));
    showNotification('تم إرسال الرد وإغلاق التذكرة.', 'success');
  };

  const addTrainingProgram = async (program: Omit<TrainingProgram, 'id' | 'attendees' | 'assessments' | 'evaluations'>) => {
    const newProgram: TrainingProgram = {
        ...program,
        id: `train_${Date.now()}`,
        attendees: [],
        assessments: [],
        evaluations: []
    };
    setTrainingPrograms(prev => [...prev, newProgram]);
  };
  
  const deleteTrainingProgram = async (programId: string) => {
    setTrainingPrograms(prev => prev.filter(p => p.id !== programId));
  }
  
  const addAttendee = async (programId: string, attendee: Omit<Attendee, 'id'>) => {
    const newAttendee = { ...attendee, id: `att_${Date.now()}` };
    setTrainingPrograms(prev => prev.map(p => p.id === programId ? {...p, attendees: [...p.attendees, newAttendee]} : p));
  };
  
  const removeAttendee = async (programId: string, attendeeId: string) => {
    setTrainingPrograms(prev => prev.map(p => p.id === programId ? {...p, attendees: p.attendees.filter(a => a.id !== attendeeId)} : p));
  };

  const sendTrainingInvitation = (email: string, name: string, programName: string) => {
    showNotification(`تم إرسال دعوة تدريب لـ ${name} على ${email}`, 'success');
  };

  // Dummy implementation of other functions
  const addProductionOrder = async (order: Omit<ProductionOrder, 'id' | 'usedIngredients' | 'materialsIssued' | 'rawMaterialBatchNumbers'>) => {
     const newProdOrder: ProductionOrder = {
        ...order,
        id: `po_${Date.now()}`,
        orderNumber: `PO-${Date.now().toString().slice(-4)}`,
        usedIngredients: [],
        materialsIssued: false,
    };
    setProductionOrders(prev => [...prev, newProdOrder]);
  };
  
  const updateProductionOrder = async (order: ProductionOrder) => {
    setProductionOrders(prev => prev.map(o => o.id === order.id ? order : o));
  };

  const issueMaterialsForProduction = async (orderId: string) => {
    const order = productionOrders.find(o => o.id === orderId);
    const product = products.find(p => p.id === order?.productId);
    if (!order || !product) return;

    const usedIngredients: UsedIngredient[] = product.ingredients.map(ing => {
        const baseQuantity = ing.amount * (order.quantity / (parseFloat(product.sizeOrWeight) || 1));
        
        // This logic handles unit conversion and ensures the final unit type matches UsedIngredient['unit']
        let finalQuantity = baseQuantity;
        let finalUnit: UsedIngredient['unit'] = 'g';

        if (ing.unit === 'ml') {
            finalUnit = 'g'; // Assume 1:1 conversion for simplicity
            finalQuantity = baseQuantity;
        } else if (ing.unit === 'l') {
            finalUnit = 'kg'; // Assume 1:1 conversion for simplicity
            finalQuantity = baseQuantity;
        } else if (ing.unit === 'g' || ing.unit === 'kg' || ing.unit === 'piece') {
            finalUnit = ing.unit;
            finalQuantity = baseQuantity;
        }
        
        return {
            ingredientId: ing.id,
            quantityUsed: finalQuantity,
            unit: finalUnit,
        };
    });

    updateProductionOrder({ ...order, status: 'materials-issued', materialsIssued: true, usedIngredients });
    showNotification('تم صرف المواد بنجاح.', 'success');
  };
  
  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    const newCustomer = { ...customer, id: `cust_${Date.now()}` };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const deleteCustomer = async (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  };
  
  const addSalesOrder = async (order: Omit<SalesOrder, 'id' | 'orderNumber' | 'date'>) => {
    const newSalesOrder: SalesOrder = {
        ...order,
        id: `so_${Date.now()}`,
        orderNumber: `SO-${Date.now().toString().slice(-5)}`,
        date: new Date().toISOString(),
    };
    setSalesOrders(prev => [...prev, newSalesOrder]);
  };

  const receiveMaterials = async (receipt: Omit<MaterialReceipt, 'id'>) => {
    const newReceipt = { ...receipt, id: `rec_${Date.now()}` }; 
    setMaterialReceipts(prev => [...prev, newReceipt]);
    showNotification(`تم استلام ${receipt.ingredientName} بنجاح.`, 'success');
  };

  const performTraceabilitySearch = async (batchNumber: string): Promise<TraceabilityResult | null> => {
    const po = productionOrders.find(o => o.batchNumber === batchNumber);
    if (!po) return null;
    
    const product = products.find(p => p.id === po.productId);
    if (!product) return null;

    const backward = (po.rawMaterialBatchNumbers || []).map(b => 
        materialReceipts.find(r => r.ingredientId === b.ingredientId && r.batchNumber === b.batchNumber)
    ).filter(Boolean) as MaterialReceipt[];

    const forward = salesOrders.filter(so => so.products.some(p => p.batchNumber === batchNumber));

    return { product, productionOrder: po, backward, forward };
  };
  
  const initiateRecall = async (batchNumber: string, reason: string) => {
     const searchResult = await performTraceabilitySearch(batchNumber);
     if (!searchResult) {
        showNotification('لم يتم العثور على التشغيلة لبدء الاستدعاء.', 'error');
        return;
     }

     const newRecall: RecallProcess = {
        id: `recall_${Date.now()}`,
        batchNumber,
        reason,
        initiatedAt: new Date().toISOString(),
        status: 'active',
        team: [],
        affectedCustomers: searchResult.forward.map(so => ({
            customerId: so.customer.id,
            customerName: so.customer.name,
            notified: false,
            quantity: so.products.find(p => p.batchNumber === batchNumber)!.quantity,
            quantityRestored: 0,
            actionTaken: 'pending',
        })),
        processingTasks: [],
        disposalTasks: [],
     };

     setRecallProcesses(prev => [...prev, newRecall]);
     showNotification(`تم بدء عملية استدعاء للتشغيلة ${batchNumber}.`, 'success');
  };

  const updateRecallProcess = async (process: RecallProcess) => {
    setRecallProcesses(prev => prev.map(p => p.id === process.id ? process : p));
  };
  
  const startMockRecall = async () => {
    const completedOrders = productionOrders.filter(o => o.status === 'completed' && salesOrders.some(so => so.products.some(p => p.batchNumber === o.batchNumber)));
    if (completedOrders.length === 0) {
        showNotification('لا توجد تشغيلات مكتملة ومباعة لبدء تدريب.', 'error');
        return;
    }
    const targetOrder = completedOrders[Math.floor(Math.random() * completedOrders.length)];
    const traceability = await performTraceabilitySearch(targetOrder.batchNumber);

    const drill: MockRecallDrill = {
        id: `mock_${Date.now()}`,
        targetBatchNumber: targetOrder.batchNumber,
        startTime: Date.now(),
        endTime: null,
        status: 'in-progress',
        currentStep: 1,
        traceabilityResults: {
            backward: traceability?.productionOrder || null,
            forward: traceability?.forward || [],
        },
        team: [],
        tasks: [],
        finalDecision: '',
        correctiveActions: '',
    };
    setMockRecallDrill(drill);
  };
  
  const updateMockRecallDrill = async (drill: MockRecallDrill) => {
    setMockRecallDrill(drill);
  };
  
  const completeMockRecallDrill = async (drill: MockRecallDrill) => {
    const completedDrill = { ...drill, status: 'completed' as const, endTime: Date.now() };
    setMockRecallDrill(completedDrill);
    setPrintableMockRecall(completedDrill);
    showNotification('اكتمل تدريب الاستدعاء الوهمي بنجاح.', 'success');
  };



  const value: AppContextType = {
    currentUser,
    login,
    logout,
    register,
    activePage,
    setActivePage,
    notification,
    showNotification,
    hasPermission,
    getCompanyBusinessType,
    
    // State
    users,
    team,
    companyInfo,
    products,
    suppliers,
    tasks,
    activityLogs,
    processFlows,
    ccpDeterminations,
    criticalLimits,
    monitoringProcedures,
    correctiveActions,
    verificationProcedures,
    recordKeeping,
    prpPlans,
    waterHaccpPlan,
    sensors,
    setSensors,
    supportTickets,
    trainingPrograms,
    productionOrders,
    customers,
    salesOrders,
    materialReceipts,
    equipment,
    recallProcesses,
    recallPlans,
    
    // Functions
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    resetTeamMemberPassword,
    addProduct,
    updateProduct,
    deleteProduct,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addSupplierEvaluation,
    addTask,
    updateTask,
    addTaskComment,
    updateCompanyInfo,
    addOrUpdateProcessFlow,
    generateAndSaveHazardAnalysis,
    generateAndSaveCCPs,
    generateAndSaveCriticalLimits,
    generateAndSaveMonitoring,
    generateAndSaveCorrectiveActions,
    generateAndSaveVerification,
    generateAndSaveRecordKeeping,
    generateAndSavePRP,
    generateAndSaveWaterHaccpPlan,
    updateWaterHaccpTestDate,
    addSensor,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    
    // Platform Admin
    getAllCompanyAdmins,
    getPendingCompanies,
    approveRegistration,
    rejectRegistration,
    updateUserStatus,
    deleteCompany,
    updateCompanyAdmin,
    resetUserPassword,
    impersonateUser,
    adminDashboardData: mockData.adminDashboardData,
    updateSupportTicket,

    // Training
    addTrainingProgram,
    deleteTrainingProgram,
    addAttendee,
    removeAttendee,
    sendTrainingInvitation,

    // Production & Sales
    addProductionOrder,
    updateProductionOrder,
    issueMaterialsForProduction,
    addCustomer,
    deleteCustomer,
    addSalesOrder,
    receiveMaterials,
    
    // Traceability & Recall
    performTraceabilitySearch,
    initiateRecall,
    updateRecallProcess,

    // Mock Recall
    mockRecallDrill,
    startMockRecall,
    updateMockRecallDrill,
    completeMockRecallDrill,
    
    // Printable states
    haccpProductIdForPlan,
    setHaccpProductIdForPlan,
    printablePlanProductId,
    setPrintablePlanProductId,
    printableProcessFlowProductId,
    setPrintableProcessFlowProductId,
    printableMockRecall,
    setPrintableMockRecall,
    printableRecallPlanBatchNumber,
    setPrintableRecallPlanBatchNumber,
    printableCompanyReportData,
    setPrintableCompanyReportData,
    printableWaterHACCP,
    setPrintableWaterHACCP,

    verifyEmail,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {notification && <Notification message={notification.message} type={notification.type} />}
    </AppContext.Provider>
  );
};


// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};