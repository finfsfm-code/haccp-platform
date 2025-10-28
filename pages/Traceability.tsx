

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ProductionOrder, SalesOrder, Product, TraceabilityResult } from '../types';
import { SearchCircleIcon } from '../components/icons/SearchCircleIcon';
import { ArrowUpTrayIcon } from '../components/icons/ArrowUpTrayIcon';
import { MegaphoneIcon } from '../components/icons/MegaphoneIcon';
import Modal from '../components/Modal';

const Traceability: React.FC = () => {
    const { salesOrders, performTraceabilitySearch, initiateRecall, setActivePage, suppliers } = useAppContext();
    const [batchNumber, setBatchNumber] = useState('');
    const [result, setResult] = useState<TraceabilityResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
    const [recallReason, setRecallReason] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        if (!batchNumber.trim()) {
            setError('يرجى إدخال رقم تشغيلة.');
            return;
        }
        setIsLoading(true);

        const searchResult = await performTraceabilitySearch(batchNumber.trim());

        if (!searchResult) {
            setError(`لم يتم العثور على تشغيلة بالرقم: ${batchNumber}`);
        } else {
            setResult(searchResult);
        }
        setIsLoading(false);
    };

    const handleInitiateRecall = async () => {
        if (result && recallReason.trim()) {
            await initiateRecall(result.productionOrder.batchNumber, recallReason);
            setIsRecallModalOpen(false);
            setRecallReason('');
            // Navigate user to the new management page
            setActivePage('RecallManagement');
        }
    };


    return (
        <div>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">التتبع والاستدعاء</h2>
                <p className="text-slate-600 mb-6">أدخل رقم التشغيلة (Batch Number) لتتبع المنتج من المورد إلى العميل.</p>
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={batchNumber}
                        onChange={(e) => setBatchNumber(e.target.value)}
                        placeholder="أدخل رقم التشغيلة هنا..."
                        className="flex-grow w-full px-4 py-3 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button type="submit" className="bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 flex items-center gap-2">
                        <SearchCircleIcon className="h-6 w-6"/>
                        <span>بحث</span>
                    </button>
                </form>
            </div>

            {isLoading && <p className="text-center mt-8">جاري البحث...</p>}
            {error && <p className="text-center text-red-600 mt-8">{error}</p>}

            {result && (
                <div className="mt-8">
                    <div className="flex justify-between items-center bg-slate-800 text-white p-4 rounded-t-lg">
                        <div>
                            <h3 className="text-xl font-bold">نتائج التتبع للتشغيلة: <span className="font-mono">{result.productionOrder.batchNumber}</span></h3>
                            <p>المنتج: {result.product?.name}</p>
                        </div>
                        <button onClick={() => setIsRecallModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                            <MegaphoneIcon className="h-5 w-5"/>
                            بدء عملية استدعاء
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-200 rounded-b-lg overflow-hidden">
                        <div className="bg-white p-6">
                            <h4 className="font-bold text-lg text-slate-700 mb-4 flex items-center gap-2">
                                <ArrowUpTrayIcon className="h-6 w-6 text-blue-600 transform rotate-180"/>
                                التتبع للخلف (المواد الأولية والموردون)
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-3 py-2 text-right font-medium text-slate-600">المادة</th>
                                            <th className="px-3 py-2 text-right font-medium text-slate-600">المورد</th>
                                            <th className="px-3 py-2 text-right font-medium text-slate-600">تاريخ الاستلام</th>
                                            <th className="px-3 py-2 text-center font-medium text-slate-600">حرارة الاستلام</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {/* FIX: Correctly map over 'result.backward' which is an array of 'MaterialReceipt'. The item is now named 'receipt' and the supplier name is looked up from the context. */}
                                        {result.backward.map((receipt, index) => {
                                            const supplier = suppliers.find(s => s.id === receipt.supplierId);
                                            return (
                                                <tr key={index}>
                                                    <td className="px-3 py-2">{receipt.ingredientName} <span className="block text-xs text-slate-500 font-mono">{receipt.batchNumber}</span></td>
                                                    <td className="px-3 py-2">{supplier?.name}</td>
                                                    <td className="px-3 py-2">{new Date(receipt.receiptDate).toLocaleDateString('ar-SA')}</td>
                                                    <td className={`px-3 py-2 text-center font-mono ${receipt.temperatureCompliant ? 'text-green-700' : 'text-red-700'}`}>
                                                        {receipt.actualTemperature}°C
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-white p-6">
                            <h4 className="font-bold text-lg text-slate-700 mb-4 flex items-center gap-2">
                                <ArrowUpTrayIcon className="h-6 w-6 text-green-600"/>
                                التتبع للأمام (العملاء)
                            </h4>
                            {result.forward.length > 0 ? (
                                <ul className="space-y-2">
                                    {result.forward.map((order) => (
                                        <li key={order.id} className="p-3 bg-slate-50 rounded-md text-sm">
                                            <strong>العميل:</strong> {order.customer.name} ({order.customer.type}) <br/>
                                            <span className="text-xs text-slate-500">رقم الطلب: {order.orderNumber} | تاريخ التوصيل: {new Date(order.deliveryDate).toLocaleDateString('ar-SA')}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500 p-3 bg-slate-50 rounded-md">لم يتم شحن هذه التشغيلة لأي عميل بعد.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {result && (
                <Modal isOpen={isRecallModalOpen} onClose={() => setIsRecallModalOpen(false)} title="تأكيد بدء عملية الاستدعاء">
                    <div className="space-y-4">
                        <p>أنت على وشك بدء عملية استدعاء رسمية للتشغيلة <strong className="font-mono">{result.productionOrder.batchNumber}</strong>.</p>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">سبب الاستدعاء</label>
                            <textarea
                                value={recallReason}
                                onChange={(e) => setRecallReason(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                                placeholder="مثال: تلوث محتمل بالسالمونيلا، خطأ في الملصق الغذائي..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setIsRecallModalOpen(false)} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-md">إلغاء</button>
                            <button onClick={handleInitiateRecall} disabled={!recallReason.trim()} className="bg-red-600 text-white px-4 py-2 rounded-md disabled:bg-slate-400">تأكيد وبدء الاستدعاء</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Traceability;