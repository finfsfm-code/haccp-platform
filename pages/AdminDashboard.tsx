

import React, { useEffect, useRef } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';
import Chart from 'chart.js/auto';

const AdminDashboard: React.FC = () => {
    const { adminDashboardData, getAllCompanyAdmins, getPendingCompanies } = useAppContext();
    const regionChartRef = useRef<HTMLCanvasElement>(null);
    const industryChartRef = useRef<HTMLCanvasElement>(null);
    const regionChartInstance = useRef<Chart | null>(null);
    const industryChartInstance = useRef<Chart | null>(null);

    const totalCompanies = getAllCompanyAdmins().length;
    const pendingCompanies = getPendingCompanies().length;

    useEffect(() => {
        const createChart = (
            ref: React.RefObject<HTMLCanvasElement>, 
            instanceRef: React.MutableRefObject<Chart | null>,
            type: 'pie' | 'doughnut',
            data: { [key: string]: number },
            label: string
        ) => {
            if (ref.current) {
                if (instanceRef.current) {
                    instanceRef.current.destroy();
                }
                const ctx = ref.current.getContext('2d');
                if (ctx) {
                    const labels = Object.keys(data);
                    const values = Object.values(data);
                    instanceRef.current = new Chart(ctx, {
                        type: type,
                        data: {
                            labels: labels,
                            datasets: [{
                                label: label,
                                data: values,
                                backgroundColor: [
                                    '#10b981', '#f97316', '#3b82f6', '#ef4444', '#8b5cf6', '#64748b'
                                ],
                                hoverOffset: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: { legend: { position: 'bottom' } }
                        }
                    });
                }
            }
        };

        createChart(regionChartRef, regionChartInstance, 'pie', adminDashboardData.usersByRegion, 'توزيع الشركات حسب المنطقة');
        createChart(industryChartRef, industryChartInstance, 'doughnut', adminDashboardData.usersByIndustry, 'توزيع الشركات حسب الصناعة');

        return () => {
            if (regionChartInstance.current) regionChartInstance.current.destroy();
            if (industryChartInstance.current) industryChartInstance.current.destroy();
        };
    }, [adminDashboardData]);

    const stats = [
        { name: 'إجمالي الشركات', value: totalCompanies, icon: '🏢' },
        { name: 'طلبات تسجيل جديدة', value: pendingCompanies, icon: '⏳' },
        { name: 'حسابات نشطة', value: adminDashboardData.accountStatus.active, icon: '✅' },
        { name: 'حسابات معلقة', value: adminDashboardData.accountStatus.inactive, icon: '⏸️' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-8">لوحة المراقبة العامة للمنصة</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map(stat => (
                    <div key={stat.name} className="bg-white p-6 rounded-lg shadow-md flex items-center">
                        <div className="text-4xl ms-4">{stat.icon}</div>
                        <div>
                            <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
                            <div className="text-slate-500">{stat.name}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">توزيع الشركات حسب المنطقة</h3>
                    <div className="h-80 flex justify-center items-center">
                         <canvas ref={regionChartRef}></canvas>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">توزيع الشركات حسب الصناعة</h3>
                    <div className="h-80 flex justify-center items-center">
                        <canvas ref={industryChartRef}></canvas>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;