

import React from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';
import { CubeIcon } from '../components/icons/CubeIcon.tsx';
import { TruckIcon } from '../components/icons/TruckIcon.tsx';
import { UsersIcon } from '../components/icons/UsersIcon.tsx';
import { ClipboardListIcon } from '../components/icons/ClipboardListIcon.tsx';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon.tsx';
import { ArchiveBoxIcon } from '../components/icons/ArchiveBoxIcon.tsx';
import { FactoryIcon } from '../components/icons/FactoryIcon.tsx';
// FIX: Added .tsx extension to resolve module.
import { DocumentIcon } from '../components/icons/DocumentIcon.tsx';
import { TemperatureIcon } from '../components/icons/TemperatureIcon.tsx';
// FIX: Added .ts extension to resolve module.
import { Task, TeamMember, Permission } from '../types.ts';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon.tsx';
import { WaterDropIcon } from '../components/icons/WaterDropIcon.tsx';
import { AlertTriangleIcon } from '../components/icons/AlertTriangleIcon.tsx';
// FIX: Added .ts extension to resolve module.
import { Sensor } from '../types.ts';

const Dashboard: React.FC = () => {
    const { 
        products, 
        suppliers, 
        team, 
        tasks, 
        activityLogs,
        currentUser,
        getCompanyBusinessType,
        setActivePage,
        hasPermission,
        sensors,
        waterHaccpPlan
    } = useAppContext();

    const isKitchen = getCompanyBusinessType() === 'kitchen' || getCompanyBusinessType() === 'restaurant';
    const isTeamMember = currentUser?.role === 'TEAM_MEMBER';

    // --- Team Member Dashboard ---
    if (isTeamMember) {
        const myTasks = tasks.filter(task => task.assignedTo === currentUser?.id && task.status !== 'done');
        
        const workspaceShortcuts: { page: string; label: string; icon: React.ReactNode; permission: Permission }[] = [
            { page: 'Products', label: 'المنتجات', icon: <CubeIcon className="h-8 w-8 text-blue-500"/>, permission: 'product:view' },
            { page: 'Suppliers', label: 'الموردون', icon: <TruckIcon className="h-8 w-8 text-emerald-500"/>, permission: 'supplier:view' },
            { page: 'Inventory', label: 'المخزون', icon: <ArchiveBoxIcon className="h-8 w-8 text-yellow-500"/>, permission: 'inventory:view' },
            { page: 'ProductionOrders', label: 'أوامر التشغيل', icon: <FactoryIcon className="h-8 w-8 text-indigo-500"/>, permission: 'production:view' },
            { page: 'HACCPPlan', label: 'خطة الهاسب', icon: <DocumentIcon className="h-8 w-8 text-red-500"/>, permission: 'product:view' }, // Assuming if they can see products, they can see HACCP
            { page: 'PersonalHygiene', label: 'البرامج الأولية', icon: <ShieldCheckIcon className="h-8 w-8 text-cyan-500"/>, permission: 'prp:view' },
            { page: 'TemperatureMonitoring', label: 'رصد الحرارة', icon: <TemperatureIcon className="h-8 w-8 text-orange-500"/>, permission: 'haccp:view_temp_monitoring' },
            { page: 'WaterHACCP', label: 'هاسب المياه', icon: <WaterDropIcon className="h-8 w-8 text-sky-500"/>, permission: 'haccp:view_water_plan' },
        ];

        return (
            <div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">مهامي المفتوحة ({myTasks.length})</h2>
                        {myTasks.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {myTasks.slice(0, 5).map(task => (
                                    <div key={task.id} className="p-3 bg-slate-50 rounded-md border">
                                        <p className="font-semibold text-slate-800 text-sm">{task.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">{task.status === 'todo' ? 'جديدة' : 'قيد التنفيذ'}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-8">لا توجد مهام مفتوحة لديك حاليًا.</p>
                        )}
                         <button onClick={() => setActivePage('Tasks')} className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-2">
                            <span>عرض كل المهام</span>
                            <ArrowLeftIcon className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">اختصارات مساحة العمل</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {workspaceShortcuts.map(shortcut => (
                                hasPermission(shortcut.permission) && (
                                     <button key={shortcut.page} onClick={() => setActivePage(shortcut.page)} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg hover:bg-emerald-50 hover:shadow-md transition-all border border-slate-200">
                                        {shortcut.icon}
                                        <span className="mt-2 text-sm font-semibold text-slate-700">{shortcut.label}</span>
                                    </button>
                                )
                            ))}
                        </div>
                    </div>
                 </div>
            </div>
        );
    }
    
    // --- Company Admin Dashboard ---
    const sensorStatus = sensors.reduce((acc, sensor) => {
        const { currentValue, targetMin, targetMax, warningThreshold } = sensor;
        const lowerWarning = targetMin - warningThreshold;
        const upperWarning = targetMax + warningThreshold;
        if (currentValue > upperWarning || currentValue < lowerWarning) {
            acc.danger++;
        } else if (currentValue < targetMin || currentValue > targetMax) {
            acc.warning++;
        } else {
            acc.compliant++;
        }
        return acc;
    }, { compliant: 0, warning: 0, danger: 0 });

    const upcomingWaterTests = waterHaccpPlan?.requiredTests.filter(test => {
        if (!test.lastCheck) return true; // Always upcoming if never checked
        const lastCheckDate = new Date(test.lastCheck);
        const nextCheckDate = new Date(lastCheckDate);
        const frequencyMap = { daily: 1, weekly: 7, monthly: 30, quarterly: 90, annually: 365 };
        const daysToNext = frequencyMap[test.frequency as keyof typeof frequencyMap] || 30;
        nextCheckDate.setDate(lastCheckDate.getDate() + daysToNext);
        return nextCheckDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Due in the next 7 days
    }).length || 0;


    const stats = [
        { name: isKitchen ? 'الأصناف في المنيو' : 'المنتجات', value: products.length, icon: <CubeIcon className="h-8 w-8 text-blue-500" />, page: 'Products' },
        { name: 'الموردون المعتمدون', value: suppliers.length, icon: <TruckIcon className="h-8 w-8 text-green-500" />, page: 'Suppliers' },
        { name: 'أعضاء فريق العمل', value: team.length, icon: <UsersIcon className="h-8 w-8 text-purple-500" />, page: 'Team' },
        { name: 'المهام قيد التنفيذ', value: tasks.filter(t => t.status === 'inprogress').length, icon: <ClipboardListIcon className="h-8 w-8 text-orange-500" />, page: 'Tasks' },
    ];
    
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map(stat => (
                    <button key={stat.name} onClick={() => setActivePage(stat.page)} className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4 text-right hover:shadow-lg hover:-translate-y-1 transition-all">
                        {stat.icon}
                        <div>
                            <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
                            <div className="text-slate-500 text-sm">{stat.name}</div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Temperature Summary */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                     <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <TemperatureIcon className="h-6 w-6"/>
                        ملخص رصد الحرارة
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-50 text-green-800 rounded-md">
                            <span className="font-semibold">مطابق</span><span className="font-bold text-lg">{sensorStatus.compliant}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 text-yellow-800 rounded-md">
                            <span className="font-semibold">تحذير</span><span className="font-bold text-lg">{sensorStatus.warning}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 text-red-800 rounded-md">
                            <span className="font-semibold">خطر</span><span className="font-bold text-lg">{sensorStatus.danger}</span>
                        </div>
                    </div>
                     <button onClick={() => setActivePage('TemperatureMonitoring')} className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-2">
                        <span>الانتقال إلى شاشة الرصد الحي</span><ArrowLeftIcon className="h-4 w-4" />
                    </button>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">آخر النشاطات</h2>
                     {activityLogs.length > 0 ? (
                        <ul className="space-y-4 max-h-72 overflow-y-auto pr-2">
                           {[...activityLogs].reverse().slice(0, 5).map(log => (
                               <li key={log.id} className="flex items-start gap-3">
                                    <div className="relative mt-1"><div className="h-3 w-3 bg-slate-300 rounded-full"></div></div>
                                    <div><p className="text-sm text-slate-700">{log.action}</p><p className="text-xs text-slate-500">{log.userName} - {new Date(log.timestamp).toLocaleTimeString('ar-SA')}</p></div>
                                </li>
                           ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 text-center py-8">لا توجد أنشطة مسجلة بعد.</p>
                    )}
                </div>

                {/* Alerts */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertTriangleIcon className="h-6 w-6 text-yellow-500" />
                        تنبيهات هامة
                    </h2>
                     {upcomingWaterTests > 0 ? (
                         <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                            <h3 className="font-semibold text-blue-800">هاسب المياه</h3>
                            <p className="text-sm text-blue-700">لديك {upcomingWaterTests} اختبارات مياه مستحقة خلال الأسبوع القادم.</p>
                            <button onClick={() => setActivePage('WaterHACCP')} className="text-xs font-bold text-blue-800 hover:underline mt-1">عرض التفاصيل</button>
                         </div>
                     ) : (
                        <p className="text-slate-500 text-center py-8">لا توجد تنبيهات جديدة.</p>
                     )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;