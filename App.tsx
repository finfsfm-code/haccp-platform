
import React, { useState } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from './context/AppContext.tsx';
import Sidebar from './components/Sidebar.tsx';
import KitchenSidebar from './components/KitchenSidebar.tsx';
import Header from './components/Header.tsx';
import Dashboard from './pages/Dashboard.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import AdminLogin from './pages/AdminLogin.tsx';
import Products from './pages/Products.tsx';
import Suppliers from './pages/Suppliers.tsx';
import Team from './pages/Team.tsx';
import Tasks from './pages/Tasks.tsx';
import BeneficiaryInfo from './pages/BeneficiaryInfo.tsx';
import HACCPPlan from './pages/HACCPPlan.tsx';
import ProcessFlow from './pages/ProcessFlow.tsx';
import CCPDetermination from './pages/haccp/CCPDetermination.tsx';
import CriticalLimits from './pages/haccp/CriticalLimits.tsx';
import Monitoring from './pages/haccp/Monitoring.tsx';
import CorrectiveActions from './pages/haccp/CorrectiveActions.tsx';
import Verification from './pages/haccp/Verification.tsx';
import RecordKeeping from './pages/haccp/RecordKeeping.tsx';
import PRPs from './pages/PRPs.tsx';
import Training from './pages/Training.tsx';
import ProductionOrders from './pages/ProductionOrders.tsx';
import SalesOrders from './pages/SalesOrders.tsx';
import Inventory from './pages/Inventory.tsx';
import Traceability from './pages/Traceability.tsx';
import RecallManagement from './pages/RecallManagement.tsx';
import MockRecall from './pages/MockRecall.tsx';
import TemperatureMonitoring from './pages/TemperatureMonitoring.tsx';
import WaterHACCP from './pages/WaterHACCP.tsx';
import ActivityLog from './pages/ActivityLog.tsx';
// FIX: Added .tsx extension to resolve module.
import Maintenance from './pages/Maintenance.tsx';
import SystemVerification from './pages/SystemVerification.tsx';
import CompanyManagement from './pages/CompanyManagement.tsx';
import RegistrationRequests from './pages/RegistrationRequests.tsx';
import SupportTickets from './pages/SupportTickets.tsx';
import PlatformSettings from './pages/PlatformSettings.tsx';
import PrintableHACCPPlan from './pages/PrintableHACCPPlan.tsx';
import PrintableProcessFlow from './pages/PrintableProcessFlow.tsx';
import PrintableMockRecallReport from './pages/PrintableMockRecallReport.tsx';
import PrintableRecallPlan from './pages/PrintableRecallPlan.tsx';
import PrintableCompanyReport from './pages/PrintableCompanyReport.tsx';
import PrintableWaterHACCP from './pages/PrintableWaterHACCP.tsx';
// FIX: Added .ts extension to resolve module.
import { User } from './types.ts';
import PRPPage from './pages/prps/PRPPage.tsx';

const App: React.FC = () => {
    const { currentUser, activePage, getCompanyBusinessType, printablePlanProductId, printableProcessFlowProductId, printableMockRecall, printableRecallPlanBatchNumber, printableCompanyReportData, printableWaterHACCP } = useAppContext();
    const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'admin-login'>('login');

    if (printablePlanProductId) return <PrintableHACCPPlan />;
    if (printableProcessFlowProductId) return <PrintableProcessFlow />;
    if (printableMockRecall) return <PrintableMockRecallReport />;
    if (printableRecallPlanBatchNumber) return <PrintableRecallPlan />;
    if (printableCompanyReportData) return <PrintableCompanyReport />;
    if (printableWaterHACCP) return <PrintableWaterHACCP />;

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                {authScreen === 'login' && <Login onNavigateToRegister={() => setAuthScreen('register')} onNavigateToAdminLogin={() => setAuthScreen('admin-login')} />}
                {authScreen === 'register' && <Register onNavigateToLogin={() => setAuthScreen('login')} onRegisterSuccess={(user: User) => { console.log('Registered', user); setAuthScreen('login'); }} />}
                {authScreen === 'admin-login' && <AdminLogin onNavigateToCompanyLogin={() => setAuthScreen('login')} />}
            </div>
        );
    }
    
    const isKitchen = getCompanyBusinessType() === 'kitchen' || getCompanyBusinessType() === 'restaurant';

    const renderPage = () => {
        if (currentUser.role === 'PLATFORM_ADMIN') {
            switch (activePage) {
                case 'Dashboard': return <AdminDashboard />;
                case 'CompanyManagement': return <CompanyManagement />;
                case 'RegistrationRequests': return <RegistrationRequests />;
                case 'SupportTickets': return <SupportTickets />;
                case 'PlatformSettings': return <PlatformSettings />;
                default: return <AdminDashboard />;
            }
        }

        switch (activePage) {
            case 'Dashboard': return <Dashboard />;
            case 'Products': return <Products />;
            case 'Suppliers': return <Suppliers />;
            case 'Team': return <Team />;
            case 'Tasks': return <Tasks />;
            case 'BeneficiaryInfo': return <BeneficiaryInfo />;
            case 'HACCPPlan': return <HACCPPlan />;
            case 'ProcessFlow': return <ProcessFlow />;
            case 'CCPDetermination': return <CCPDetermination />;
            case 'CriticalLimits': return <CriticalLimits />;
            case 'Monitoring': return <Monitoring />;
            case 'CorrectiveActions': return <CorrectiveActions />;
            case 'Verification': return <Verification />;
            case 'RecordKeeping': return <RecordKeeping />;
            case 'PRPs': return <PRPs />;
            case 'Training': return <Training />;
            case 'ProductionOrders': return <ProductionOrders />;
            case 'SalesOrders': return <SalesOrders />;
            case 'Inventory': return <Inventory />;
            case 'Traceability': return <Traceability />;
            case 'RecallManagement': return <RecallManagement />;
            case 'MockRecall': return <MockRecall />;
            case 'TemperatureMonitoring': return <TemperatureMonitoring />;
            case 'WaterHACCP': return <WaterHACCP />;
            case 'ActivityLog': return <ActivityLog />;
            case 'Maintenance': return <Maintenance />;
            case 'SystemVerification': return <SystemVerification />;
            case 'PersonalHygiene': return <PRPPage prpKey="personalHygiene" />;
            case 'CleaningAndSanitation': return <PRPPage prpKey="cleaningAndSanitation" />;
            case 'PestControl': return <PRPPage prpKey="pestControl" />;
            case 'SupplierControl': return <PRPPage prpKey="supplierControl" />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100" dir="rtl">
            {isKitchen ? <KitchenSidebar /> : <Sidebar />}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-8">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;