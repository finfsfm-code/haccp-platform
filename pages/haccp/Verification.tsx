
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ClipboardIcon } from '../../components/icons/ClipboardIcon';

const parseMarkdownTable = (markdown: string): Record<string, string>[] => {
    if (!markdown) return [];
    const lines = markdown.trim().split('\n');
    const tableLines = lines.filter(line => line.trim().startsWith('|') && line.trim().endsWith('|'));
    
    if (tableLines.length < 3) return [];

    const headerLine = tableLines[0];
    const headers = headerLine.slice(1, -1).split('|').map(h => h.trim());

    const dataLines = tableLines.slice(2);

    return dataLines.map(rowLine => {
        const cells = rowLine.slice(1, -1).split('|').map(c => c.trim());
        const rowObject: Record<string, string> = {};
        headers.forEach((header, index) => {
            if (header) {
                rowObject[header] = cells[index] || '';
            }
        });
        return rowObject;
    });
};

const Verification: React.FC = () => {
    const { products, ccpDeterminations, verificationProcedures, generateAndSaveVerification } = useAppContext();
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);

    const verificationResult = verificationProcedures[selectedProductId];

    useEffect(() => {
        if (verificationResult) {
            setParsedData(parseMarkdownTable(verificationResult));
        } else {
            setParsedData([]);
        }
    }, [verificationResult]);


    const handleGenerate = async () => {
        if (!selectedProductId) return;
        setIsLoading(true);
        await generateAndSaveVerification(selectedProductId);
        setIsLoading(false);
    };

    const ccpAvailable = ccpDeterminations[selectedProductId];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">المرحلة 6: وضع إجراءات التحقق</h2>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="max-w-4xl mx-auto">
                    <p className="text-slate-600 mb-6">تحديد الأنشطة التي تؤكد أن نظام الهاسب يعمل بفعالية. هذا يختلف عن الرصد اليومي.</p>
                    <div className="mb-6 flex items-end gap-4">
                        <div className="flex-grow">
                            <label htmlFor="product-select" className="block text-sm font-medium text-slate-700 mb-2">اختر المنتج:</label>
                            <select id="product-select" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white shadow-sm focus:ring-emerald-500 focus:border-emerald-500">
                                <option value="" disabled>-- اختر منتجاً --</option>
                                {products.filter(p => ccpDeterminations[p.id]).map(product => (<option key={product.id} value={product.id}>{product.name}</option>))}
                            </select>
                            {Object.keys(ccpDeterminations).length === 0 && (<p className="text-xs text-slate-500 mt-2">يجب أولاً إكمال "المرحلة 2: تحديد نقاط التحكم الحرجة".</p>)}
                        </div>
                        {ccpAvailable && (
                            <button onClick={handleGenerate} disabled={isLoading} className="bg-emerald-600 text-white px-6 py-2.5 rounded-md hover:bg-emerald-700 transition disabled:bg-slate-400 flex items-center gap-2">
                                <ClipboardIcon className="h-5 w-5"/>
                                {isLoading ? 'جاري الإنشاء...' : (verificationResult ? 'إعادة الإنشاء' : 'إنشاء إجراءات التحقق')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {isLoading && (<div className="flex flex-col items-center justify-center h-64"><div className="w-12 h-12 border-4 border-emerald-500 border-dashed rounded-full animate-spin"></div><p className="mt-4 text-slate-600">يقوم الذكاء الاصطناعي بإنشاء إجراءات التحقق...</p></div>)}
            
            {parsedData.length > 0 && !isLoading && (
                 <div className="bg-slate-50 p-8 rounded-lg mt-6">
                     <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">إجراءات التحقق المقترحة لـ "{products.find(p=>p.id === selectedProductId)?.name}"</h3>
                     <div className="space-y-4 max-w-4xl mx-auto">
                        {parsedData.map((row, index) => (
                           <div key={index} className="p-6 rounded-lg shadow border-l-4 border-purple-500 bg-white">
                                <h4 className="text-lg font-bold text-slate-800 mb-3">{row['نشاط التحقق']}</h4>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="font-semibold text-slate-600">الغرض من النشاط</p>
                                        <p className="text-slate-800">{row['الغرض من النشاط']}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
                                        <div>
                                            <p className="font-semibold text-slate-600">التكرار</p>
                                            <p className="text-slate-800">{row['التكرار']}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-600">المسؤول</p>
                                            <p className="text-slate-800">{row['المسؤول']}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-600">السجل</p>
                                            <p className="text-slate-800">{row['السجل']}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
export default Verification;