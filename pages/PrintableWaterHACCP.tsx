
import React from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { PrinterIcon } from '../components/icons/PrinterIcon.tsx';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon.tsx';
import MarkdownRenderer from '../components/MarkdownRenderer.tsx';

const PrintableWaterHACCP: React.FC = () => {
    const { printableWaterHACCP, setPrintableWaterHACCP, waterHaccpPlan, companyInfo } = useAppContext();

    if (!waterHaccpPlan) {
        return (
            <div className="p-8">
                <p>لا توجد خطة لعرضها. يرجى إنشاء خطة أولاً.</p>
                <button onClick={() => setPrintableWaterHACCP(false)} className="mt-4 bg-slate-500 text-white px-4 py-2 rounded">العودة</button>
            </div>
        );
    }
    
    const renderSection = (title: string, children: React.ReactNode) => (
        <div className="mb-8 page-break">
            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-emerald-500 pb-2 mb-4">{title}</h2>
            {children}
        </div>
    );
    
    const sourceMap = {
        public_network: 'شبكة المياه العامة',
        well: 'بئر خاص',
        tanker: 'صهريج مياه',
        bottled: 'مياه معبأة',
    };

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
                <h1 className="text-lg font-semibold">استعراض وطباعة خطة الهاسب للمياه</h1>
                <div className="flex gap-4">
                     <button onClick={() => setPrintableWaterHACCP(false)} className="flex items-center gap-2 bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600">
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
                    <h1 className="text-4xl font-bold text-slate-900">خطة تحليل المخاطر ونقاط التحكم الحرجة (HACCP) للمياه</h1>
                    <p className="text-slate-500 mt-1">الشركة: {companyInfo.companyName}</p>
                    <p className="text-slate-500 text-sm">تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
                </header>

                {renderSection('المعلومات الأساسية', (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div><h3 className="font-semibold">مصدر المياه:</h3><p className="text-slate-700">{sourceMap[waterHaccpPlan.source]}</p></div>
                        {waterHaccpPlan.sketchUrl && <div><h3 className="font-semibold">المخطط المرفوع:</h3><img src={waterHaccpPlan.sketchUrl} alt="مخطط المنشأة" className="mt-2 border rounded-md max-h-40" /></div>}
                    </div>
                ))}

                {renderSection('الاختبارات الدورية المطلوبة', (
                     <table className="min-w-full text-sm border-collapse border">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th className="px-2 py-2 border">الاختبار</th>
                                <th className="px-2 py-2 border">التكرار</th>
                                <th className="px-2 py-2 border">آخر فحص</th>
                            </tr>
                        </thead>
                        <tbody>
                            {waterHaccpPlan.requiredTests.map(test => (
                                <tr key={test.id} className="bg-white border-b">
                                    <td className="px-2 py-2 border font-semibold">{test.name}</td>
                                    <td className="px-2 py-2 border">{test.frequency}</td>
                                    <td className="px-2 py-2 border">{test.lastCheck ? new Date(test.lastCheck).toLocaleDateString('ar-SA') : 'لم يتم بعد'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ))}
                
                 {renderSection('توصيات المعالجة', (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div><h3 className="font-semibold text-lg mb-2">الفلاتر الموصى بها</h3><ul className="list-disc list-inside space-y-2">{waterHaccpPlan.recommendedFilters.map(f => <li key={f.id}><strong>{f.type}:</strong> {f.maintenanceSchedule}</li>)}</ul></div>
                        <div><h3 className="font-semibold text-lg mb-2">المواد الكيميائية</h3><ul className="list-disc list-inside space-y-2">{waterHaccpPlan.chemicals.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
                    </div>
                ))}
                
                {renderSection('تفاصيل خطة الهاسب', (
                    <MarkdownRenderer content={waterHaccpPlan.haccpDetails} />
                ))}

            </div>
        </div>
    );
};

export default PrintableWaterHACCP;
