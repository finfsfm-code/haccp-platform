import React from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { HomeIcon } from './icons/HomeIcon.tsx';
import { CubeIcon } from './icons/CubeIcon.tsx';
import { TruckIcon } from './icons/TruckIcon.tsx';
import { UsersIcon } from './icons/UsersIcon.tsx';
import { ClipboardListIcon } from './icons/ClipboardListIcon.tsx';
import { DocumentIcon } from './icons/DocumentIcon.tsx';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon.tsx';
import { AcademicCapIcon } from './icons/AcademicCapIcon.tsx';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon.tsx';
import { FactoryIcon } from './icons/FactoryIcon.tsx';
import { CogIcon } from './icons/CogIcon.tsx';
import { Logo } from './Logo.tsx';
import { TemperatureIcon } from './icons/TemperatureIcon.tsx';
import { WaterDropIcon } from './icons/WaterDropIcon.tsx';
import { ClockIcon } from './icons/ClockIcon.tsx';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon.tsx';

const NavItem: React.FC<{item: any, activePage: string, setActivePage: (page: string) => void}> = ({ item, activePage, setActivePage }) => (
    <button
        onClick={() => setActivePage(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
        activePage === item.id 
        ? 'bg-[var(--accent)] text-white' 
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
    >
        <item.icon className="h-6 w-6" />
        <span>{item.label}</span>
    </button>
);

const KitchenSidebar: React.FC = () => {
    const { activePage, setActivePage, hasPermission } = useAppContext();

     const navGroups = [
        { items: [{ id: 'Dashboard', label: 'الرئيسية', icon: HomeIcon, permission: true }] },
        {
            title: 'العمليات والتحضير',
            items: [
                { id: 'Products', label: 'المنيو والأصناف', icon: CubeIcon, permission: hasPermission('product:view') },
                { id: 'Suppliers', label: 'الموردون', icon: TruckIcon, permission: hasPermission('supplier:view') },
                { id: 'Inventory', label: 'المخزون', icon: ArchiveBoxIcon, permission: hasPermission('inventory:view') },
                { id: 'ProductionOrders', label: 'أوامر التحضير', icon: FactoryIcon, permission: hasPermission('production:view') },
            ]
        },
        {
            title: 'الهاسب والعمليات',
            items: [
                { id: 'HACCPPlan', label: 'خطة الهاسب', icon: DocumentIcon, permission: hasPermission('product:view') },
                { id: 'WaterHACCP', label: 'هاسب المياه', icon: WaterDropIcon, permission: hasPermission('haccp:view_water_plan') },
                { id: 'TemperatureMonitoring', label: 'رصد الحرارة', icon: TemperatureIcon, permission: hasPermission('haccp:view_temp_monitoring') },
                { id: 'PersonalHygiene', label: 'النظافة الشخصية', icon: ShieldCheckIcon, permission: hasPermission('prp:view') },
                { id: 'CleaningAndSanitation', label: 'التنظيف والتطهير', icon: ShieldCheckIcon, permission: hasPermission('prp:view') },
                { id: 'PestControl', label: 'مكافحة الآفات', icon: ShieldCheckIcon, permission: hasPermission('prp:view') },
                { id: 'Maintenance', label: 'المعدات والصيانة', icon: WrenchScrewdriverIcon, permission: hasPermission('maintenance:view') },
            ]
        },
        {
            title: 'الإدارة والمتابعة',
            items: [
                { id: 'Team', label: 'فريق العمل', icon: UsersIcon, permission: hasPermission('team:view') },
                { id: 'Tasks', label: 'المهام', icon: ClipboardListIcon, permission: hasPermission('task:view') },
                { id: 'Training', label: 'التدريب', icon: AcademicCapIcon, permission: hasPermission('training:view') },
                { id: 'ActivityLog', label: 'سجل النشاط', icon: ClockIcon, permission: true },
                { id: 'BeneficiaryInfo', label: 'بيانات المنشأة', icon: CogIcon, permission: true },
            ]
        }
    ];

    return (
        <aside className="w-64 bg-[var(--primary-light)] text-white flex flex-col flex-shrink-0">
            <div className="h-20 flex items-center justify-center border-b border-blue-900/50">
                <Logo />
            </div>
            <nav className="flex-1 px-4 py-6 overflow-y-auto">
                 {navGroups.map((group, index) => {
                    const visibleItems = group.items.filter(item => item.permission);
                    if (visibleItems.length === 0) return null;
                    return (
                        <div key={index} className="mb-4">
                            {group.title && <h3 className="px-4 text-xs font-semibold uppercase text-slate-400 mb-2">{group.title}</h3>}
                            <div className="space-y-1">
                                {visibleItems.map(item => <NavItem key={item.id} item={item} activePage={activePage} setActivePage={setActivePage} />)}
                            </div>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
};

export default KitchenSidebar;