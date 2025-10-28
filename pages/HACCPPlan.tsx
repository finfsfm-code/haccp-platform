

import React, { useState, useEffect } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon.tsx';
// FIX: Added .tsx extension to resolve module.
import { DocumentIcon } from '../components/icons/DocumentIcon.tsx';
import { FlaskIcon } from '../components/icons/FlaskIcon.tsx';
import { TargetIcon } from '../components/icons/TargetIcon.tsx';
import { ScaleIcon } from '../components/icons/ScaleIcon.tsx';
import { EyeIcon } from '../components/icons/EyeIcon.tsx';
import { WrenchIcon } from '../components/icons/WrenchIcon.tsx';
import { ArchiveIcon } from '../components/icons/ArchiveIcon.tsx';
import { ClipboardIcon } from '../components/icons/ClipboardIcon.tsx';


const HACCPPlan: React.FC = () => {
    const { 
        products, 
        processFlows,
        setActivePage, 
        ccpDeterminations, 
        criticalLimits,
        monitoringProcedures,
        correctiveActions,
        verificationProcedures,
        recordKeeping,
        haccpProductIdForPlan,
        setHaccpProductIdForPlan,
    } = useAppContext();
    const [selectedProductId, setSelectedProductId] = useState<string>('');

    useEffect(() => {
        if (haccpProductIdForPlan) {
            setSelectedProductId(haccpProductIdForPlan);
            setHaccpProductIdForPlan(null); // Clear context state after using it
        }
    }, [haccpProductIdForPlan, setHaccpProductIdForPlan]);

    const stages = [
        {
            id: 'ProcessFlow',
            title: 'المرحلة 1: تحليل المخاطر',
            description: 'تحديد المخاطر البيولوجية والكيميائية والفيزيائية المحتملة في كل خطوة من خطوات عملية التصنيع.',
            icon: FlaskIcon,
            isComplete: (productId: string) => {
                const flow = processFlows.find(f => f.productId === productId);
                return !!flow && flow.steps.length > 0 && flow.steps.every(step => step.hazardAnalysis);
            },
        },
        {
            id: 'CCPDetermination',
            title: 'المرحلة 2: تحديد نقاط التحكم الحرجة',
            description: 'باستخدام شجرة القرارات، يتم تحديد الخطوات التي تعتبر نقاط تحكم حرجة (CCPs) لضمان سلامة المنتج.',
            icon: TargetIcon,
            isComplete: (productId: string) => !!ccpDeterminations[productId],
        },
        {
            id: 'CriticalLimits',
            title: 'المرحلة 3: وضع الحدود الحرجة',
            description: 'لكل نقطة تحكم حرجة، يتم تحديد الحدود القصوى والدنيا التي يجب الالتزام بها (مثل درجة الحرارة، الوقت).',
            icon: ScaleIcon,
            isComplete: (productId: string) => !!criticalLimits[productId],
        },
        {
            id: 'Monitoring',
            title: 'المرحلة 4: إجراءات الرصد',
            description: 'إنشاء نظام رصد لكل نقطة تحكم حرجة للتأكد من أنها تحت السيطرة.',
            icon: EyeIcon,
            isComplete: (productId: string) => !!monitoringProcedures[productId],
        },
        {
            id: 'CorrectiveActions',
            title: 'المرحلة 5: الإجراءات التصحيحية',
            description: 'تحديد الإجراءات التي يجب اتخاذها عند حدوث انحراف عن الحدود الحرجة.',
            icon: WrenchIcon,
            isComplete: (productId: string) => !!correctiveActions[productId],
        },
        {
            id: 'Verification',
            title: 'المرحلة 6: إجراءات التحقق',
            description: 'أنشطة تؤكد أن نظام الهاسب يعمل بفعالية، بخلاف الرصد اليومي.',
            icon: ClipboardIcon,
            isComplete: (productId: string) => !!verificationProcedures[productId],
        },
        {
            id: 'RecordKeeping',
            title: 'المرحلة 7: التوثيق وحفظ السجلات',
            description: 'إنشاء نظام فعال لحفظ السجلات لتوثيق عمل نظام الهاسب.',
            icon: ArchiveIcon,
            isComplete: (productId: string) => !!recordKeeping[productId],
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">بناء خطة الهاسب التفاعلية</h2>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="max-w-4xl mx-auto">
                    <p className="text-slate-600 mb-6">
                        اتبع المراحل التالية خطوة بخطوة لبناء خطة هاسب متكاملة ومخصصة لمنتجاتك. ابدأ باختيار المنتج الذي تود العمل عليه.
                    </p>
                    <div className="mb-8">
                        <label htmlFor="product-select" className="block text-sm font-medium text-slate-700 mb-2">
                            اختر المنتج لبدء أو استكمال الخطة:
                        </label>
                        <select
                            id="product-select"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="" disabled>-- اختر منتجاً --</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedProductId ? (
                        <div className="space-y-4">
                            {stages.map(stage => {
                                const completed = stage.isComplete(selectedProductId);
                                return (
                                    <div key={stage.id} className={`p-5 border rounded-lg flex items-start gap-4 transition-all ${completed ? 'border-green-200 bg-green-50' : 'bg-white'}`}>
                                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${completed ? 'bg-green-500' : 'bg-slate-200'}`}>
                                            <stage.icon className={`h-6 w-6 ${completed ? 'text-white' : 'text-slate-600'}`} />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-slate-800">{stage.title}</h3>
                                            <p className="text-sm text-slate-600 mt-1">{stage.description}</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            {completed ? (
                                                <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                    <span>مكتمل</span>
                                                </div>
                                            ) : (
                                                <div className="text-xs font-semibold text-slate-500">لم يبدأ بعد</div>
                                            )}
                                            <button 
                                                onClick={() => setActivePage(stage.id)}
                                                className={`px-4 py-1.5 text-sm rounded-md font-semibold transition ${completed ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                                            >
                                                {completed ? 'عرض النتائج' : 'ابدأ الآن'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <DocumentIcon className="h-16 w-16 mx-auto text-slate-300"/>
                            <p className="mt-4 text-slate-500">يرجى اختيار منتج لعرض مراحل خطة الهاسب الخاصة به.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HACCPPlan;