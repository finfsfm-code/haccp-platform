

import React, { useState } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';
// FIX: Added .ts extension to resolve module.
import { TeamMember, Permission, PERMISSION_GROUPS } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { PencilIcon } from '../components/icons/PencilIcon.tsx';
import { KeyIcon } from '../components/icons/KeyIcon.tsx';

// FIX: Added missing properties to the emptyMember object to fully satisfy the TeamMember type definition.
const emptyMember: Omit<TeamMember, 'id'> = { 
    name: '', 
    email: '',
    password: '',
    companyId: '', 
    companyName: '',
    role: 'TEAM_MEMBER',
    joined: '',
    position: '',
    haccpRole: '',
    responsibilities: '',
    status: 'pending',
    // FIX: Add businessType property to satisfy the TeamMember type which extends User.
    businessType: 'factory',
    permissions: []
};

const Team: React.FC = () => {
    const { team, addTeamMember, updateTeamMember, deleteTeamMember, showNotification, resetTeamMemberPassword, hasPermission } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | Omit<TeamMember, 'id'>>(emptyMember);
    const [isEditMode, setIsEditMode] = useState(false);
    
    const inputStyles = "w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500";


    const handleOpenModal = (memberToEdit?: TeamMember) => {
        if (memberToEdit) {
            setEditingMember({ ...JSON.parse(JSON.stringify(memberToEdit)), password: '' }); // Deep copy and clear password
            setIsEditMode(true);
        } else {
            setEditingMember(emptyMember);
            setIsEditMode(false);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMember(emptyMember);
        setIsEditMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditingMember(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionChange = (permission: Permission, isChecked: boolean) => {
        setEditingMember(prev => {
            const currentPermissions = prev.permissions || [];
            if (isChecked) {
                // Add permission if it doesn't exist
                return { ...prev, permissions: [...new Set([...currentPermissions, permission])] };
            } else {
                // Remove permission
                return { ...prev, permissions: currentPermissions.filter(p => p !== permission) };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember.name || !editingMember.email) {
            showNotification('يرجى تعبئة اسم العضو وبريده الإلكتروني.', 'error');
            return;
        }

        if (isEditMode) {
            await updateTeamMember(editingMember as TeamMember);
            showNotification('تم تحديث بيانات العضو بنجاح.', 'success');
        } else {
            // Can't pass the full TeamMember object to addTeamMember
            const { id, companyId, companyName, role, joined, status, businessType, ...newMemberData } = editingMember as TeamMember;
            await addTeamMember(newMemberData);
            showNotification('تمت دعوة العضو بنجاح.', 'success');
        }
        handleCloseModal();
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">إدارة فريق العمل</h2>
                {hasPermission('team:invite') && (
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition">
                        <PlusIcon className="h-5 w-5" />
                        دعوة عضو جديد
                    </button>
                )}
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
                 {team.length === 0 ? <p className="text-slate-500 text-center">لم تتم إضافة أي أعضاء للفريق بعد.</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                             <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الاسم</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">المنصب الوظيفي</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">دوره في الهاسب</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">الحالة</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {team.map(member => (
                                    <tr key={member.id}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900">{member.name}</div>
                                            <div className="text-sm text-slate-600">{member.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{member.position}</td>
                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {member.haccpRole}
                                            <span className="block text-xs text-slate-500">لديه {member.permissions.length} صلاحية</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {member.status === 'active' ? 'نشط' : 'معلق'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {hasPermission('team:assign_permissions') && <button onClick={() => resetTeamMemberPassword(member.id)} className="text-slate-500 hover:text-yellow-600" title="إعادة تعيين كلمة المرور"><KeyIcon className="h-5 w-5"/></button>}
                                                {hasPermission('team:edit') && <button onClick={() => handleOpenModal(member)} className="text-slate-500 hover:text-blue-600" title="تعديل"><PencilIcon className="h-5 w-5"/></button>}
                                                {hasPermission('team:delete') && <button onClick={() => deleteTeamMember(member.id)} className="text-slate-500 hover:text-red-600" title="حذف"><TrashIcon className="h-5 w-5"/></button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "تعديل بيانات عضو" : "دعوة عضو جديد"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" type="text" placeholder="الاسم الكامل" value={editingMember.name} onChange={handleChange} className={inputStyles} required />
                        <input name="email" type="email" placeholder="البريد الإلكتروني" value={editingMember.email} onChange={handleChange} className={inputStyles} required />
                    </div>
                    {!isEditMode && <input name="password" type="password" placeholder="كلمة المرور الأولية" value={editingMember.password || ''} onChange={handleChange} className={inputStyles} required />}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="position" type="text" placeholder="المنصب الوظيفي" value={editingMember.position} onChange={handleChange} className={inputStyles} />
                        <input name="haccpRole" type="text" placeholder="دوره في فريق الهاسب" value={editingMember.haccpRole} onChange={handleChange} className={inputStyles} />
                    </div>
                    <textarea name="responsibilities" placeholder="المسؤوليات الرئيسية" value={editingMember.responsibilities} onChange={handleChange} className={inputStyles} rows={3}></textarea>
                    
                    {hasPermission('team:assign_permissions') && (
                        <fieldset className="p-4 border-t-2 border-emerald-500">
                            <legend className="px-2 font-bold text-lg">صلاحيات النظام</legend>
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mt-2">
                                {/* FIX: Correctly type `group` to resolve 'unknown' type error */}
                                {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]: [string, { label: string; permissions: Partial<Record<Permission, string>> }]) => (
                                    <div key={groupKey}>
                                        <h4 className="font-semibold text-base mt-2 mb-2 text-slate-700">{group.label}</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4">
                                            {Object.entries(group.permissions).map(([perm, permLabel]) => (
                                                <label key={perm} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                        checked={editingMember.permissions.includes(perm as Permission)}
                                                        onChange={(e) => handlePermissionChange(perm as Permission, e.target.checked)}
                                                    />
                                                    {permLabel}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    )}
                    
                    <div className="flex justify-end pt-4 border-t">
                        <button type="submit" className="bg-emerald-600 text-white px-5 py-2.5 rounded-md hover:bg-emerald-700">{isEditMode ? 'حفظ التغييرات' : 'إرسال الدعوة'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Team;