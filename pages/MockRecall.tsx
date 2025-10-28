import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { StopwatchIcon } from '../components/icons/StopwatchIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { MockRecallDrill, RecallDrillTask, RecallDrillTeamMember } from '../types';
import { ClipboardCheckIcon } from '../components/icons/ClipboardCheckIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { TrashIcon } from '../components/icons/TrashIcon';

const MockRecall: React.FC = () => {
    const { 
        mockRecallDrill, 
        startMockRecall, 
        updateMockRecallDrill,
        completeMockRecallDrill,
        products,
        suppliers,
        team
    } = useAppContext();
    
    const [elapsedTime, setElapsedTime] = useState(0);
    const [localDrill, setLocalDrill] = useState<MockRecallDrill | null>(mockRecallDrill);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (mockRecallDrill?.status === 'in-progress') {
            setLocalDrill(mockRecallDrill);
            setElapsedTime(Math.floor((Date.now() - mockRecallDrill.startTime) / 1000));
            timer = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - mockRecallDrill.startTime) / 1000));
            }, 1000);
        } else {
            setLocalDrill(null);
        }
        return () => clearInterval(timer);
    }, [mockRecallDrill]);

    const handleStart = () => {
        startMockRecall();
    };

    const handleNextStep = () => {
        if (localDrill && localDrill.currentStep < 4) {
            const nextStep = localDrill.currentStep + 1;
            const updatedDrill = { ...localDrill, currentStep: nextStep };
            setLocalDrill(updatedDrill);
            updateMockRecallDrill(updatedDrill);
        }
    };

    const handlePrevStep = () => {
        if (localDrill && localDrill.currentStep > 1) {
            const prevStep = localDrill.currentStep - 1;
            const updatedDrill = { ...localDrill, currentStep: prevStep };
            setLocalDrill(updatedDrill);
            updateMockRecallDrill(updatedDrill);
        }
    };
    
    const handleComplete = async () => {
        if (localDrill && window.confirm('هل أنت متأكد من إنهاء التدريب؟ سيتم حفظ النتائج وإنشاء تقرير.')) {
            await completeMockRecallDrill(localDrill);
        }
    };
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    // Step 1: Information Gathering
    const renderStep1 = () => {
        if (!localDrill) return null;
        const { backward, forward } = localDrill.traceabilityResults;
        const product = products.find(p => p.id === backward?.productId);

        return (
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">المرحلة 1: جمع المعلومات</h3>
                <p className="text-slate-600 mb-6">يقوم النظام تلقائياً بتنفيذ عملية التتبع. قم بمراجعة النتائج للتأكد من دقتها.</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-4 rounded-lg border">
                        <h4 className="font-semibold text-slate-700 mb-2">التتبع للخلف (الموردين)</h4>
                        {backward && product ? (
                            <div className="text-sm space-y-2">
                                <p><strong>المنتج:</strong> {product.name}</p>
                                <p><strong>تاريخ الإنتاج:</strong> {new Date(backward.productionDate!).toLocaleDateString('ar-SA')}</p>
                                <ul className="list-disc list-inside">
                                    {backward.usedIngredients.map((ing, i) => {
                                        const ingredientInfo = product.ingredients.find(i => i.id === ing.ingredientId);
                                        const supplier = suppliers.find(s => s.id === ingredientInfo?.supplierId);
                                        return (
                                            <li key={i}>{ingredientInfo?.name || 'مكون غير معروف'} - <span className="font-semibold">{supplier?.name || 'مورد غير معروف'}</span></li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ) : <p className="text-sm text-slate-500">لا توجد بيانات.</p>}
                    </div>
                     <div className="bg-slate-50 p-4 rounded-lg border">
                        <h4 className="font-semibold text-slate-700 mb-2">التتبع للأمام (العملاء)</h4>
                        {forward.length > 0 ? (
                             <ul className="text-sm list-disc list-inside space-y-1">
                                {forward.map(order => (
                                    <li key={order.id}>
                                        <strong>{order.customer.name}</strong> (الطلب: {order.orderNumber})
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-slate-500">لم يتم توزيع هذه التشغيلة.</p>}
                    </div>
                </div>
            </div>
        );
    };

    // Step 2: Team Formation
    const renderStep2 = () => {
        if (!localDrill) return null;
        const handleAddTeamMember = (memberId: string) => {
            if (localDrill.team.some(tm => tm.memberId === memberId)) return;
            const newMember: RecallDrillTeamMember = { memberId, role: 'عضو فريق' };
            setLocalDrill({ ...localDrill, team: [...localDrill.team, newMember] });
        };

        const handleRemoveTeamMember = (memberId: string) => {
            setLocalDrill({ ...localDrill, team: localDrill.team.filter(tm => tm.memberId !== memberId) });
        };
        
        const handleRoleChange = (memberId: string, role: string) => {
            setLocalDrill({ ...localDrill, team: localDrill.team.map(tm => tm.memberId === memberId ? { ...tm, role } : tm) });
        };

        const availableTeam = team.filter(t => !localDrill.team.some(lt => lt.memberId === t.id));

        return (
             <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">المرحلة 2: تشكيل فريق الاستدعاء</h3>
                <p className="text-slate-600 mb-6">اختر أعضاء الفريق وقم بتحديد أدوارهم في عملية الاستدعاء.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-4 rounded-lg border">
                        <h4 className="font-semibold text-slate-700 mb-3">أعضاء فريقك المتاحين</h4>
                         <div className="space-y-2">
                             {availableTeam.map(t => (
                                 <div key={t.id} className="flex justify-between items-center bg-white p-2 rounded-md border">
                                     <span>{t.name} <span className="text-xs text-slate-500">({t.position})</span></span>
                                     <button onClick={() => handleAddTeamMember(t.id)} className="text-sm bg-emerald-100 text-emerald-800 px-2 py-1 rounded hover:bg-emerald-200">+</button>
                                 </div>
                             ))}
                             {availableTeam.length === 0 && <p className="text-sm text-slate-400 text-center">كل الأعضاء تم إضافتهم.</p>}
                         </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border">
                         <h4 className="font-semibold text-slate-700 mb-3">فريق الاستدعاء المشكل</h4>
                         <div className="space-y-2">
                             {localDrill.team.map(member => {
                                 const teamMember = team.find(t => t.id === member.memberId);
                                 return (
                                     <div key={member.memberId} className="flex items-center gap-2 bg-white p-2 rounded-md border">
                                         <button onClick={() => handleRemoveTeamMember(member.memberId)} className="text-red-500">
                                            <TrashIcon className="w-4 h-4" />
                                         </button>
                                         <div className="flex-grow">
                                            <p className="font-semibold text-sm">{teamMember?.name}</p>
                                            <input 
                                                type="text" 
                                                value={member.role}
                                                onChange={(e) => handleRoleChange(member.memberId, e.target.value)}
                                                className="w-full text-xs p-1 border rounded"
                                                placeholder="دور العضو..."
                                            />
                                         </div>
                                     </div>
                                 );
                             })}
                             {localDrill.team.length === 0 && <p className="text-sm text-slate-400 text-center">لم يتم إضافة أي أعضاء.</p>}
                         </div>
                    </div>
                </div>
            </div>
        );
    };

    // Step 3: Action Plan
    const renderStep3 = () => {
        if (!localDrill) return null;
        const [newTask, setNewTask] = useState({ category: 'communication' as RecallDrillTask['category'], title: '' });

        const handleAddTask = () => {
            if (!newTask.title.trim()) return;
            const taskToAdd: RecallDrillTask = {
                ...newTask,
                id: Date.now().toString(),
                assignedTo: '',
                status: 'todo',
            };
            setLocalDrill({ ...localDrill, tasks: [...localDrill.tasks, taskToAdd] });
            setNewTask({ category: 'communication', title: '' });
        };
        
        const handleUpdateTask = (taskId: string, field: keyof RecallDrillTask, value: string) => {
            setLocalDrill({ ...localDrill, tasks: localDrill.tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t) });
        };

        const recallTeam = localDrill.team.map(tm => team.find(t => t.id === tm.memberId)).filter(Boolean);

        const taskCategories: { key: RecallDrillTask['category'], label: string }[] = [
            { key: 'communication', label: 'مهام التواصل' },
            { key: 'logistics', label: 'مهام لوجستية' },
            { key: 'product_handling', label: 'مهام التعامل مع المنتج' },
        ];

        return (
            <div>
                 <h3 className="text-xl font-bold text-slate-800 mb-4">المرحلة 3: خطة العمل وتوزيع المهام</h3>
                 <div className="bg-slate-50 p-4 rounded-lg border mb-4">
                     <h4 className="font-semibold text-slate-700 mb-2">إضافة مهمة جديدة</h4>
                     <div className="flex items-center gap-2">
                        <input type="text" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="عنوان المهمة..." className="flex-grow p-2 border rounded-md" />
                        <select value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value as any })} className="p-2 border rounded-md bg-white">
                            {taskCategories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                        <button onClick={handleAddTask} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">إضافة</button>
                     </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {taskCategories.map(cat => (
                        <div key={cat.key}>
                            <h4 className="font-semibold text-center mb-2">{cat.label}</h4>
                            <div className="space-y-2">
                            {localDrill.tasks.filter(t => t.category === cat.key).map(task => (
                                <div key={task.id} className="bg-white p-3 border rounded-lg">
                                    <p className="text-sm font-medium">{task.title}</p>
                                    <select value={task.assignedTo} onChange={e => handleUpdateTask(task.id, 'assignedTo', e.target.value)} className="w-full mt-2 p-1 text-xs border rounded bg-slate-50">
                                        <option value="">إسناد إلى...</option>
                                        {recallTeam.map(t => <option key={t!.id} value={t!.id}>{t!.name}</option>)}
                                    </select>
                                </div>
                            ))}
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        )
    };
    
    // Step 4: Final Decision
    const renderStep4 = () => {
        if (!localDrill) return null;
        return (
             <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">المرحلة 4: القرار النهائي والإجراءات التصحيحية</h3>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">القرار النهائي بشأن المنتج المسترجع (مثال: إتلاف، إعادة تصنيع)</label>
                        <input type="text" value={localDrill.finalDecision} onChange={e => setLocalDrill({ ...localDrill, finalDecision: e.target.value })} className="w-full p-2 border rounded-md"/>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">الإجراءات التصحيحية لمنع تكرار المشكلة</label>
                        <textarea value={localDrill.correctiveActions} onChange={e => setLocalDrill({ ...localDrill, correctiveActions: e.target.value })} rows={4} className="w-full p-2 border rounded-md"></textarea>
                     </div>
                </div>
            </div>
        )
    };
    
    const renderStepContent = () => {
        switch (localDrill?.currentStep) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            case 4: return renderStep4();
            default: return null;
        }
    }

    if (localDrill?.status === 'in-progress') {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md max-w-5xl mx-auto">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">تدريب استدعاء وهمي: <span className="font-mono">{localDrill.targetBatchNumber}</span></h2>
                        <div className="flex items-center gap-2 text-lg font-semibold text-slate-700 mt-1">
                            <StopwatchIcon className="h-6 w-6 text-slate-500" />
                            <span>الوقت: {formatTime(elapsedTime)}</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
                            المرحلة {localDrill.currentStep} من 4
                        </span>
                    </div>
                </div>
                <div className="my-8 min-h-[300px]">
                    {renderStepContent()}
                </div>
                <div className="flex justify-between items-center border-t pt-4 mt-4">
                    <button onClick={handlePrevStep} disabled={localDrill.currentStep === 1} className="bg-slate-500 text-white px-5 py-2 rounded-md hover:bg-slate-600 disabled:bg-slate-300">
                        السابق
                    </button>
                    {localDrill.currentStep < 4 ? (
                         <button onClick={handleNextStep} className="bg-emerald-600 text-white px-5 py-2 rounded-md hover:bg-emerald-700">
                            التالي
                        </button>
                    ) : (
                        <button onClick={handleComplete} className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 flex items-center gap-2">
                           <CheckCircleIcon className="h-5 w-5"/> إنهاء التدريب وحفظ النتائج
                        </button>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div className="text-center bg-white p-12 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800">تدريب على عملية الاستدعاء (Mock Recall)</h2>
            <p className="mt-4 text-slate-600">
                هذه الوحدة تسمح لك بإجراء تدريب وهمي كامل لعملية استدعاء المنتج، بدءاً من التتبع وحتى اتخاذ الإجراءات التصحيحية. يتم قياس الوقت المستغرق في كل مرحلة لتقييم فعالية فريقك.
            </p>
            <button
                onClick={handleStart}
                className="mt-8 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition text-lg flex items-center gap-2 mx-auto"
            >
                <StopwatchIcon className="h-6 w-6"/>
                بدء تدريب جديد عشوائي
            </button>
        </div>
    );
};

export default MockRecall;