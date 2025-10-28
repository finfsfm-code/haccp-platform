
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { PrinterIcon } from '../components/icons/PrinterIcon';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon';
import { ActivityLog, Task, TeamMember } from '../types';

const PrintableCompanyReport: React.FC = () => {
    const { printableCompanyReportData, setPrintableCompanyReportData } = useAppContext();

    if (!printableCompanyReportData) {
        return (
            <div className="p-8">
                <p>لا يوجد تقرير لعرضه.</p>
                <button onClick={() => setPrintableCompanyReportData(null)} className="mt-4 bg-slate-500 text-white px-4 py-2 rounded">العودة</button>
            </div>
        );
    }
    
    const { company, team, tasks, activityLogs } = printableCompanyReportData;

    const renderSection = (title: string, children: React.ReactNode) => (
        <div className="mb-8 page-break">
            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-emerald-500 pb-2 mb-4">{title}</h2>
            {children}
        </div>
    );

    const statusMap: { [key in Task['status']]: { text: string; className: string } } = {
        todo: { text: 'جديدة', className: 'bg-blue-100 text-blue-800' },
        inprogress: { text: 'قيد التنفيذ', className: 'bg-orange-100 text-orange-800' },
        done: { text: 'مكتملة', className: 'bg-green-100 text-green-800' },
    };
    
    return (
        <div className="bg-slate-100 min-h-screen">
            <style>
                {`
                @media print {
                    .no-print { display: none; }
                    body, .printable-area { margin: 0; padding: 0; font-size: 10pt; }
                    .page-break { page-break-inside: avoid; }
                    h1 { font-size: 24pt; }
                    h2 { font-size: 16pt; }
                    h3 { font-size: 12pt; }
                }
                `}
            </style>
            <div className="no-print p-4 bg-white shadow-md flex justify-between items-center">
                <h1 className="text-lg font-semibold">تقرير الشركة</h1>
                <div className="flex gap-4">
                     <button onClick={() => setPrintableCompanyReportData(null)} className="flex items-center gap-2 bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600">
                        <ArrowRightIcon className="h-5 w-5"/>
                        العودة
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
                        <PrinterIcon className="h-5 w-5"/>
                        طباعة التقرير
                    </button>
                </div>
            </div>
            <div className="printable-area p-8 max-w-4xl mx-auto bg-white my-8 shadow-lg">
                <header className="text-center mb-10 border-b pb-6">
                    <h1 className="text-4xl font-bold text-slate-900">تقرير نشاط الشركة</h1>
                    <p className="text-slate-600 mt-2 text-lg">الشركة: <span className="font-bold">{company.companyName}</span></p>
                    <p className="text-slate-500 text-sm">تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
                </header>

                {renderSection('1. فريق العمل', (
                     <table className="w-full text-sm text-left border-collapse border border-slate-300">
                        <thead className="bg-slate-100"><tr className="border-b border-slate-300">
                            <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">الاسم</th>
                            <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">البريد</th>
                            <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">الوظيفة</th>
                            <th className="p-2 font-semibold text-slate-700">دوره بالهاسب</th>
                        </tr></thead>
                        <tbody>
                        {team.map(member => (
                            <tr key={member.id} className="border-b border-slate-200">
                                <td className="p-2 border-r border-slate-300 text-slate-800">{member.name}</td>
                                <td className="p-2 border-r border-slate-300 text-slate-800">{member.email}</td>
                                <td className="p-2 border-r border-slate-300 text-slate-800">{member.position}</td>
                                <td className="p-2 text-slate-800">{member.haccpRole}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ))}
                
                {renderSection('2. أحدث المهام', (
                     <table className="w-full text-sm text-left border-collapse border border-slate-300">
                        <thead className="bg-slate-100"><tr className="border-b border-slate-300">
                            <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">المهمة</th>
                            <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">المسؤول</th>
                            <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">الحالة</th>
                            <th className="p-2 font-semibold text-slate-700">الإنجاز</th>
                        </tr></thead>
                        <tbody>
                        {[...tasks].reverse().slice(0, 10).map(task => {
                            const member = team.find(t => t.id === task.assignedTo);
                            return (
                                <tr key={task.id} className="border-b border-slate-200">
                                    <td className="p-2 border-r border-slate-300 text-slate-800">{task.title}</td>
                                    <td className="p-2 border-r border-slate-300 text-slate-800">{member?.name || 'غير محدد'}</td>
                                    <td className="p-2 border-r border-slate-300 text-slate-800">{statusMap[task.status].text}</td>
                                    <td className="p-2 text-slate-800">{task.progress}%</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                ))}

                {renderSection('3. سجل النشاط الكامل', (
                     <table className="w-full text-sm text-left border-collapse border border-slate-300">
                        <thead className="bg-slate-100"><tr className="border-b border-slate-300">
                            <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">الإجراء</th>
                            <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">المستخدم</th>
                            <th className="p-2 font-semibold text-slate-700">التاريخ والوقت</th>
                        </tr></thead>
                        <tbody>
                        {[...activityLogs].reverse().map(log => (
                            <tr key={log.id} className="border-b border-slate-200">
                                <td className="p-2 border-r border-slate-300 text-slate-800">{log.action}</td>
                                <td className="p-2 border-r border-slate-300 text-slate-800">{log.userName}</td>
                                <td className="p-2 text-slate-800">{new Date(log.timestamp).toLocaleString('ar-SA')}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ))}
            </div>
        </div>
    );
};

export default PrintableCompanyReport;
