import React from 'react';
import { useAppContext } from '../context/AppContext';
import { PrinterIcon } from '../components/icons/PrinterIcon';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon';

const PrintableMockRecallReport: React.FC = () => {
    const { printableMockRecall, setPrintableMockRecall, products, suppliers, team } = useAppContext();

    if (!printableMockRecall) {
        return (
            <div className="p-8">
                <p>لا يوجد تقرير لعرضه. يرجى إكمال تدريب أولاً.</p>
                <button onClick={() => setPrintableMockRecall(null)} className="mt-4 bg-slate-500 text-white px-4 py-2 rounded">العودة</button>
            </div>
        );
    }
    
    const {
        targetBatchNumber,
        startTime,
        endTime,
        traceabilityResults,
        team: recallTeam,
        tasks,
        finalDecision,
        correctiveActions
    } = printableMockRecall;

    const duration = endTime ? Math.round((endTime - startTime) / 1000) : 0;
    const formatTime = (seconds: number) => `${Math.floor(seconds / 60)} دقيقة و ${seconds % 60} ثانية`;

    const productName = products.find(p => p.id === traceabilityResults.backward?.productId)?.name || 'غير معروف';

    const renderSection = (title: string, children: React.ReactNode) => (
        <div className="mb-6 page-break">
            <h2 className="text-xl font-bold text-slate-800 border-b-2 border-emerald-500 pb-2 mb-4">{title}</h2>
            {children}
        </div>
    );
    
    return (
        <div className="bg-slate-100 min-h-screen">
            <style>
                {`
                @media print {
                    .no-print { display: none; }
                    body, .printable-area { margin: 0; padding: 0; }
                    .page-break { page-break-inside: avoid; }
                }
                `}
            </style>
            <div className="no-print p-4 bg-white shadow-md flex justify-between items-center">
                <h1 className="text-lg font-semibold">تقرير تدريب الاستدعاء الوهمي</h1>
                <div className="flex gap-4">
                     <button onClick={() => setPrintableMockRecall(null)} className="flex items-center gap-2 bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600">
                        <ArrowRightIcon className="h-5 w-5"/>
                        العودة
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
                        <PrinterIcon className="h-5 w-5"/>
                        طباعة التقرير
                    </button>
                </div>
            </div>
            <div className="printable-area p-8 max-w-4xl mx-auto bg-white my-8 shadow-lg">
                <header className="text-center mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-slate-900">تقرير تدريب استدعاء وهمي</h1>
                    <p className="text-slate-600">تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
                </header>

                {renderSection('1. معلومات أساسية', (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><strong className="text-slate-800">المنتج:</strong> {productName}</p>
                        <p><strong className="text-slate-800">التشغيلة المستهدفة:</strong> <span className="font-mono">{targetBatchNumber}</span></p>
                        <p><strong className="text-slate-800">تاريخ ووقت البدء:</strong> {new Date(startTime).toLocaleString('ar-SA')}</p>
                        <p><strong className="text-slate-800">تاريخ ووقت الانتهاء:</strong> {endTime ? new Date(endTime).toLocaleString('ar-SA') : 'N/A'}</p>
                        <p className="col-span-2"><strong className="text-slate-800">إجمالي الوقت المستغرق:</strong> <span className="font-bold">{formatTime(duration)}</span></p>
                    </div>
                ))}
                
                {renderSection('2. نتائج التتبع', (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <h3 className="font-semibold mb-2 text-slate-800">التتبع للخلف (الموردين)</h3>
                            <ul className="list-disc list-inside space-y-1 text-slate-700">
                                {traceabilityResults.backward?.usedIngredients.map((ing, i) => {
                                    const product = products.find(p => p.id === traceabilityResults.backward?.productId);
                                    const ingredientInfo = product?.ingredients.find(i => i.id === ing.ingredientId);
                                    const supplier = suppliers.find(s => s.id === ingredientInfo?.supplierId);
                                    return (
                                        <li key={i}>{ingredientInfo?.name || 'مكون غير معروف'} (المورد: {supplier?.name || 'غير معروف'})</li>
                                    )
                                })}
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2 text-slate-800">التتبع للأمام (العملاء)</h3>
                            <ul className="list-disc list-inside space-y-1 text-slate-700">
                                {traceabilityResults.forward.map(order => (
                                    <li key={order.id}>{order.customer.name} (الطلب: {order.orderNumber})</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}

                {renderSection('3. فريق الاستدعاء والأدوار', (
                     <table className="w-full text-sm text-left border-collapse border border-slate-300">
                        <thead className="bg-slate-100"><tr className="border-b border-slate-300">
                            <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">الاسم</th><th className="p-2 font-semibold text-slate-700">الدور في الاستدعاء</th>
                        </tr></thead>
                        <tbody>
                        {recallTeam.map(member => {
                            const teamMember = team.find(t => t.id === member.memberId);
                            return (<tr key={member.memberId} className="border-b border-slate-200">
                                <td className="p-2 border-r border-slate-300 text-slate-800">{teamMember?.name || 'غير معروف'}</td>
                                <td className="p-2 text-slate-800">{member.role}</td>
                            </tr>);
                        })}
                        </tbody>
                    </table>
                ))}

                {renderSection('4. خطة العمل والمهام', (
                     <table className="w-full text-sm text-left border-collapse border border-slate-300">
                        <thead className="bg-slate-100"><tr className="border-b border-slate-300">
                            <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">المهمة</th><th className="p-2 border-r border-slate-300 font-semibold text-slate-700">الفئة</th><th className="p-2 font-semibold text-slate-700">المسؤول</th>
                        </tr></thead>
                        <tbody>
                        {tasks.map(task => {
                             const assignedMember = team.find(t => t.id === task.assignedTo);
                             return (<tr key={task.id} className="border-b border-slate-200">
                                <td className="p-2 border-r border-slate-300 text-slate-800">{task.title}</td>
                                <td className="p-2 border-r border-slate-300 text-slate-800">{task.category}</td>
                                <td className="p-2 text-slate-800">{assignedMember?.name || 'غير معين'}</td>
                            </tr>);
                        })}
                        </tbody>
                    </table>
                ))}
                
                {renderSection('5. القرارات النهائية والإجراءات التصحيحية', (
                    <div className="text-sm space-y-4">
                        <div>
                            <h3 className="font-semibold text-slate-800">القرار النهائي بشأن المنتج المسترجع</h3>
                            <p className="p-3 bg-slate-50 rounded mt-1 text-slate-700">{finalDecision || 'لم يحدد'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">الإجراءات التصحيحية لمنع تكرار المشكلة</h3>
                             <p className="p-3 bg-slate-50 rounded mt-1 text-slate-700">{correctiveActions || 'لم تحدد'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PrintableMockRecallReport;