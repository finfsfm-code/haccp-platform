

import React, { useState, useEffect } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';
// FIX: Added .ts extension to resolve module.
import { ProcessStep, HazardAnalysisResult } from '../types.ts';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { FlaskIcon } from '../components/icons/FlaskIcon.tsx';
import { PrinterIcon } from '../components/icons/PrinterIcon.tsx';

// Dummy icons for compilation, should be in their own files
const ArrowUpIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
const ArrowDownIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;


const ProcessFlow: React.FC = () => {
    const { 
        products, 
        processFlows, 
        addOrUpdateProcessFlow, 
        generateAndSaveHazardAnalysis,
        showNotification,
        haccpProductIdForPlan,
        setHaccpProductIdForPlan,
        setPrintableProcessFlowProductId
    } = useAppContext();
    
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [steps, setSteps] = useState<ProcessStep[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    
    useEffect(() => {
        if(haccpProductIdForPlan) {
            setSelectedProductId(haccpProductIdForPlan);
            setHaccpProductIdForPlan(null);
        }
    }, [haccpProductIdForPlan, setHaccpProductIdForPlan]);

    useEffect(() => {
        const flow = processFlows.find(f => f.productId === selectedProductId);
        if (flow) {
            setSteps(flow.steps);
        } else {
            // New logic: Check product for prep steps if no flow exists
            const product = products.find(p => p.id === selectedProductId);
            if (product && Array.isArray(product.preparationSteps) && product.preparationSteps.length > 0) {
                const initialSteps: ProcessStep[] = product.preparationSteps.map((desc, index) => ({
                    id: `prep_${Date.now()}_${index}`,
                    stepNumber: index + 1,
                    description: desc,
                    hazardAnalysis: null
                }));
                setSteps(initialSteps);
                showNotification('تم استدعاء خطوات التحضير تلقائياً.', 'success');
            } else {
                setSteps([]);
            }
        }
    }, [selectedProductId, processFlows, products]);

    const handleSaveFlow = async () => {
        if (!selectedProductId) return;
        const numberedSteps = steps.map((s, i) => ({ ...s, stepNumber: i + 1 }));
        const flow = {
            id: selectedProductId,
            productId: selectedProductId,
            steps: numberedSteps,
        };
        await addOrUpdateProcessFlow(flow);
        showNotification('تم حفظ مخطط العمليات بنجاح.', 'success');
    };

    const handleStepChange = (id: string, description: string) => {
        setSteps(steps.map(s => s.id === id ? { ...s, description } : s));
    };

    const handleAddStep = () => {
        const newStep: ProcessStep = {
            id: `step_${Date.now()}`,
            stepNumber: steps.length + 1,
            description: '',
            hazardAnalysis: null,
        };
        setSteps([...steps, newStep]);
    };
    
    const handleRemoveStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
    };
    
    const handleMoveStep = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === steps.length - 1)) {
            return;
        }
        const newSteps = [...steps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        setSteps(newSteps);
    };

    const handleGenerateAnalysis = async () => {
        const flow = processFlows.find(f => f.productId === selectedProductId);
        if (!flow || flow.steps.length === 0 || flow.steps.some(s => !s.description.trim())) {
            showNotification('يرجى إضافة وحفظ خطوات العملية أولاً والتأكد من عدم وجود خطوات فارغة.', 'error');
            return;
        }
        setIsGenerating(true);
        await generateAndSaveHazardAnalysis(flow);
        setIsGenerating(false);
    };

    const renderHazardAnalysis = (analysis: HazardAnalysisResult | null) => {
        if (!analysis) return <p className="text-xs text-slate-500 italic mt-1">لم يتم تحليل المخاطر بعد.</p>;
        
        const controlPointType = analysis.controlPointType;
        const statusClass = controlPointType === 'CCP' ? 'text-red-600' : controlPointType === 'oPRP' ? 'text-blue-600' : 'text-green-600';

        return (
            <div className="text-xs space-y-2 mt-2">
                <div><strong>المخاطر:</strong> {analysis.hazards.map(h => `${h.description} (${h.type})`).join(', ')}</div>
                <div><strong>إجراء التحكم:</strong> {analysis.controlMeasures}</div>
                <div><strong>نقطة التحكم:</strong> <span className={`font-bold ${statusClass}`}>{controlPointType}</span> ({analysis.justification})</div>
            </div>
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">مخطط تدفق العمليات وتحليل المخاطر</h2>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">اختر المنتج لعرض أو تعديل مخططه:</label>
                    <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full max-w-lg px-4 py-2 border border-slate-300 rounded-md bg-white">
                        <option value="" disabled>-- اختر منتجاً --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                
                {selectedProductId && (
                    <div>
                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <div key={step.id} className="p-4 border rounded-md bg-white shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-center">
                                            <button onClick={() => handleMoveStep(index, 'up')} disabled={index === 0} className="p-1 disabled:opacity-30 text-slate-500 hover:text-slate-800"><ArrowUpIcon className="h-5 w-5" /></button>
                                            <span className="font-bold text-slate-700 select-none">{index + 1}.</span>
                                            <button onClick={() => handleMoveStep(index, 'down')} disabled={index === steps.length - 1} className="p-1 disabled:opacity-30 text-slate-500 hover:text-slate-800"><ArrowDownIcon className="h-5 w-5" /></button>
                                        </div>
                                        <div className="flex-grow">
                                            <input 
                                                type="text" 
                                                value={step.description} 
                                                onChange={e => handleStepChange(step.id, e.target.value)} 
                                                className="w-full px-4 py-3 bg-white text-slate-800 border border-slate-300 rounded-md placeholder-slate-400"
                                                placeholder="اكتب وصف الخطوة هنا..."
                                            />
                                            <div className="pr-2 pt-2">
                                                {renderHazardAnalysis(step.hazardAnalysis)}
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveStep(step.id)} className="p-1 text-red-500 hover:text-red-700 self-start"><TrashIcon className="h-5 w-5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddStep} className="mt-4 flex items-center gap-2 text-sm text-emerald-600 hover:underline">
                            <PlusIcon className="h-4 w-4" /> إضافة خطوة جديدة
                        </button>
                        <div className="mt-6 pt-6 border-t border-slate-300 flex items-center justify-between">
                            <button 
                                onClick={handleSaveFlow}
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700"
                            >
                                حفظ مخطط العمليات
                            </button>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setPrintableProcessFlowProductId(selectedProductId)}
                                    disabled={!steps.every(s => s.hazardAnalysis)}
                                    className="flex items-center gap-2 text-slate-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PrinterIcon className="h-5 w-5"/> طباعة
                                </button>
                                <button 
                                    onClick={handleGenerateAnalysis}
                                    disabled={isGenerating || steps.length === 0 || steps.some(s => !s.description.trim())}
                                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-md hover:bg-emerald-700 disabled:bg-slate-400 flex items-center gap-2"
                                >
                                    <FlaskIcon className="h-5 w-5"/>
                                    {isGenerating ? 'جاري التحليل...' : 'تحليل المخاطر (AI)'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProcessFlow;