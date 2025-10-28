
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TargetIcon } from '../../components/icons/TargetIcon';

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


const CCPDetermination: React.FC = () => {
    const { products, processFlows, ccpDeterminations, generateAndSaveCCPs } = useAppContext();
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);

    const ccpResult = ccpDeterminations[selectedProductId];

    useEffect(() => {
        if (ccpResult) {
            setParsedData(parseMarkdownTable(ccpResult));
        } else {
            setParsedData([]);
        }
    }, [ccpResult]);

    const handleGenerate = async () => {
        if (!selectedProductId) return;
        setIsLoading(true);
        await generateAndSaveCCPs(selectedProductId);
        setIsLoading(false);
    };

    const analyzedProducts = useMemo(() => {
        return products.map(p => {
            const flow = processFlows.find(f => f.productId === p.id);
            const isAnalyzed = !!flow && flow.steps.length > 0 && flow.steps.every(step => step.hazardAnalysis);
            return { ...p, isAnalyzed };
        });
    }, [products, processFlows]);


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">المرحلة 2: تحديد نقاط التحكم الحرجة (CCPs)</h2>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="max-w-4xl mx-auto">
                    <p className="text-slate-600 mb-6">
                        في هذه المرحلة، سنستخدم نتائج تحليل المخاطر لتحديد أي من خطوات العملية تعتبر نقاط تحكم حرجة (CCPs) — وهي الخطوات التي لا يمكن الاستغناء عنها لضمان سلامة المنتج.
                    </p>

                    <div className="mb-6 flex items-end gap-4">
                        <div className="flex-grow">
                            <label htmlFor="product-select" className="block text-sm font-medium text-slate-700 mb-2">
                                اختر المنتج الذي تم تحليل مخاطره:
                            </label>
                            <select
                                id="product-select"
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="" disabled>-- اختر منتجاً --</option>
                                {analyzedProducts.map(product => (
                                    <option key={product.id} value={product.id} disabled={!product.isAnalyzed}>
                                        {product.name} {!product.isAnalyzed ? '(تحليل المخاطر غير مكتمل)' : ''}
                                    </option>
                                ))}
                            </select>
                            {analyzedProducts.every(p => !p.isAnalyzed) && (
                                <p className="text-xs text-slate-500 mt-2">
                                    يجب أولاً إكمال "المرحلة 1: تحليل المخاطر" لمنتج واحد على الأقل.
                                </p>
                            )}
                        </div>
                        {selectedProductId && analyzedProducts.find(p => p.id === selectedProductId)?.isAnalyzed && (
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="bg-emerald-600 text-white px-6 py-2.5 rounded-md hover:bg-emerald-700 transition disabled:bg-slate-400 flex items-center gap-2"
                            >
                                <TargetIcon className="h-5 w-5"/>
                                {isLoading ? 'جاري التحديد...' : (ccpResult ? 'إعادة التحديد' : 'تحديد نقاط التحكم الحرجة')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-dashed rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-600">تطبيق شجرة القرارات لتحديد النقاط الحرجة...</p>
                </div>
            )}

            {parsedData.length > 0 && !isLoading && (
                <div className="bg-slate-50 p-8 rounded-lg mt-6">
                     <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">نتائج تحديد نقاط التحكم الحرجة لـ "{products.find(p=>p.id === selectedProductId)?.name}"</h3>
                     <div className="space-y-4 max-w-4xl mx-auto">
                        {parsedData.map((row, index) => {
                            const isCCP = row['هل هي CCP؟ (نعم/لا)']?.toLowerCase().includes('نعم');
                            return (
                                <div key={index} className={`p-6 rounded-lg shadow border-l-4 ${isCCP ? 'border-red-500 bg-red-50' : 'border-slate-400 bg-white'}`}>
                                    <h4 className="text-lg font-bold text-slate-800 mb-3">{row['خطوة العملية']}</h4>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <p className="font-semibold text-slate-600">الخطر الكبير</p>
                                            <p className="text-slate-800">{row['الخطر الكبير']}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-600">هل هي CCP؟</p>
                                            <p className={`font-bold ${isCCP ? 'text-red-600' : 'text-green-600'}`}>{row['هل هي CCP؟ (نعم/لا)']}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-600">التبرير</p>
                                            <p className="text-slate-800">{row['التبرير (باستخدام أسئلة شجرة القرارات)']}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CCPDetermination;
