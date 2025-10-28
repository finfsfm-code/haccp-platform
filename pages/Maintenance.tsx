import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Equipment, Task } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { PencilIcon } from '../components/icons/PencilIcon.tsx';
import { DocumentIcon } from '../components/icons/DocumentIcon.tsx';
import { InformationCircleIcon } from '../components/icons/InformationCircleIcon.tsx';
import MarkdownRenderer from '../components/MarkdownRenderer.tsx';

const emptyEquipment: Omit<Equipment, 'id' | 'maintenanceLog' | 'lastCleaned'> = {
    type: 'other',
    customType: '',
    name: '',
    manufacturer: '',
    manufactureDate: '',
    installationDate: new Date().toISOString().split('T')[0],
    maintenanceSchedule: 'monthly',
    responsiblePersonId: '',
    warrantyPeriod: '',
};

const equipmentTypes: Record<string, string> = {
    'oven': 'فرن', 'mixer': 'عجانة', 'refrigerator': 'ثلاجة', 'freezer': 'فريزر',
    'slicer': 'قطاعة لحوم', 'grinder': 'فرامة لحم', 'dishwasher': 'غسالة صحون',
    'ice_machine': 'صانعة ثلج', 'fryer': 'مقلاة عميقة', 'grill': 'شواية',
    'hot_holding': 'سخان طعام', 'cold_holding': 'حافظة طعام باردة',
    'packaging_machine': 'آلة تغليف', 'ventilation_hood': 'شفاط هواء',
    'dough_sheeter': 'فرادة عجين', 'proofing_cabinet': 'خزانة تخمير',
    'blast_chiller': 'مبرد سريع', 'water_filter': 'فلتر مياه',
    'hand_wash_station': 'محطة غسيل أيدي', 'grease_trap': 'مصيدة شحوم',
    'other': 'أخرى (تحديد يدوي)',
};

const scheduleMap: Record<string, string> = {
    daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري',
    quarterly: 'ربع سنوي', annually: 'سنوي', none: 'عند الحاجة',
};

const Maintenance: React.FC = () => {
    const { 
        equipment, addEquipment, updateEquipment, deleteEquipment, 
        team, tasks, showNotification, hasPermission 
    } = useAppContext();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSopModalOpen, setIsSopModalOpen] = useState(false);
    const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    const [currentEquipmentData, setCurrentEquipmentData] = useState<Omit<Equipment, 'id' | 'maintenanceLog' | 'lastCleaned'>>(emptyEquipment);
    const [modalContent, setModalContent] = useState({ title: '', content: '' });
    const [dailyCleaningLog, setDailyCleaningLog] = useState<Record<string, boolean>>({});

    const canManage = hasPermission('maintenance:manage');

    const maintenanceTasks = useMemo(() => tasks.filter(t => t.relatedEquipmentId), [tasks]);

    const handleOpenModal = (equip?: Equipment) => {
        if (equip) {
            setEditingEquipment(equip);
            setCurrentEquipmentData(equip);
        } else {
            setEditingEquipment(null);
            setCurrentEquipmentData(emptyEquipment);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = async () => {
        if (!currentEquipmentData.name || (currentEquipmentData.type === 'other' && !currentEquipmentData.customType)) {
            showNotification('يرجى إدخال اسم ونوع المعدة.', 'error');
            return;
        }

        if (editingEquipment) {
            await updateEquipment({ ...editingEquipment, ...currentEquipmentData });
            showNotification('تم تحديث المعدة بنجاح.', 'success');
        } else {
            await addEquipment(currentEquipmentData);
            showNotification('تمت إضافة المعدة بنجاح.', 'success');
        }
        handleCloseModal();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه المعدة؟ سيتم حذف مهام الصيانة المرتبطة بها.')) {
            await deleteEquipment(id);
        }
    };
    
    const handleViewSop = (equip: Equipment) => {
        setModalContent({ title: `إجراء التشغيل القياسي (SOP) لـ ${equip.name}`, content: equip.sopContent || 'جاري التوليد أو غير متوفر.' });
        setIsSopModalOpen(true);
    };

    const handleViewCleaning = (equip: Equipment) => {
        setModalContent({ title: `إرشادات النظافة لـ ${equip.name}`, content: equip.cleaningInstructions || 'جاري التوليد أو غير متوفر.' });
        setIsCleaningModalOpen(true);
    };
    
    const handleCleaningCheck = (id: string) => {
        setDailyCleaningLog(prev => ({ ...prev, [id]: !prev[id] }));
        // This is a mock update. A real app would persist this.
        showNotification('تم تحديث سجل النظافة.', 'success');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">إدارة المعدات والصيانة</h2>
                {canManage && (
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition">
                        <PlusIcon className="h-5 w-5" /> إضافة معدة جديدة
                    </button>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-slate-700 mb-4">قائمة المعدات والأجهزة</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full"><thead className="bg-slate-50"><tr>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">النوع</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">الاسم</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">الصيانة الدورية</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">المسؤول</th>
                        <th className="px-4 py-2"></th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-200">
                        {(equipment || []).map(e => <tr key={e.id}>
                            <td className="px-4 py-2 text-sm">{equipmentTypes[e.type] || e.customType}</td>
                            <td className="px-4 py-2 text-sm font-semibold">{e.name}</td>
                            <td className="px-4 py-2 text-sm">{scheduleMap[e.maintenanceSchedule]}</td>
                            <td className="px-4 py-2 text-sm">{team.find(t => t.id === e.responsiblePersonId)?.name}</td>
                            <td className="px-4 py-2"><div className="flex items-center justify-end gap-3">
                                <button onClick={() => handleViewSop(e)} title="عرض إجراءات التشغيل"><DocumentIcon className="h-5 w-5 text-slate-500 hover:text-blue-600"/></button>
                                {canManage && <button onClick={() => handleOpenModal(e)} title="تعديل"><PencilIcon className="h-5 w-5 text-slate-500 hover:text-yellow-600"/></button>}
                                {canManage && <button onClick={() => handleDelete(e.id)} title="حذف"><TrashIcon className="h-5 w-5 text-slate-500 hover:text-red-600"/></button>}
                            </div></td>
                        </tr>)}
                    </tbody></table>
                </div>
            </div>
            
             <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-slate-700 mb-4">متابعة النظافة والتطهير اليومي</h3>
                <div className="space-y-3">{(equipment || []).map(e => <div key={e.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={!!dailyCleaningLog[e.id]} onChange={() => handleCleaningCheck(e.id)} className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"/><span>{e.name}</span></label>
                    <button onClick={() => handleViewCleaning(e)} title="عرض إرشادات النظافة"><InformationCircleIcon className="h-6 w-6 text-slate-400 hover:text-blue-600"/></button>
                </div>)}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-slate-700 mb-4">مهام الصيانة المجدولة</h3>
                <div className="space-y-2">{(maintenanceTasks || []).map(task => <div key={task.id} className={`p-3 rounded border-l-4 ${task.status === 'done' ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}`}>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-xs text-slate-500">المسؤول: {team.find(t=>t.id === task.assignedTo)?.name} | تاريخ الاستحقاق: {task.dueDate}</p>
                </div>)}</div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEquipment ? "تعديل معدة" : "إضافة معدة جديدة"}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm">نوع الجهاز</label><select value={currentEquipmentData.type} onChange={e => setCurrentEquipmentData(s => ({...s, type: e.target.value}))} className="w-full mt-1 p-2 border rounded bg-white">{Object.entries(equipmentTypes).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
                        {currentEquipmentData.type === 'other' && <div><label className="text-sm">تحديد النوع</label><input type="text" value={currentEquipmentData.customType} onChange={e => setCurrentEquipmentData(s => ({...s, customType: e.target.value}))} className="w-full mt-1 p-2 border rounded"/></div>}
                    </div>
                    <div><label className="text-sm">الاسم التعريفي للمعدة</label><input type="text" value={currentEquipmentData.name} onChange={e => setCurrentEquipmentData(s => ({...s, name: e.target.value}))} className="w-full mt-1 p-2 border rounded"/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm">الشركة المصنعة</label><input type="text" value={currentEquipmentData.manufacturer} onChange={e => setCurrentEquipmentData(s => ({...s, manufacturer: e.target.value}))} className="w-full mt-1 p-2 border rounded"/></div>
                        <div><label className="text-sm">فترة الضمان</label><input type="text" value={currentEquipmentData.warrantyPeriod} onChange={e => setCurrentEquipmentData(s => ({...s, warrantyPeriod: e.target.value}))} className="w-full mt-1 p-2 border rounded"/></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm">تاريخ الصنع</label><input type="date" value={currentEquipmentData.manufactureDate} onChange={e => setCurrentEquipmentData(s => ({...s, manufactureDate: e.target.value}))} className="w-full mt-1 p-2 border rounded"/></div>
                        <div><label className="text-sm">تاريخ دخول الخدمة</label><input type="date" value={currentEquipmentData.installationDate} onChange={e => setCurrentEquipmentData(s => ({...s, installationDate: e.target.value}))} className="w-full mt-1 p-2 border rounded"/></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm">جدول الصيانة</label><select value={currentEquipmentData.maintenanceSchedule} onChange={e => setCurrentEquipmentData(s => ({...s, maintenanceSchedule: e.target.value as any}))} className="w-full mt-1 p-2 border rounded bg-white">{Object.entries(scheduleMap).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
                        <div><label className="text-sm">مسؤول الصيانة</label><select value={currentEquipmentData.responsiblePersonId} onChange={e => setCurrentEquipmentData(s => ({...s, responsiblePersonId: e.target.value}))} className="w-full mt-1 p-2 border rounded bg-white"><option value="">اختر مسؤول</option>{team.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">{editingEquipment ? 'حفظ التغييرات' : 'إضافة المعدة'}</button></div>
                </div>
            </Modal>

            <Modal isOpen={isSopModalOpen} onClose={() => setIsSopModalOpen(false)} title={modalContent.title}>
                <div className="prose prose-sm max-w-none"><MarkdownRenderer content={modalContent.content} /></div>
            </Modal>
             <Modal isOpen={isCleaningModalOpen} onClose={() => setIsCleaningModalOpen(false)} title={modalContent.title}>
                <div className="prose prose-sm max-w-none"><MarkdownRenderer content={modalContent.content} /></div>
            </Modal>
        </div>
    );
};

export default Maintenance;