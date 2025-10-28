import React, { useState, useEffect } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';
// FIX: Added .ts extension to resolve module.
import { Supplier, SupplierEvaluation } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { PencilIcon } from '../components/icons/PencilIcon.tsx';
import { StarIcon } from '../components/icons/StarIcon.tsx';
// FIX: Added .ts extension to resolve module.
import * as geminiService from '../services/geminiService.ts';
import { FlaskIcon } from '../components/icons/FlaskIcon.tsx';

const emptySupplier: Omit<Supplier, 'id' | 'evaluations'> = {
    name: '',
    materials: [],
    phone: '',
    email: '',
    address: '',
    commercialRegistrationNo: '',
    taxNo: '',
    qualityCertificates: '',
    requiredTests: [],
    otherRequirements: ''
};

const emptyEvaluation: Omit<SupplierEvaluation, 'id'> = {
    date: new Date().toISOString().slice(0, 10),
    evaluator: '',
    score: 3,
    notes: '',
};

const Suppliers: React.FC = () => {
    const { 
        suppliers, 
        addSupplier, 
        updateSupplier, 
        deleteSupplier,
        addSupplierEvaluation,
        showNotification,
        hasPermission,
        currentUser
    } = useAppContext();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [currentSupplierData, setCurrentSupplierData] = useState<Omit<Supplier, 'id' | 'evaluations'>>(emptySupplier);
    const [currentEvaluation, setCurrentEvaluation] = useState<Omit<SupplierEvaluation, 'id'>>(emptyEvaluation);
    const [evaluatingSupplierId, setEvaluatingSupplierId] = useState<string | null>(null);
    const [isGeneratingTests, setIsGeneratingTests] = useState(false);
    
    useEffect(() => {
        const materials = currentSupplierData.materials;
        if (!isModalOpen || !materials || materials.length === 0 || materials.every(m => m.trim() === '')) {
            setCurrentSupplierData(s => ({ ...s, requiredTests: [] }));
            return;
        }
    
        const handler = setTimeout(async () => {
            setIsGeneratingTests(true);
            try {
                const tests = await geminiService.generateRequiredTestsForMaterial(materials.join(', '));
                setCurrentSupplierData(s => ({ ...s, requiredTests: tests }));
            } catch (error) {
                console.error("Test generation failed:", error);
                showNotification('فشل اقتراح الاختبارات.', 'error');
            } finally {
                setIsGeneratingTests(false);
            }
        }, 1500);
    
        return () => clearTimeout(handler);
    }, [JSON.stringify(currentSupplierData.materials), isModalOpen]);


    const handleOpenModal = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setCurrentSupplierData(JSON.parse(JSON.stringify(supplier)));
        } else {
            setEditingSupplier(null);
            setCurrentSupplierData(emptySupplier);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
    };

    const handleSave = async () => {
        if (!currentSupplierData.name) {
            showNotification('يرجى تعبئة اسم المورد.', 'error');
            return;
        }

        if (editingSupplier) {
            await updateSupplier({ ...editingSupplier, ...currentSupplierData });
            showNotification('تم تحديث بيانات المورد بنجاح!', 'success');
        } else {
            await addSupplier(currentSupplierData);
            showNotification('تمت إضافة المورد بنجاح!', 'success');
        }
        handleCloseModal();
    };
    
    const handleOpenEvalModal = (supplierId: string) => {
        setEvaluatingSupplierId(supplierId);
        setCurrentEvaluation({ ...emptyEvaluation, evaluator: (currentUser as any)?.name || currentUser?.companyName || '' });
        setIsEvalModalOpen(true);
    };

    const handleSaveEvaluation = async () => {
        if (evaluatingSupplierId) {
            await addSupplierEvaluation(evaluatingSupplierId, currentEvaluation);
            showNotification('تم حفظ التقييم.', 'success');
            setIsEvalModalOpen(false);
            setEvaluatingSupplierId(null);
        }
    };
    
    const getAvgScore = (evals: SupplierEvaluation[]) => {
        if (!Array.isArray(evals) || evals.length === 0) return 'N/A';
        const avg = evals.reduce((sum, e) => sum + e.score, 0) / evals.length;
        return avg.toFixed(1);
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">إدارة الموردين</h2>
                {hasPermission('supplier:create') && (
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition">
                        <PlusIcon className="h-5 w-5" />
                        إضافة مورد جديد
                    </button>
                )}
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
                {suppliers.length === 0 ? <p className="text-slate-500 text-center">لم تتم إضافة أي موردين بعد.</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">اسم المورد</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">التواصل</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">المواد الموردة</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">متوسط التقييم</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {suppliers.map(s => (
                                    <tr key={s.id}>
                                        <td className="px-6 py-4"><div className="text-sm font-medium text-slate-900">{s.name}</div><div className="text-sm text-slate-600">{s.address}</div></td>
                                        <td className="px-6 py-4"><div className="text-sm text-slate-900">{s.phone}</div><div className="text-sm text-slate-600">{s.email}</div></td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{s.materials.join(', ')}</td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-700">{getAvgScore(s.evaluations)} / 5</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {hasPermission('supplier:evaluate') && <button onClick={() => handleOpenEvalModal(s.id)} className="text-yellow-500 hover:text-yellow-700" title="تقييم المورد"><StarIcon className="h-5 w-5"/></button>}
                                                {hasPermission('supplier:edit') && <button onClick={() => handleOpenModal(s)} className="text-blue-600 hover:text-blue-900" title="تعديل"><PencilIcon className="h-5 w-5"/></button>}
                                                {hasPermission('supplier:delete') && <button onClick={() => deleteSupplier(s.id)} className="text-red-600 hover:text-red-900" title="حذف"><TrashIcon className="h-5 w-5"/></button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSupplier ? "تعديل بيانات مورد" : "إضافة مورد جديد"}>
                <div className="space-y-4">
                    <input type="text" placeholder="اسم المورد" value={currentSupplierData.name} onChange={e => setCurrentSupplierData(s => ({...s, name: e.target.value}))} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="رقم السجل التجاري" value={currentSupplierData.commercialRegistrationNo || ''} onChange={e => setCurrentSupplierData(s => ({...s, commercialRegistrationNo: e.target.value}))} />
                        <input type="text" placeholder="الرقم الضريبي" value={currentSupplierData.taxNo || ''} onChange={e => setCurrentSupplierData(s => ({...s, taxNo: e.target.value}))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="رقم الهاتف" value={currentSupplierData.phone} onChange={e => setCurrentSupplierData(s => ({...s, phone: e.target.value}))} />
                        <input type="email" placeholder="البريد الإلكتروني" value={currentSupplierData.email} onChange={e => setCurrentSupplierData(s => ({...s, email: e.target.value}))} />
                    </div>
                    <input type="text" placeholder="العنوان" value={currentSupplierData.address} onChange={e => setCurrentSupplierData(s => ({...s, address: e.target.value}))} />
                    
                    <fieldset className="p-4 border-t-2 border-emerald-500">
                        <legend className="px-2 font-bold text-lg">المواد والاختبارات</legend>
                        <input type="text" placeholder="المواد الموردة (افصل بينها بفاصلة)" value={currentSupplierData.materials.join(', ')} onChange={e => setCurrentSupplierData(s => ({...s, materials: e.target.value.split(',').map(m => m.trim())}))} />
                        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-md">
                            <h4 className="font-semibold text-blue-800 flex items-center gap-2"><FlaskIcon className="h-5 w-5"/> الاختبارات المقترحة (بواسطة AI)</h4>
                            {isGeneratingTests ? <p className="text-sm text-slate-500 animate-pulse">جاري تحليل المواد لاقتراح الاختبارات...</p> : 
                             currentSupplierData.requiredTests && currentSupplierData.requiredTests.length > 0 ? 
                             <div className="flex flex-wrap gap-2 mt-2">{currentSupplierData.requiredTests.map(t => <span key={t} className="bg-blue-200 text-blue-900 text-xs font-bold px-2 py-1 rounded-full">{t}</span>)}</div> : 
                             <p className="text-sm text-slate-500 mt-1">أدخل المواد الموردة أعلاه ليقوم النظام باقتراح الاختبارات.</p>
                            }
                        </div>
                    </fieldset>
                    
                    <textarea placeholder="شهادات الجودة (اختياري)" value={currentSupplierData.qualityCertificates || ''} onChange={e => setCurrentSupplierData(s => ({...s, qualityCertificates: e.target.value}))} rows={2}/>
                    <textarea placeholder="متطلبات أخرى (اختياري)" value={currentSupplierData.otherRequirements || ''} onChange={e => setCurrentSupplierData(s => ({...s, otherRequirements: e.target.value}))} rows={2}/>
                    
                    <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">{editingSupplier ? 'حفظ التغييرات' : 'حفظ المورد'}</button></div>
                </div>
            </Modal>
            
            <Modal isOpen={isEvalModalOpen} onClose={() => setIsEvalModalOpen(false)} title="إضافة تقييم للمورد">
                <div className="space-y-4">
                    <div><label className="text-sm font-medium">التقييم (من 1 إلى 5)</label><div className="flex items-center gap-2 mt-1">{[1, 2, 3, 4, 5].map(i => <StarIcon key={i} onClick={() => setCurrentEvaluation(e => ({...e, score: i}))} className={`h-8 w-8 cursor-pointer ${currentEvaluation.score >= i ? 'text-yellow-400' : 'text-slate-300'}`} />)}</div></div>
                    <textarea placeholder="ملاحظات التقييم" rows={4} value={currentEvaluation.notes} onChange={e => setCurrentEvaluation(ev => ({...ev, notes: e.target.value}))} />
                    <div className="flex justify-end pt-4"><button onClick={handleSaveEvaluation} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">حفظ التقييم</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default Suppliers;