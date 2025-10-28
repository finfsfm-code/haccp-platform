import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { User, BusinessType } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { PencilIcon } from '../components/icons/PencilIcon.tsx';
import { KeyIcon } from '../components/icons/KeyIcon.tsx';
import { ArrowRightOnRectangleIcon } from '../components/icons/ArrowRightOnRectangleIcon.tsx';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon.tsx';
import { XCircleIcon } from '../components/icons/XCircleIcon.tsx';
import { PrinterIcon } from '../components/icons/PrinterIcon.tsx';


const CompanyManagement: React.FC = () => {
    const { 
        getAllCompanyAdmins, 
        updateUserStatus, 
        deleteCompany,
        updateCompanyAdmin,
        resetUserPassword,
        impersonateUser,
        showNotification,
        setPrintableCompanyReportData,
        team,
        tasks,
        activityLogs,
    } = useAppContext();

    const [companies, setCompanies] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<User | null>(null);

    useEffect(() => {
        setCompanies(getAllCompanyAdmins());
    }, [getAllCompanyAdmins, team]); // Re-fetch if team changes, as context might update users array

    const handleOpenModal = (company: User) => {
        setEditingCompany({ ...company });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingCompany(null);
        setIsModalOpen(false);
    };

    const handleSave = async () => {
        if (editingCompany) {
            await updateCompanyAdmin(editingCompany);
            setCompanies(getAllCompanyAdmins()); // Refresh list
            showNotification('تم تحديث بيانات الشركة بنجاح.', 'success');
            handleCloseModal();
        }
    };
    
    const handleStatusToggle = async (user: User) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        await updateUserStatus(user.id, newStatus);
        setCompanies(getAllCompanyAdmins()); // Refresh list
        showNotification(`تم تغيير حالة الشركة إلى "${newStatus === 'active' ? 'نشط' : 'غير نشط'}"`, 'success');
    };
    
    const handleDelete = async (user: User) => {
        if (window.confirm(`هل أنت متأكد من حذف شركة "${user.companyName}" وجميع بياناتها؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
            await deleteCompany(user.id);
            setCompanies(getAllCompanyAdmins()); // Refresh list
            showNotification('تم حذف الشركة بنجاح.', 'success');
        }
    };

    const handleResetPassword = (user: User) => {
        if (window.confirm(`هل أنت متأكد من إعادة تعيين كلمة مرور مسؤول شركة "${user.companyName}"؟`)) {
            resetUserPassword(user.id);
        }
    };

    const handlePrintReport = (company: User) => {
        const companyTeam = team.filter(t => t.companyId === company.id);
        const companyTaskIds = companyTeam.map(t => t.id);
        const companyTasks = tasks.filter(t => companyTaskIds.includes(t.assignedTo));
        const companyActivity = activityLogs.filter(log => companyTaskIds.includes(log.userId) || log.userId === company.id);

        setPrintableCompanyReportData({
            company,
            team: companyTeam,
            tasks: companyTasks,
            activityLogs: companyActivity,
        });
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">إدارة الشركات</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">الشركة</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">نوع النشاط</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500">الحالة</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">تاريخ الانضمام</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {companies.map(comp => (
                            <tr key={comp.id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-900">{comp.companyName}</div>
                                    <div className="text-sm text-slate-600">{comp.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700">{comp.businessType}</td>
                                <td className="px-6 py-4 text-center">
                                    {/* FIX: Removed invalid 'title' prop from icon components. The parent button provides the tooltip. */}
                                    <button onClick={() => handleStatusToggle(comp)} title={comp.status === 'active' ? 'نشط' : 'غير نشط'}>
                                        {comp.status === 'active' 
                                            ? <CheckCircleIcon className="h-6 w-6 text-green-500"/>
                                            : <XCircleIcon className="h-6 w-6 text-red-500"/>
                                        }
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700">{new Date(comp.joined).toLocaleDateString('ar-SA')}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleOpenModal(comp)} title="تعديل"><PencilIcon className="h-5 w-5 text-slate-500 hover:text-blue-600"/></button>
                                        <button onClick={() => handleDelete(comp)} title="حذف"><TrashIcon className="h-5 w-5 text-slate-500 hover:text-red-600"/></button>
                                        <button onClick={() => handleResetPassword(comp)} title="إعادة تعيين كلمة مرور"><KeyIcon className="h-5 w-5 text-slate-500 hover:text-yellow-600"/></button>
                                        <button onClick={() => impersonateUser(comp.id)} title="الدخول كـ"><ArrowRightOnRectangleIcon className="h-5 w-5 text-slate-500 hover:text-emerald-600"/></button>
                                        <button onClick={() => handlePrintReport(comp)} title="طباعة تقرير"><PrinterIcon className="h-5 w-5 text-slate-500 hover:text-indigo-600"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {editingCompany && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`تعديل بيانات: ${editingCompany.companyName}`}>
                     <div className="space-y-4">
                        <input type="text" value={editingCompany.companyName} onChange={e => setEditingCompany({...editingCompany, companyName: e.target.value})} className="w-full p-2 border rounded" />
                        <input type="email" value={editingCompany.email} onChange={e => setEditingCompany({...editingCompany, email: e.target.value})} className="w-full p-2 border rounded" />
                        <select value={editingCompany.businessType} onChange={e => setEditingCompany({...editingCompany, businessType: e.target.value as BusinessType})} className="w-full p-2 border rounded bg-white">
                            <option value="factory">مصنع</option>
                            <option value="kitchen">مطبخ مركزي</option>
                            <option value="restaurant">مطعم</option>
                        </select>
                        <div className="flex justify-end pt-4">
                            <button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">حفظ التغييرات</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default CompanyManagement;