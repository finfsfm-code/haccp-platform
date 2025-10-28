

import React, { useState } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';
// FIX: Added .ts extension to resolve module.
import { TrainingProgram, Attendee } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon.tsx';

const emptyAttendee: Omit<Attendee, 'id'> = { name: '', department: '', position: '', email: '', phone: '' };

const Training: React.FC = () => {
    const { 
        trainingPrograms, 
        addTrainingProgram,
        deleteTrainingProgram,
        addAttendee,
        removeAttendee,
        sendTrainingInvitation,
        showNotification,
        hasPermission
    } = useAppContext();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
    const [newAttendee, setNewAttendee] = useState<Omit<Attendee, 'id'>>(emptyAttendee);
    
    const [currentProgram, setCurrentProgram] = useState<Omit<TrainingProgram, 'id' | 'attendees' | 'assessments' | 'evaluations'>>({
        name: '',
        trainer: '',
        location: '',
        date: '',
        topics: '',
    });

    const handleSaveProgram = async () => {
        if (currentProgram.name && currentProgram.date) {
            await addTrainingProgram(currentProgram);
            showNotification('تمت إضافة البرنامج التدريبي بنجاح!', 'success');
            setIsModalOpen(false);
            setCurrentProgram({ name: '', trainer: '', location: '', date: '', topics: '' });
        } else {
            showNotification('يرجى تعبئة اسم البرنامج والتاريخ.', 'error');
        }
    };

    const handleDeleteProgram = async (id: string) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا البرنامج التدريبي؟')) {
            await deleteTrainingProgram(id);
        }
    };

    const handleToggleExpand = (id: string) => {
        setExpandedProgram(expandedProgram === id ? null : id);
        // Reset attendee form when collapsing/expanding
        setNewAttendee(emptyAttendee);
    };

    const handleAddAttendee = async (programId: string) => {
        if (!newAttendee.name.trim() || !newAttendee.email.trim()) {
            showNotification('يرجى تعبئة اسم الحاضر وبريده الإلكتروني على الأقل.', 'error');
            return;
        }
        await addAttendee(programId, newAttendee);
        setNewAttendee(emptyAttendee);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">إدارة التدريب</h2>
                {hasPermission('training:create') && (
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                        <PlusIcon className="h-5 w-5" />
                        إضافة برنامج تدريبي
                    </button>
                )}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
                {trainingPrograms.length === 0 ? (
                    <p className="text-slate-500 text-center">لم تتم إضافة أي برامج تدريبية بعد.</p>
                ) : (
                    <div className="space-y-4">
                        {trainingPrograms.map(program => (
                            <div key={program.id} className="border rounded-lg transition-shadow hover:shadow-lg overflow-hidden">
                                <div className="p-4 flex justify-between items-center cursor-pointer bg-slate-50" onClick={() => handleToggleExpand(program.id)}>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{program.name}</h3>
                                        <p className="text-sm text-slate-600">{program.date} - بواسطة: {program.trainer}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {hasPermission('training:delete') && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteProgram(program.id); }} className="text-red-500 hover:text-red-700">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        <ChevronDownIcon className={`h-6 w-6 text-slate-500 transition-transform ${expandedProgram === program.id ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                                {expandedProgram === program.id && (
                                    <div className="p-6 border-t bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div><strong>المكان:</strong> {program.location}</div>
                                            <div><strong>المحاور:</strong> {program.topics}</div>
                                        </div>
                                        
                                        {/* Attendees Section */}
                                        {hasPermission('training:manage_attendees') && (
                                            <div className="mt-4">
                                                <h4 className="font-semibold text-slate-700 mb-2">قائمة الحضور:</h4>
                                                <div className="border rounded-lg overflow-hidden">
                                                    <table className="min-w-full">
                                                        <thead className="bg-slate-100">
                                                            <tr>
                                                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">الاسم</th>
                                                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">البريد الإلكتروني</th>
                                                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">الإجراءات</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-200">
                                                            {program.attendees.map(attendee => (
                                                                <tr key={attendee.id}>
                                                                    <td className="px-4 py-2 text-sm text-slate-800">{attendee.name}</td>
                                                                    <td className="px-4 py-2 text-sm text-slate-700">{attendee.email}</td>
                                                                    <td className="px-4 py-2 text-sm space-x-4">
                                                                        <button onClick={() => sendTrainingInvitation(attendee.email, attendee.name, program.name)} className="text-blue-600 hover:underline text-xs">إرسال دعوة</button>
                                                                        <button onClick={() => removeAttendee(program.id, attendee.id)} className="text-red-600 hover:underline text-xs">إزالة</button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                
                                                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                                    <h5 className="font-semibold text-sm mb-3">إضافة حاضر جديد</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                        <input type="text" value={newAttendee.name} onChange={e => setNewAttendee(a => ({...a, name: e.target.value}))} placeholder="اسم الحاضر" className="bg-white px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                                                        <input type="email" value={newAttendee.email} onChange={e => setNewAttendee(a => ({...a, email: e.target.value}))} placeholder="البريد الإلكتروني" className="bg-white px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                                                        <input type="text" value={newAttendee.department} onChange={e => setNewAttendee(a => ({...a, department: e.target.value}))} placeholder="الإدارة" className="bg-white px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                                                        <input type="text" value={newAttendee.position} onChange={e => setNewAttendee(a => ({...a, position: e.target.value}))} placeholder="الوظيفة" className="bg-white px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                                                        <input type="text" value={newAttendee.phone} onChange={e => setNewAttendee(a => ({...a, phone: e.target.value}))} placeholder="رقم التواصل" className="bg-white px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <button onClick={() => handleAddAttendee(program.id)} className="bg-slate-700 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-800">إضافة</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Placeholder for future features */}
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-4 border rounded-lg">
                                                <h4 className="font-semibold text-slate-700 mb-2">التقييم القبلي والبعدي</h4>
                                                <p className="text-sm text-slate-600">سيتم تفعيل هذه الميزة قريبًا لعرض نتائج تقييم المتدربين.</p>
                                            </div>
                                             <div className="p-4 border rounded-lg">
                                                <h4 className="font-semibold text-slate-700 mb-2">تقييم البرنامج والمدرب</h4>
                                                <p className="text-sm text-slate-600">سيتم تفعيل هذه الميزة قريبًا لعرض آراء المتدربين في البرنامج.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة برنامج تدريبي جديد">
                <div className="space-y-4">
                    <input type="text" placeholder="اسم البرنامج التدريبي" value={currentProgram.name} onChange={e => setCurrentProgram(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-md" />
                    <input type="text" placeholder="اسم المدرب" value={currentProgram.trainer} onChange={e => setCurrentProgram(p => ({ ...p, trainer: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-md" />
                    <input type="text" placeholder="مكان الانعقاد" value={currentProgram.location} onChange={e => setCurrentProgram(p => ({ ...p, location: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-md" />
                    <input type="date" value={currentProgram.date} onChange={e => setCurrentProgram(p => ({ ...p, date: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-md" />
                    <textarea placeholder="محاور التدريب" value={currentProgram.topics} onChange={e => setCurrentProgram(p => ({ ...p, topics: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-md" rows={4} />
                    <div className="flex justify-end pt-4">
                        <button onClick={handleSaveProgram} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">حفظ البرنامج</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Training;