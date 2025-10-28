import React from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { PrinterIcon } from '../components/icons/PrinterIcon.tsx';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon.tsx';
import MarkdownRenderer from '../components/MarkdownRenderer.tsx';

const PrintableRecallPlan: React.FC = () => {
    const { 
        printableRecallPlanBatchNumber, 
        setPrintableRecallPlanBatchNumber, 
        companyInfo,
        recallProcesses,
        team
    } = useAppContext();

    if (!printableRecallPlanBatchNumber) {
        return (
            <div className="p-8">
                <p>لا يوجد خطة لعرضها.</p>
                <button onClick={() => setPrintableRecallPlanBatchNumber(null)} className="mt-4 bg-slate-500 text-white px-4 py-2 rounded">العودة</button>
            </div>
        );
    }
    
    const recallProcess = recallProcesses.find(p => p.batchNumber === printableRecallPlanBatchNumber);
    // This is a placeholder for a feature where AI generates a formal plan text
    const planContent = recallProcess ? `## خطة استدعاء المنتج للتشغيلة ${recallProcess.batchNumber}\n\n**السبب:** ${recallProcess.reason}` : "";
    
    const actionTakenMap: Record<string, string> = {
        pending: 'قيد الانتظار',
        isolated: 'تم العزل',
        disposed: 'تم الإتلاف',
        returned: 'تم الإرجاع'
    };
    
    const statusMap: Record<string, string> = {
        todo: 'جديدة',
        inprogress: 'قيد التنفيذ',
        done: 'مكتملة'
    };

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
                <h1 className="text-lg font-semibold">استعراض وطباعة خطة الاستدعاء</h1>
                <div className="flex gap-4">
                     <button onClick={() => setPrintableRecallPlanBatchNumber(null)} className="flex items-center gap-2 bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600">
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
                    <h1 className="text-4xl font-bold text-slate-900">خطة استدعاء منتج</h1>
                    <p className="text-slate-600 mt-2 text-lg">التشغيلة: <span className="font-bold font-mono">{printableRecallPlanBatchNumber}</span></p>
                    <p className="text-slate-500 mt-1">الشركة: {companyInfo.companyName}</p>
                    <p className="text-slate-500 text-sm">تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
                </header>
                 
                {renderSection('1. معلومات الاستدعاء الأساسية', (
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><strong className="text-slate-800">سبب الاستدعاء:</strong> {recallProcess?.reason || 'غير محدد'}</p>
                        <p><strong className="text-slate-800">تاريخ البدء:</strong> {recallProcess ? new Date(recallProcess.initiatedAt).toLocaleString('ar-SA') : 'غير محدد'}</p>
                    </div>
                ))}
                
                {planContent && renderSection('2. خطة الاستدعاء', (
                    <MarkdownRenderer content={planContent} />
                ))}

                {recallProcess && recallProcess.team.length > 0 && renderSection('3. فريق الاستدعاء', (
                    <table className="w-full text-sm text-left border-collapse border border-slate-300">
                        <thead className="bg-slate-100">
                            <tr className="border-b border-slate-300">
                                <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">الاسم</th>
                                <th className="p-2 font-semibold text-slate-700">الدور</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recallProcess.team.map(member => {
                                const teamMember = team.find(t => t.id === member.memberId);
                                return (
                                    <tr key={member.memberId} className="border-b border-slate-200">
                                        <td className="p-2 border-r border-slate-300 text-slate-800">{teamMember?.name || 'عضو غير معروف'}</td>
                                        <td className="p-2 text-slate-800">{member.role}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ))}
                
                {recallProcess && recallProcess.affectedCustomers.length > 0 && renderSection('4. العملاء المتأثرون والإجراءات', (
                    <table className="w-full text-sm text-left border-collapse border border-slate-300">
                        <thead className="bg-slate-100">
                            <tr className="border-b border-slate-300">
                                <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">العميل</th>
                                <th className="p-2 border-r border-slate-300 text-center font-semibold text-slate-700">الكمية المشحونة</th>
                                <th className="p-2 border-r border-slate-300 text-center font-semibold text-slate-700">الكمية المستعادة</th>
                                <th className="p-2 font-semibold text-slate-700">الإجراء المتخذ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recallProcess.affectedCustomers.map(customer => (
                                <tr key={customer.customerId} className="border-b border-slate-200">
                                    <td className="p-2 border-r border-slate-300 text-slate-800">{customer.customerName}</td>
                                    <td className="p-2 border-r border-slate-300 text-center text-slate-800">{customer.quantity}</td>
                                    <td className="p-2 border-r border-slate-300 text-center text-slate-800">{customer.quantityRestored || 0}</td>
                                    <td className="p-2 text-slate-800">{actionTakenMap[customer.actionTaken] || customer.actionTaken}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ))}

                {recallProcess && (recallProcess.processingTasks.length > 0 || recallProcess.disposalTasks.length > 0) && renderSection('5. خطة العمل والمهام', (
                    <table className="w-full text-sm text-left border-collapse border border-slate-300">
                        <thead className="bg-slate-100">
                            <tr className="border-b border-slate-300">
                                <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">المهمة</th>
                                <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">النوع</th>
                                <th className="p-2 border-r border-slate-300 font-semibold text-slate-700">المسؤول</th>
                                <th className="p-2 font-semibold text-slate-700">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...recallProcess.processingTasks.map(t => ({...t, type: 'معالجة'})), ...recallProcess.disposalTasks.map(t => ({...t, type: 'إتلاف'}))].map(task => {
                                const assignedMember = team.find(t => t.id === task.assignedTo);
                                return (
                                    <tr key={task.id} className="border-b border-slate-200">
                                        <td className="p-2 border-r border-slate-300 text-slate-800">{task.title}</td>
                                        <td className="p-2 border-r border-slate-300 text-slate-800">{task.type}</td>
                                        <td className="p-2 border-r border-slate-300 text-slate-800">{assignedMember?.name || 'غير معين'}</td>
                                        <td className="p-2 text-slate-800">{statusMap[task.status] || task.status}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ))}

            </div>
        </div>
    );
};

export default PrintableRecallPlan;