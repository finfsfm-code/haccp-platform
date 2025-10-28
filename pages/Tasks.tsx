

import React, { useState } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';
import Modal from '../components/Modal.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import KanbanColumn from '../components/KanbanColumn.tsx';
// FIX: Added .ts extension to resolve module.
import { Task } from '../types.ts';

const Tasks: React.FC = () => {
    const { team, tasks, addTask, updateTask, addTaskComment, currentUser, showNotification, hasPermission } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [newComment, setNewComment] = useState('');
    const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'progress' | 'comments'>>({ title: '', assignedTo: '', description: '', status: 'todo' });

    const handleSaveTask = async () => {
        if (!newTask.title || !newTask.assignedTo) {
            showNotification('يرجى تعبئة عنوان المهمة وتحديد المسؤول.', 'error');
            return;
        }
        await addTask(newTask);
        showNotification('تمت إضافة المهمة بنجاح.', 'success');
        setNewTask({ title: '', assignedTo: '', description: '', status: 'todo' });
        setIsModalOpen(false);
    };

    const handleOpenTaskDetails = (task: Task) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
    };

    const handleCloseTaskDetails = () => {
        setIsDetailModalOpen(false);
        setSelectedTask(null);
    };

    const handleProgressChange = (progress: number) => {
        if (selectedTask) {
            const updatedTask = { ...selectedTask, progress };
            setSelectedTask(updatedTask); // Optimistic UI update
            updateTask(updatedTask);
        }
    };

    const handlePostComment = async () => {
        if (selectedTask && newComment.trim()) {
            await addTaskComment(selectedTask.id, newComment);
            // The context will refetch and update the selectedTask state via useEffect
            setNewComment('');
        }
    };
    
    // This effect ensures that the detailed view is updated when a comment is added
    React.useEffect(() => {
        if (selectedTask) {
            const updatedTaskInList = tasks.find(t => t.id === selectedTask.id);
            if (updatedTaskInList) {
                setSelectedTask(updatedTaskInList);
            }
        }
    }, [tasks, selectedTask]);


    const columns: { title: string; status: 'todo' | 'inprogress' | 'done'; color: string }[] = [
        { title: 'مهام جديدة', status: 'todo', color: 'border-blue-500' },
        { title: 'قيد التنفيذ', status: 'inprogress', color: 'border-orange-500' },
        { title: 'مهام مكتملة', status: 'done', color: 'border-green-500' }
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h2 className="text-2xl font-bold text-slate-800">إدارة المهام</h2>
                {hasPermission('task:create') && (
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition"
                        aria-label="إضافة مهمة جديدة"
                    >
                        <PlusIcon className="h-5 w-5" />
                        إضافة مهمة
                    </button>
                )}
            </div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map(col => (
                    <KanbanColumn
                        key={col.status}
                        title={col.title}
                        status={col.status}
                        color={col.color}
                        onCardClick={handleOpenTaskDetails}
                    />
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة مهمة جديدة">
                <div className="space-y-4">
                    <label htmlFor="task-title" className="block text-sm font-medium text-slate-700">عنوان المهمة</label>
                    <input id="task-title" type="text" placeholder="عنوان المهمة" value={newTask.title} onChange={e => setNewTask(t => ({...t, title: e.target.value}))} className="w-full px-4 py-2 border border-slate-300 rounded-md text-slate-800" />
                    <label htmlFor="task-description" className="block text-sm font-medium text-slate-700">وصف المهمة</label>
                    <textarea id="task-description" placeholder="وصف قصير للمهمة" value={newTask.description} onChange={e => setNewTask(t => ({...t, description: e.target.value}))} className="w-full px-4 py-2 border border-slate-300 rounded-md text-slate-800" rows={3}></textarea>
                    <label htmlFor="assign-to" className="block text-sm font-medium text-slate-700">إسناد إلى</label>
                    <select id="assign-to" value={newTask.assignedTo} onChange={e => setNewTask(t => ({...t, assignedTo: e.target.value}))} className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-800">
                        <option value="" disabled>اختر عضو الفريق...</option>
                        {team.map(member => (<option key={member.id} value={member.id}>{member.name}</option>))}
                    </select>
                    <div className="flex justify-end pt-4"><button onClick={handleSaveTask} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">حفظ المهمة</button></div>
                </div>
            </Modal>

            {selectedTask && (
                <Modal isOpen={isDetailModalOpen} onClose={handleCloseTaskDetails} title={selectedTask.title}>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-slate-700 mb-2">الوصف</h4>
                            <p className="p-3 bg-slate-50 rounded-md text-sm text-slate-600">{selectedTask.description || "لا يوجد وصف لهذه المهمة."}</p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-slate-700 mb-2">نسبة الإنجاز: {selectedTask.progress}%</h4>
                            <input 
                                type="range" min="0" max="100" 
                                value={selectedTask.progress} 
                                onChange={e => handleProgressChange(Number(e.target.value))} 
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!(currentUser?.role === 'COMPANY_ADMIN' || team.find(m => m.id === selectedTask.assignedTo)?.email === currentUser?.email)}
                            />
                        </div>
                        
                        <div>
                             <h4 className="font-semibold text-slate-700 mb-3">التعليقات</h4>
                             <div className="space-y-3 max-h-48 overflow-y-auto bg-slate-50 p-3 rounded-md">
                                {selectedTask.comments.map((comment, index) => (
                                    <div key={index} className={`flex flex-col ${comment.authorId === currentUser?.id ? 'items-end' : 'items-start'}`}>
                                        <div className={`rounded-lg px-3 py-2 max-w-xs ${comment.authorId === currentUser?.id ? 'bg-emerald-600 text-white' : 'bg-white border'}`}>
                                            <p className="text-sm font-bold">{comment.authorName}</p>
                                            <p className="text-sm">{comment.text}</p>
                                        </div>
                                        <span className="text-xs text-slate-400 mt-1">{new Date(comment.timestamp).toLocaleTimeString('ar-SA')}</span>
                                    </div>
                                ))}
                                {selectedTask.comments.length === 0 && <p className="text-sm text-slate-400 text-center py-4">لا توجد تعليقات.</p>}
                             </div>
                             <div className="mt-3 flex gap-2">
                                <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="اكتب تعليقاً..." className="flex-grow px-3 py-2 border border-slate-300 rounded-md text-slate-800" />
                                <button onClick={handlePostComment} className="bg-slate-700 text-white px-4 rounded-md hover:bg-slate-800">إرسال</button>
                             </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Tasks;