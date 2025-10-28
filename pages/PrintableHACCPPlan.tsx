

import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PrinterIcon } from '../components/icons/PrinterIcon';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon';
import { ProcessStep } from '../types';
import MarkdownRenderer from '../components/MarkdownRenderer';

const PrintableHACCPPlan: React.FC = () => {
    const { 
        printablePlanProductId, 
        setPrintablePlanProductId, 
        products,
        processFlows,
        ccpDeterminations,
        criticalLimits,
        monitoringProcedures,
        correctiveActions,
        verificationProcedures,
        recordKeeping,
        companyInfo
    } = useAppContext();

    if (!printablePlanProductId) {
        return (
            <div className="p-8">
                <p>لا يوجد خطة لعرضها. يرجى اختيار خطة مكتملة أولاً.</p>
                <button onClick={() => setPrintablePlanProductId(null)} className="mt-4 bg-slate-500 text-white px-4 py-2 rounded">العودة</button>
            </div>
        );
    }

    const product = products.find(p => p.id === printablePlanProductId);
    const flow = processFlows.find(f => f.productId === printablePlanProductId);
    
    const sections = [
        { title: 'المرحلة 2: تحديد نقاط التحكم الحرجة', content: ccpDeterminations[printablePlanProductId] },
        { title: 'المرحلة 3: وضع الحدود الحرجة', content: criticalLimits[printablePlanProductId] },
        { title: 'المرحلة 4: إجراءات الرصد', content: monitoringProcedures[printablePlanProductId] },
        { title: 'المرحلة 5: الإجراءات التصحيحية', content: correctiveActions[printablePlanProductId] },
        { title: 'المرحلة 6: إجراءات التحقق', content: verificationProcedures[printablePlanProductId] },
        { title: 'المرحلة 7: التوثيق وحفظ السجلات', content: recordKeeping[printablePlanProductId] },
    ];
    
    const renderSection = (title: string, children: React.ReactNode) => (
        <div className="mb-8 page-break">
            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-emerald-500 pb-2 mb-4">{title}</h2>
            {children}
        </div>
    );
    
    return (
        <div className="bg-slate-100 min-h-screen">
            <style>
                {`
                @media print {
                    .no-print { display: none; }
                    body, .printable-area { margin: 0; padding: 0; font-size: 10pt; }
                    .page-break { page-break-inside: avoid; }
                    h1 { font-size: 24pt; }
                    h2 { font-size: 16pt; }
                    h3 { font-size: 12pt; }
                }
                `}
            </style>
            <div className="no-print p-4 bg-white shadow-md flex justify-between items-center">
                <h1 className="text-lg font-semibold">استعراض وطباعة خطة الهاسب</h1>
                <div className="flex gap-4">
                     <button onClick={() => setPrintablePlanProductId(null)} className="flex items-center gap-2 bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600">
                        <ArrowRightIcon className="h-5 w-5"/>
                        العودة
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
                        <PrinterIcon className="h-5 w-5"/>
                        طباعة الخطة
                    </button>
                </div>
            </div>
            <div className="printable-area p-8 max-w-4xl mx-auto bg-white my-8 shadow-lg">
                <header className="text-center mb-10 border-b pb-6">
                    <h1 className="text-4xl font-bold text-slate-900">خطة تحليل المخاطر ونقاط التحكم الحرجة (HACCP)</h1>
                    <p className="text-slate-600 mt-2 text-lg">المنتج: <span className="font-bold">{product?.name || 'غير محدد'}</span></p>
                    <p className="text-slate-500 mt-1">الشركة: {companyInfo.companyName}</p>
                    <p className="text-slate-500 text-sm">تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
                </header>

                {renderSection('المرحلة 1: تحليل المخاطر', (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border-collapse border">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th className="px-2 py-2 border">الخطوة</th>
                                    <th className="px-2 py-2 border">المخاطر والفئة</th>
                                    <th className="px-2 py-2 border">السبب</th>
                                    <th className="px-2 py-2 border">إجراءات التحكم</th>
                                    <th className="px-2 py-2 border">CCP/PRP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flow?.steps.map((step) => {
                                    // FIX: The `isCCP` property is deprecated. Use `controlPointType` from the `HazardAnalysisResult` type instead.
                                    // This includes a fallback for any older data that might still use `isCCP`.
                                    const analysis = step.hazardAnalysis as any;
                                    const controlPointType = analysis?.controlPointType || (analysis?.isCCP ? 'CCP' : 'PRP');

                                    const statusClass = controlPointType === 'CCP' 
                                        ? 'text-red-600' 
                                        : controlPointType === 'oPRP'
                                            ? 'text-blue-600'
                                            : 'text-green-600';

                                    return (
                                        <tr key={step.id} className="bg-white border-b">
                                            <td className="px-2 py-2 border font-semibold align-top">{step.stepNumber}. {step.description}</td>
                                            <td className="px-2 py-2 border align-top">
                                                {step.hazardAnalysis?.hazards.map((h, i) => <div key={i} className="mb-1">{h.description} <span className="text-xs text-slate-500">({h.type})</span></div>)}
                                            </td>
                                            <td className="px-2 py-2 border align-top">{step.hazardAnalysis?.cause}</td>
                                            <td className="px-2 py-2 border align-top">{step.hazardAnalysis?.controlMeasures}</td>
                                            <td className="px-2 py-2 border text-center align-top">
                                                <span className={`font-bold ${statusClass}`}>{controlPointType}</span>
                                                <p className="text-xs text-slate-500">{step.hazardAnalysis?.justification}</p>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}
                
                {sections.map(section => (
                    section.content && (
                        <div key={section.title} className="page-break">
                            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-emerald-500 pb-2 mb-4">{section.title}</h2>
                            <MarkdownRenderer content={section.content} />
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default PrintableHACCPPlan;