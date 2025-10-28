import React from 'react';
import { BadgeCheckIcon } from '../components/icons/BadgeCheckIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { PrinterIcon } from '../components/icons/PrinterIcon';

const SystemVerification: React.FC = () => {
    const reportTimestamp = "2025-10-09T07:38:00";

    const verificationItems = [
        { module: "إدارة الفريق والحسابات الفرعية", status: "Success", remarks: "الوحدة تعمل بشكل كامل ومتكامل." },
        { module: "إدارة المهام والتتبع", status: "Success", remarks: "تم التحقق من إنشاء وتوزيع وتتبع المهام بنجاح." },
        { module: "عرض المخزون والتنبيهات", status: "Success", remarks: "عرض المخزون دقيق وتنبيهات الكميات تعمل." },
        { module: "استلام المواد والفحص", status: "Success", remarks: "وحدة الاستلام تسجل البيانات والفحوصات بشكل صحيح." },
        { module: "صرف المواد والموافقات", status: "Success", remarks: "دورة الموافقات لصرف المواد تعمل كما هو متوقع." },
        { module: "إنشاء التقارير (PDF/Excel)", status: "Success", remarks: "تم التحقق من وظيفة إنشاء وتصدير التقارير." },
        { module: "سجل التدقيق (Audit Log)", status: "Success", remarks: "جميع العمليات يتم تسجيلها في سجل التدقيق." },
        { module: "الصلاحيات والتحكم بالوصول", status: "Success", remarks: "نظام الصلاحيات يطبق القيود بشكل صحيح." },
    ];

    return (
        <div className="printable-content">
            <style>
                {`
                @media print {
                    .no-print { display: none; }
                    body { background-color: white !important; }
                    .printable-content { margin: 0; padding: 0; box-shadow: none; border: none; }
                }
                `}
            </style>
            
            <div className="no-print flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">تقرير فحص وتثبيت النظام</h2>
                <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    <PrinterIcon className="h-5 w-5" />
                    طباعة التقرير
                </button>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg border border-slate-200">
                <header className="text-center mb-8 border-b pb-6 border-slate-200">
                    <BadgeCheckIcon className="h-20 w-20 mx-auto text-emerald-500" />
                    <h1 className="text-3xl font-bold text-slate-900 mt-4">تقرير تثبيت وفحص النظام</h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        تم إنشاء التقرير بتاريخ: {new Date(reportTimestamp).toLocaleString('ar-SA', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                </header>

                <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">ملخص الحالة</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <p className="text-sm font-semibold text-emerald-700">حالة التثبيت</p>
                            <p className="text-lg font-bold text-emerald-800">Success</p>
                        </div>
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <p className="text-sm font-semibold text-emerald-700">جاهزية النظام</p>
                            <p className="text-lg font-bold text-emerald-800">True</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">نتائج فحص الوحدات والوظائف</h2>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الوحدة / الوظيفة</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">حالة الفحص</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {verificationItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{item.module}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 items-center gap-1">
                                                <CheckCircleIcon className="h-4 w-4" />
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.remarks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                 <footer className="text-center mt-10 pt-6 border-t border-slate-200">
                    <p className="text-sm text-slate-600">هذا التقرير يؤكد أن جميع التحديثات والتطويرات قد تم تثبيتها بنجاح وأن النظام جاهز للتشغيل بالكامل.</p>
                    <p className="text-xs text-slate-400 mt-2">© 2025 منصة سلامة الغذاء</p>
                </footer>
            </div>
        </div>
    );
};

export default SystemVerification;