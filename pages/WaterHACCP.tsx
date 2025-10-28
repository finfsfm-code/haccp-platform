
import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { WaterSource } from '../types.ts';
import MarkdownRenderer from '../components/MarkdownRenderer.tsx';
import { WaterDropIcon } from '../components/icons/WaterDropIcon.tsx';
import { FlaskIcon } from '../components/icons/FlaskIcon.tsx';
import { UploadIcon } from '../components/icons/UploadIcon.tsx';
import { PrinterIcon } from '../components/icons/PrinterIcon.tsx';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon.tsx';
import { RefreshCwIcon } from '../components/icons/RefreshCwIcon.tsx';

const WaterHACCP: React.FC = () => {
    const { 
        waterHaccpPlan, 
        generateAndSaveWaterHaccpPlan, 
        updateWaterHaccpTestDate, 
        setPrintableWaterHACCP,
        hasPermission 
    } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [source, setSource] = useState<WaterSource>(waterHaccpPlan?.source || 'public_network');
    const [sketch, setSketch] = useState<{ file: File, preview: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canManage = hasPermission('haccp:manage_water_plan');

    const handleGenerate = async () => {
        setIsLoading(true);
        let sketchData: { base64: string, mimeType: string } | undefined = undefined;
        if (sketch) {
            const reader = new FileReader();
            reader.readAsDataURL(sketch.file);
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                sketchData = { base64: base64String, mimeType: sketch.file.type };
                await generateAndSaveWaterHaccpPlan(source, sketchData);
                setIsLoading(false);
            };
        } else {
            await generateAndSaveWaterHaccpPlan(source);
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSketch({ file, preview: URL.createObjectURL(file) });
        }
    };

    const handleMarkAsDone = async (testId: string) => {
        await updateWaterHaccpTestDate(testId);
    };

    const getDueDateStatus = (test: { lastCheck: string | null, frequency: string }) => {
        if (!test.lastCheck) return 'due';
        const lastCheckDate = new Date(test.lastCheck);
        const nextCheckDate = new Date(lastCheckDate);
        const frequencyMap = { daily: 1, weekly: 7, monthly: 30, quarterly: 90, annually: 365 };
        const daysToNext = frequencyMap[test.frequency as keyof typeof frequencyMap] || 30;
        nextCheckDate.setDate(lastCheckDate.getDate() + daysToNext);
        const today = new Date();
        const daysDiff = (nextCheckDate.getTime() - today.getTime()) / (1000 * 3600 * 24);

        if (daysDiff < 0) return 'overdue';
        if (daysDiff <= 7) return 'due';
        return 'ok';
    };

    const sourceMap: Record<WaterSource, string> = {
        public_network: 'شبكة المياه العامة',
        well: 'بئر خاص',
        tanker: 'صهريج مياه',
        bottled: 'مياه معبأة',
    };
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-600 text-lg">جاري إنشاء خطة هاسب المياه، قد يستغرق هذا بعض الوقت...</p>
            </div>
        );
    }
    
    if (!waterHaccpPlan) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
                <div className="text-center">
                    <WaterDropIcon className="h-20 w-20 mx-auto text-blue-400" />
                    <h2 className="text-2xl font-bold text-slate-800 mt-4">
                        {canManage ? "إنشاء خطة هاسب للمياه" : "خطة هاسب المياه"}
                    </h2>
                    <p className="text-slate-600 mt-2">
                        {canManage 
                            ? "حدد مصدر المياه الرئيسي لمنشأتك، ويمكنك رفع مخطط لتوزيع المياه (اختياري) للحصول على خطة أكثر دقة."
                            : "لم يتم إنشاء خطة هاسب المياه بعد. يرجى الطلب من مدير النظام إنشائها."
                        }
                    </p>
                </div>
                {canManage && (
                     <div className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="water-source" className="block text-sm font-medium text-slate-700 mb-2">
                                اختر مصدر المياه:
                            </label>
                            <select
                                id="water-source"
                                value={source}
                                onChange={e => setSource(e.target.value as WaterSource)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-md bg-white shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                {Object.entries(sourceMap).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="p-4 border-2 border-dashed rounded-lg text-center">
                            <h4 className="font-semibold text-slate-700">مخطط توزيع المياه (اختياري)</h4>
                            <p className="text-sm text-slate-500 mt-1">ارفع صورة لمخطط شبكة المياه داخل المنشأة.</p>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="mt-3 bg-slate-100 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-200 text-sm flex items-center gap-2 mx-auto">
                                <UploadIcon className="h-5 w-5" />
                                {sketch ? `تم اختيار: ${sketch.file.name}` : 'اختر صورة المخطط'}
                            </button>
                            {sketch && <img src={sketch.preview} alt="Preview" className="mt-4 max-h-40 mx-auto rounded-md border" />}
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleGenerate}
                                className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-emerald-700 transition text-lg flex items-center gap-2 mx-auto"
                            >
                                <FlaskIcon className="h-6 w-6" />
                                إنشاء الخطة بواسطة AI
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-slate-800">خطة الهاسب للمياه</h2>
                 <div className="flex items-center gap-2">
                    {canManage && (
                        <button onClick={handleGenerate} className="flex items-center gap-2 bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600">
                           <RefreshCwIcon className="h-5 w-5"/> إعادة توليد الخطة
                       </button>
                    )}
                    <button onClick={() => setPrintableWaterHACCP(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        <PrinterIcon className="h-5 w-5"/> طباعة الخطة
                    </button>
                 </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold text-lg mb-3">الاختبارات الدورية</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {waterHaccpPlan.requiredTests.map(test => {
                                const status = getDueDateStatus(test);
                                const statusClasses = {
                                    ok: 'border-slate-200',
                                    due: 'border-yellow-400 bg-yellow-50',
                                    overdue: 'border-red-400 bg-red-50'
                                };
                                return (
                                    <div key={test.id} className={`p-3 rounded-md border ${statusClasses[status]} flex justify-between items-center`}>
                                        <div>
                                            <p className="font-semibold">{test.name}</p>
                                            <p className="text-xs text-slate-500">التكرار: {test.frequency} | آخر فحص: {test.lastCheck ? new Date(test.lastCheck).toLocaleDateString() : 'لم يتم'}</p>
                                        </div>
                                        {canManage && (
                                            <button onClick={() => handleMarkAsDone(test.id)} className="text-emerald-600 hover:text-emerald-800" title="تسجيل كـ (تم الفحص)">
                                                <CheckCircleIcon className="h-6 w-6" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold text-lg mb-3">توصيات المعالجة</h3>
                        <h4 className="font-semibold text-sm mb-2">الفلاتر:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm mb-4">{waterHaccpPlan.recommendedFilters.map(f => <li key={f.id}><strong>{f.type}:</strong> {f.maintenanceSchedule}</li>)}</ul>
                        <h4 className="font-semibold text-sm mb-2">المواد الكيميائية:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">{waterHaccpPlan.chemicals.map((c, i) => <li key={i}>{c}</li>)}</ul>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                     <h3 className="font-bold text-lg mb-3">تفاصيل خطة الهاسب</h3>
                    <MarkdownRenderer content={waterHaccpPlan.haccpDetails} />
                </div>
            </div>
        </div>
    );
};

export default WaterHACCP;
