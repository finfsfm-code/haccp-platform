import React from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { ClockIcon } from '../components/icons/ClockIcon.tsx';
import { PrinterIcon } from '../components/icons/PrinterIcon.tsx';
import { User, TeamMember } from '../types.ts';

const ActivityLog: React.FC = () => {
    const { activityLogs, team, currentUser, users } = useAppContext();

    // Sort logs descending by time
    const sortedLogs = [...activityLogs].reverse();

    return (
        <div className="printable-content">
             <style>
                {`
                @media print {
                    .no-print { display: none; }
                    body { background-color: white !important; }
                    .printable-content { margin: 0; padding: 0; box-shadow: none; border: none; }
                }
                `}
            </style>
            <div className="no-print flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">سجل نشاط الشركة</h2>
                <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    <PrinterIcon className="h-5 w-5" />
                    طباعة السجل
                </button>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg border border-slate-200">
                <header className="text-center mb-8 border-b pb-6 border-slate-200 print:block hidden">
                     <h1 className="text-3xl font-bold text-slate-900 mt-4">سجل نشاط الشركة</h1>
                     <p className="text-slate-500 mt-2 text-sm">
                        الشركة: {currentUser?.companyName}
                    </p>
                    <p className="text-slate-500 mt-2 text-sm">
                        تم إنشاء التقرير بتاريخ: {new Date().toLocaleString('ar-SA', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                </header>

                <div className="space-y-6">
                    {sortedLogs.map(log => {
                        const user = team.find(t => t.id === log.userId) || users.find(u => u.id === log.userId);
                        return (
                             <div key={log.id} className="flex items-start gap-4">
                                <div className="bg-slate-100 rounded-full p-2 mt-1">
                                    <ClockIcon className="h-5 w-5 text-slate-500" />
                                </div>
                                <div className="flex-grow">
                                    <p className="font-medium text-slate-800">{log.action}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <span>بواسطة: {user?.role === 'TEAM_MEMBER' ? (user as TeamMember).name : user?.companyName}</span>
                                        <span>|</span>
                                        <span>{new Date(log.timestamp).toLocaleString('ar-SA')}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                     {sortedLogs.length === 0 && (
                        <p className="text-center text-slate-500 py-10">لا توجد أنشطة مسجلة بعد.</p>
                     )}
                </div>
            </div>
        </div>
    );
};

export default ActivityLog;