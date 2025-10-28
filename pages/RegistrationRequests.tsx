import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { User } from '../types.ts';

const RegistrationRequests: React.FC = () => {
    const { getPendingCompanies, approveRegistration, rejectRegistration } = useAppContext();
    const [requests, setRequests] = useState<User[]>([]);

    // Re-fetch requests whenever the core user list might change in the context
    useEffect(() => {
        setRequests(getPendingCompanies());
    }, [getPendingCompanies, approveRegistration, rejectRegistration]);

    const handleApprove = async (userId: string) => {
        await approveRegistration(userId);
        // The component will re-render due to context update
    };

    const handleReject = async (userId: string) => {
        if (window.confirm('هل أنت متأكد من رفض وحذف هذا الطلب؟')) {
            await rejectRegistration(userId);
            // The component will re-render due to context update
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">طلبات التسجيل الجديدة</h2>
            {requests.length === 0 ? (
                <p className="text-slate-500 text-center py-8">لا توجد طلبات تسجيل جديدة في الوقت الحالي.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">اسم الشركة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">البريد الإلكتروني</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">تاريخ الطلب</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {requests.map(req => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{req.companyName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{req.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{new Date(req.joined).toLocaleDateString('ar-SA')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleApprove(req.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">موافقة</button>
                                            <button onClick={() => handleReject(req.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700">رفض</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RegistrationRequests;
