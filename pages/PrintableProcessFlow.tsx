import React from 'react';
import { useAppContext } from '../context/AppContext';
import { PrinterIcon } from '../components/icons/PrinterIcon';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon';

const DecisionTreeVisualizer: React.FC<{ justification?: string; controlPointType: 'PRP' | 'oPRP' | 'CCP' }> = ({ justification, controlPointType }) => {
    const questions = [
        { key: 'Q1', text: 'هل توجد تدابير تحكم وقائية للخطر المحدد في هذه الخطوة؟' },
        { key: 'Q2', text: 'هل هذه الخطوة مصممة خصيصًا للقضاء على الخطر أو تقليله إلى مستوى مقبول؟' },
        { key: 'Q3', text: 'هل يمكن أن يحدث تلوث بالخطر المحدد ويتجاوز المستوى المقبول، أو يزداد إلى مستوى غير مقبول؟' },
        { key: 'Q4', text: 'هل ستقضي خطوة لاحقة على الخطر المحدد أو تقلله إلى مستوى مقبول؟' }
    ];

    if (!justification || (controlPointType !== 'CCP' && controlPointType !== 'oPRP')) {
        return <p className="text-xs text-slate-500 italic mt-2">لا ينطبق (PRP).</p>;
    }

    const answers: { [key: string]: string } = {};
    const parts = justification.split(',').map(p => p.trim());
    parts.forEach(part => {
        const [key, answer] = part.split(':').map(p => p.trim());
        if (key && answer) {
            answers[key] = answer.toLowerCase();
        }
    });

    return (
        <table className="w-full text-xs mt-2 border-collapse border border-slate-300">
            <thead className="bg-slate-50">
                <tr>
                    <th className="p-1 border border-slate-300 text-right">السؤال (من شجرة قرارات الكودكس)</th>
                    <th className="p-1 border border-slate-300 text-center w-20">الإجابة</th>
                </tr>
            </thead>
            <tbody>
                {questions.map((q, index) => {
                    const answer = answers[q.key];
                    if (!answer) return null;
                    const isYes = answer === 'yes' || answer === 'نعم';
                    return (
                        <tr key={index}>
                            <td className="p-2 border border-slate-300">{q.text}</td>
                            <td className={`p-2 border border-slate-300 text-center font-semibold ${isYes ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                                {isYes ? 'نعم' : 'لا'}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};


const PrintableProcessFlow: React.FC = () => {
    const { 
        printableProcessFlowProductId, 
        setPrintableProcessFlowProductId, 
        products,
        processFlows,
        companyInfo
    } = useAppContext();

    if (!printableProcessFlowProductId) {
        return (
            <div className="p-8">
                <p>لا يوجد مخطط لعرضه.</p>
                <button onClick={() => setPrintableProcessFlowProductId(null)} className="mt-4 bg-slate-500 text-white px-4 py-2 rounded">العودة</button>
            </div>
        );
    }

    const product = products.find(p => p.id === printableProcessFlowProductId);
    const flow = processFlows.find(f => f.productId === printableProcessFlowProductId);

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
                <h1 className="text-lg font-semibold">استعراض وطباعة مخطط العمليات</h1>
                <div className="flex gap-4">
                     <button onClick={() => setPrintableProcessFlowProductId(null)} className="flex items-center gap-2 bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600">
                        <ArrowRightIcon className="h-5 w-5"/>
                        العودة
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
                        <PrinterIcon className="h-5 w-5"/>
                        طباعة
                    </button>
                </div>
            </div>
            <div className="printable-area p-8 max-w-4xl mx-auto bg-white my-8 shadow-lg">
                <header className="text-center mb-10 border-b pb-6">
                    <h1 className="text-4xl font-bold text-slate-900">مخطط تدفق العمليات وتحليل المخاطر</h1>
                    <p className="text-slate-600 mt-2 text-lg">المنتج: <span className="font-bold">{product?.name || 'غير محدد'}</span></p>
                    <p className="text-slate-500 mt-1">الشركة: {companyInfo.companyName}</p>
                    <p className="text-slate-500 text-sm">تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
                </header>

                <div className="space-y-8">
                    {flow?.steps.map((step) => {
                        const analysis = step.hazardAnalysis;
                        const controlPointType = analysis?.controlPointType || 'PRP';

                        const typeText = controlPointType === 'CCP' ? 'نقطة تحكم حرجة' : controlPointType === 'oPRP' ? 'برنامج أولي تشغيلي' : 'برنامج أولي';
                        const typeColor = 
                            controlPointType === 'CCP' ? 'bg-red-100 text-red-800' :
                            controlPointType === 'oPRP' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800';

                        return (
                            <div key={step.id} className="page-break border-t-2 border-slate-200 pt-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-xl bg-slate-700 text-white rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">{step.stepNumber}</span>
                                        <h3 className="font-bold text-slate-800 text-xl">{step.description}</h3>
                                    </div>
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${typeColor}`}>{typeText}</span>
                                </div>
                                
                                {analysis ? (
                                    <div className="space-y-4 pr-4">
                                        <div>
                                            <h4 className="font-semibold text-slate-700 text-base mb-2">1. تحليل المخاطر</h4>
                                            <table className="w-full text-sm border-collapse border border-slate-300">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="p-2 border border-slate-300 text-right w-1/3">المخاطر</th>
                                                        <th className="p-2 border border-slate-300 text-right w-1/3">السبب</th>
                                                        <th className="p-2 border border-slate-300 text-right w-1/3">إجراء التحكم</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="p-2 border border-slate-300 align-top">
                                                            {analysis.hazards.map((h, i) => <div key={i} className="mb-1">{h.description} <span className="text-xs text-slate-500">({h.type})</span></div>)}
                                                        </td>
                                                        <td className="p-2 border border-slate-300 align-top">{analysis.cause}</td>
                                                        <td className="p-2 border border-slate-300 align-top">{analysis.controlMeasures}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        <div>
                                            <h4 className="font-semibold text-slate-700 text-base mb-2">2. تبرير تحديد نقطة التحكم</h4>
                                            <DecisionTreeVisualizer justification={analysis.justification} controlPointType={controlPointType} />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="pr-4 text-sm text-slate-500">لم يتم تحليل المخاطر لهذه المرحلة.</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PrintableProcessFlow;
