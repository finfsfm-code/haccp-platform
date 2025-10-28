import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { RecallProcess, Task, TeamMember } from '../types';
import Modal from '../components/Modal';
import { MegaphoneIcon } from '../components/icons/MegaphoneIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { ClipboardCheckIcon } from '../components/icons/ClipboardCheckIcon';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PrinterIcon } from '../components/icons/PrinterIcon';

const RecallManagement: React.FC = () => {
    const { recallProcesses, team, updateRecallProcess, showNotification, setPrintableRecallPlanBatchNumber } = useAppContext();
    const [selectedRecall, setSelectedRecall] = useState<RecallProcess | null>(null);
    const [activeTab, setActiveTab] = useState<'team' | 'customers' | 'tasks' | 'summary'>('team');
    
    const [newTask, setNewTask] = useState({ title: '', type: 'processing' as 'processing' | 'disposal' });

    const handleOpenModal = (recall: RecallProcess) => {
        setSelectedRecall(JSON.parse(JSON.stringify(recall))); // Deep copy
        setActiveTab('team');
    };

    const handleCloseModal = () => {
        // Before closing, save any changes made
        if (selectedRecall) {
            updateRecallProcess(selectedRecall);
        }
        setSelectedRecall(null);
    };

    const handleUpdateSelectedRecall = (updatedRecall: RecallProcess) => {
        setSelectedRecall(updatedRecall);
        updateRecallProcess(updatedRecall); // Persist changes immediately
    };
    
    // TEAM MANAGEMENT
    const handleAddTeamMember = (memberId: string) => {
        if (!selectedRecall || selectedRecall.team.some(tm => tm.memberId === memberId)) return;
        const newMember = { memberId, role: 'عضو فريق' };
        handleUpdateSelectedRecall({ ...selectedRecall, team: [...selectedRecall.team, newMember] });
    };

    const handleRemoveTeamMember = (memberId: string) => {
        if (!selectedRecall) return;
        handleUpdateSelectedRecall({ ...selectedRecall, team: selectedRecall.team.filter(tm => tm.memberId !== memberId) });
    };
    
    const handleRoleChange = (memberId: string, role: string) => {
        if (!selectedRecall) return;
        handleUpdateSelectedRecall({ ...selectedRecall, team: selectedRecall.team.map(tm => tm.memberId === memberId ? { ...tm, role } : tm) });
    };

    // CUSTOMER MANAGEMENT
    const handleCustomerUpdate = (customerId: string, field: string, value: any) => {
         if (!selectedRecall) return;
         const updatedCustomers = selectedRecall.affectedCustomers.map(c => 
            c.customerId === customerId ? { ...c, [field]: value } : c
         );
         handleUpdateSelectedRecall({ ...selectedRecall, affectedCustomers: updatedCustomers });
    };
    
    // TASK MANAGEMENT
    const handleAddTask = () => {
        if (!selectedRecall || !newTask.title.trim()) return;
        const taskToAdd: Task = {
            id: Date.now().toString(),
            title: newTask.title,
            description: '',
            assignedTo: '',
            status: 'todo',
            progress: 0,
            comments: [],
        };
        const updatedRecall = { ...selectedRecall };
        if(newTask.type === 'processing') {
            updatedRecall.processingTasks.push(taskToAdd);
        } else {
            updatedRecall.disposalTasks.push(taskToAdd);
        }
        handleUpdateSelectedRecall(updatedRecall);
        setNewTask({ title: '', type: 'processing' });
    };

    const handleUpdateTask = (taskId: string, type: 'processing' | 'disposal', field: keyof Task, value: any) => {
        if (!selectedRecall) return;
        const updatedRecall = { ...selectedRecall };
        const taskList = type === 'processing' ? updatedRecall.processingTasks : updatedRecall.disposalTasks;
        const updatedList = taskList.map(t => t.id === taskId ? { ...t, [field]: value } : t);
        if(type === 'processing') {
            updatedRecall.processingTasks = updatedList;
        } else {
            updatedRecall.disposalTasks = updatedList;
        }
        handleUpdateSelectedRecall(updatedRecall);
    };
    
    const renderModalContent = () => {
        if (!selectedRecall) return null;
        
        const recallTeamMembers = selectedRecall.team.map(rt => team.find(t => t.id === rt.memberId)).filter(Boolean) as TeamMember[];
        const availableTeam = team.filter(t => !selectedRecall.team.some(rt => rt.memberId === t.id));

        return (
            <div>
                <div className="border-b border-slate-200 mb-4">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('team')} className={`${activeTab === 'team' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'} flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}><UsersIcon className="h-5 w-5" /> فريق العمل</button>
                        <button onClick={() => setActiveTab('customers')} className={`${activeTab === 'customers' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'} flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}><UsersIcon className="h-5 w-5" /> العملاء</button>
                        <button onClick={() => setActiveTab('tasks')} className={`${activeTab === 'tasks' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'} flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}><ClipboardCheckIcon className="h-5 w-5" /> المهام</button>
                        <button onClick={() => setActiveTab('summary')} className={`${activeTab === 'summary' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'} flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}><DocumentTextIcon className="h-5 w-5" /> ملخص</button>
                    </nav>
                </div>
                <div className="py-4">
                    {activeTab === 'team' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><h4 className="font-semibold mb-2">أعضاء فريقك</h4>{availableTeam.map(t => <div key={t.id} className="flex justify-between items-center bg-slate-100 p-2 rounded mb-2"><span>{t.name}</span><button onClick={() => handleAddTeamMember(t.id)} className="text-emerald-600">+</button></div>)}</div>
                            <div><h4 className="font-semibold mb-2">فريق الاستدعاء</h4>{selectedRecall.team.map(m => <div key={m.memberId} className="flex gap-2 items-center bg-white p-2 border rounded mb-2"><button onClick={() => handleRemoveTeamMember(m.memberId)} className="text-red-500"><TrashIcon className="h-4 w-4"/></button><div><p className="font-bold text-sm">{team.find(t=>t.id===m.memberId)?.name}</p><input type="text" value={m.role} onChange={e => handleRoleChange(m.memberId, e.target.value)} placeholder="الدور" className="w-full p-1 text-xs border rounded"/></div></div>)}</div>
                        </div>
                    )}
                    {activeTab === 'customers' && (
                       <div className="max-h-96 overflow-y-auto space-y-2 pr-2">{selectedRecall.affectedCustomers.map(c => <div key={c.customerId} className="bg-slate-50 p-3 rounded-lg border">
                           <p className="font-bold">{c.customerName}</p>
                           <div className="grid grid-cols-3 gap-3 mt-2 text-sm items-center">
                               <label className="flex items-center gap-2"><input type="checkbox" checked={c.notified} onChange={e => handleCustomerUpdate(c.customerId, 'notified', e.target.checked)} /> تم الإبلاغ</label>
                               <select value={c.actionTaken} onChange={e => handleCustomerUpdate(c.customerId, 'actionTaken', e.target.value)} className="p-1 border rounded bg-white"><option value="pending">قيد الانتظار</option><option value="isolated">تم العزل</option><option value="disposed">تم الإتلاف</option><option value="returned">تم الإرجاع</option></select>
                               <input type="number" value={c.quantityRestored} onChange={e => handleCustomerUpdate(c.customerId, 'quantityRestored', Number(e.target.value))} className="p-1 border rounded" placeholder="الكمية المستعادة"/>
                           </div>
                       </div>)}</div>
                    )}
                     {activeTab === 'tasks' && (
                        <div>
                             <div className="flex gap-2 mb-4"><input type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="مهمة جديدة..." className="flex-grow p-2 border rounded"/><select value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value as any})} className="p-2 border rounded bg-white"><option value="processing">معالجة</option><option value="disposal">إتلاف</option></select><button onClick={handleAddTask} className="bg-emerald-600 text-white px-3 rounded">إضافة</button></div>
                             <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><h4 className="font-semibold">مهام المعالجة</h4>{selectedRecall.processingTasks.map(t => <div key={t.id} className="p-2 border rounded bg-white"><p>{t.title}</p><select value={t.assignedTo} onChange={e => handleUpdateTask(t.id, 'processing', 'assignedTo', e.target.value)} className="w-full mt-1 p-1 text-xs border rounded bg-slate-50"><option value="">إسناد إلى...</option>{recallTeamMembers.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}</select><select value={t.status} onChange={e => handleUpdateTask(t.id, 'processing', 'status', e.target.value)} className="w-full mt-1 p-1 text-xs border rounded bg-slate-50"><option value="todo">جديدة</option><option value="inprogress">قيد التنفيذ</option><option value="done">مكتملة</option></select></div>)}</div><div className="space-y-2"><h4 className="font-semibold">مهام الإتلاف</h4>{selectedRecall.disposalTasks.map(t => <div key={t.id} className="p-2 border rounded bg-white"><p>{t.title}</p><select value={t.assignedTo} onChange={e => handleUpdateTask(t.id, 'disposal', 'assignedTo', e.target.value)} className="w-full mt-1 p-1 text-xs border rounded bg-slate-50"><option value="">إسناد إلى...</option>{recallTeamMembers.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}</select><select value={t.status} onChange={e => handleUpdateTask(t.id, 'disposal', 'status', e.target.value)} className="w-full mt-1 p-1 text-xs border rounded bg-slate-50"><option value="todo">جديدة</option><option value="inprogress">قيد التنفيذ</option><option value="done">مكتملة</option></select></div>)}</div></div>
                        </div>
                    )}
                    {activeTab === 'summary' && (
                        <div>
                            <button onClick={() => { handleUpdateSelectedRecall({...selectedRecall, status: 'completed'}); showNotification('اكتملت عملية الاستدعاء بنجاح.', 'success'); handleCloseModal(); }} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">إغلاق و إكمال عملية الاستدعاء</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">إدارة عمليات الاستدعاء</h2>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
                {recallProcesses.length === 0 ? <p className="text-slate-500 text-center">لا توجد عمليات استدعاء حالية أو سابقة.</p> : (
                    <div className="space-y-4">
                        {recallProcesses.map(recall => (
                            <div key={recall.id} className="p-4 border rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">تشغيلة: <span className="font-mono">{recall.batchNumber}</span></h3>
                                    <p className="text-sm text-slate-600">{recall.reason}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${recall.status === 'active' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-green-100 text-green-800'}`}>
                                        {recall.status === 'active' ? 'نشط' : 'مكتمل'}
                                    </span>
                                    {recall.status === 'active' && (
                                        <button onClick={() => handleOpenModal(recall)} className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">إدارة</button>
                                    )}
                                    {recall.status === 'completed' && (
                                        <button 
                                            onClick={() => setPrintableRecallPlanBatchNumber(recall.batchNumber)}
                                            className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-2 hover:bg-gray-700"
                                        >
                                            <PrinterIcon className="h-4 w-4"/>
                                            طباعة التقرير
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={!!selectedRecall} onClose={handleCloseModal} title={`إدارة استدعاء التشغيلة: ${selectedRecall?.batchNumber}`}>
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default RecallManagement;