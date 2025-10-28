
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { WrenchIcon } from '../../components/icons/WrenchIcon';

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

const CorrectiveActions: React.FC = () => {
    const { products, criticalLimits, correctiveActions, generateAndSaveCorrectiveActions } = useAppContext();
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);

    const actionsResult = correctiveActions[selectedProductId];

    useEffect(() => {
        if (actionsResult) {
            setParsedData(parseMarkdownTable(actionsResult));
        } else {
            setParsedData([]);
        }
    }, [actionsResult]);

    const handleGenerate = async () => {
        if (!selectedProductId) return;
        setIsLoading(true);
        await generateAndSaveCorrectiveActions(selectedProductId);
        setIsLoading(false);
    };

    const limitsAvailable = criticalLimits[selectedProductId];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">المرحلة 5: وضع الإجراءات التصحيحية</h2>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="max-w-4xl mx-auto">
                    <p className="text-slate-600 mb-6">تحديد الإجراءات التي يجب اتخاذها عند حدوث انحراف عن الحدود الحرجة في إحدى نقاط التحكم.</p>
                    <div className="mb-6 flex items-end gap-4">
                        <div className="flex-grow">
                            <label htmlFor="product-select" className="block text-sm font-medium text-slate-700 mb-2">اختر المنتج:</label>
                            <select id="product-select" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white shadow-sm focus:ring-emerald-500 focus:border-emerald-500">
                                <option value="" disabled>-- اختر منتجاً --</option>
                                {products.filter(p => criticalLimits[p.id]).map(product => (<option key={product.id} value={product.id}>{product.name}</option>))}
                            </select>
                            {Object.keys(criticalLimits).length === 0 && (<p className="text-xs text-slate-500 mt-2">يجب أولاً إكمال "المرحلة 3: وضع الحدود الحرجة".</p>)}
                        </div>
                        {limitsAvailable && (
                            <button onClick={handleGenerate} disabled={isLoading} className="bg-emerald-600 text-white px-6 py-2.5 rounded-md hover:bg-emerald-700 transition disabled:bg-slate-400 flex items-center gap-2">
                                <WrenchIcon className="h-5 w-5"/>
                                {isLoading ? 'جاري الإنشاء...' : (actionsResult ? 'إعادة الإنشاء' : 'إنشاء الإجراءات التصحيحية')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {isLoading && (<div className="flex flex-col items-center justify-center h-64"><div className="w-12 h-12 border-4 border-emerald-500 border-dashed rounded-full animate-spin"></div><p className="mt-4 text-slate-600">يقوم الذكاء الاصطناعي بإنشاء الإجراءات التصحيحية...</p></div>)}
            
            {parsedData.length > 0 && !isLoading && (
                 <div className="bg-slate-50 p-8 rounded-lg mt-6">
                     <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">الإجراءات التصحيحية المقترحة لـ "{products.find(p=>p.id === selectedProductId)?.name}"</h3>
                     <div className="space-y-4 max-w-4xl mx-auto">
                        {parsedData.map((row, index) => (
                             <div key={index} className="p-6 rounded-lg shadow border-l-4 border-orange-500 bg-white">
                                <h4 className="text-lg font-bold text-slate-800 mb-3">{row['نقطة التحكم الحرجة (CCP)']}</h4>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="font-semibold text-slate-600">الانحراف</p>
                                        <p className="text-slate-800">{row['الانحراف (عندما لا يتم الالتزام بالحد الحرج)']}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-600">الإجراء التصحيحي الفوري</p>
                                        <p className="text-slate-800">{row['الإجراء التصحيحي الفوري']}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-600">الإجراء لمنع التكرار</p>
                                        <p className="text-slate-800">{row['الإجراء لمنع التكرار']}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                                        <div>
                                            <p className="font-semibold text-slate-600">من المسؤول؟</p>
                                            <p className="text-slate-800">{row['من المسؤول؟']}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-600">السجل المطلوب</p>
                                            <p className="text-slate-800">{row['السجل المطلوب']}</p>
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
export default CorrectiveActions;