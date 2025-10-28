
import React, { useState, useMemo, useRef } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { PRPKey, prpLibrary } from '../../types.ts';
import MarkdownRenderer from '../../components/MarkdownRenderer.tsx';
import { DocumentTextIcon } from '../../components/icons/DocumentTextIcon.tsx';
import { FlaskIcon } from '../../components/icons/FlaskIcon.tsx';
import { UploadIcon } from '../../components/icons/UploadIcon.tsx';

interface PRPPageProps {
    prpKey: PRPKey;
}

const PRPPage: React.FC<PRPPageProps> = ({ prpKey }) => {
    const { prpPlans, generateAndSavePRP, getCompanyBusinessType, hasPermission } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState<{ file: File, preview: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const planContent = prpPlans[prpKey];
    const businessType = getCompanyBusinessType();
    const programInfo = prpLibrary[prpKey];

    const handleGenerate = async () => {
        if (!businessType) return;
        setIsLoading(true);
        let imageData: { base64: string, mimeType: string } | undefined = undefined;
        if (image) {
            const reader = new FileReader();
            reader.readAsDataURL(image.file);
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                imageData = { base64: base64String, mimeType: image.file.type };
                await generateAndSavePRP(prpKey, businessType, imageData);
                setIsLoading(false);
            };
        } else {
            await generateAndSavePRP(prpKey, businessType);
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage({ file, preview: URL.createObjectURL(file) });
        }
    };

    const isPestControl = prpKey === 'pestControl';
    const canManage = hasPermission('prp:manage');

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
                البرنامج الأولي: {programInfo.title}
            </h2>
            
            {!planContent && !isLoading && (
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-2xl mx-auto">
                    <DocumentTextIcon className="h-16 w-16 mx-auto text-slate-300"/>
                    <h3 className="text-xl font-bold text-slate-800 mt-4">{canManage ? "لم يتم إنشاء الخطة بعد" : "الخطة غير متوفرة"}</h3>
                    <p className="text-slate-600 mt-2">
                        {canManage 
                            ? `استخدم الذكاء الاصطناعي لإنشاء خطة مخصصة لبرنامج "${programInfo.title}" تناسب نوع نشاطك التجاري.`
                            : "يرجى الطلب من مدير النظام إنشاء الخطة."
                        }
                    </p>
                    
                   {canManage && (
                    <>
                        {isPestControl && (
                            <div className="mt-6 p-4 border-2 border-dashed rounded-lg">
                                <h4 className="font-semibold text-slate-700">لخطة مكافحة آفات أفضل (اختياري)</h4>
                                <p className="text-sm text-slate-500 mt-1">ارفع صورة لمخطط المنشأة (Site Plan) ليقوم الذكاء الاصطناعي بتحليلها واقتراح أماكن توزيع المصائد.</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-3 bg-slate-100 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-200 text-sm flex items-center gap-2 mx-auto"
                                >
                                    <UploadIcon className="h-5 w-5" />
                                    {image ? `تم اختيار: ${image.file.name}` : 'اختر صورة المخطط'}
                                </button>
                                {image && <img src={image.preview} alt="Preview" className="mt-4 max-h-40 mx-auto rounded-md border" />}
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            className="mt-6 bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 transition text-lg flex items-center gap-2 mx-auto"
                        >
                            <FlaskIcon className="h-6 w-6" />
                            إنشاء الخطة الآن
                        </button>
                    </>
                   )}
                </div>
            )}
            
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-dashed rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-600">جاري إنشاء الخطة، يرجى الانتظار...</p>
                </div>
            )}

            {planContent && !isLoading && (
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <MarkdownRenderer content={planContent} />
                    {canManage && (
                        <div className="text-center mt-8 pt-6 border-t">
                            <button
                                onClick={handleGenerate}
                                className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition text-base flex items-center gap-2 mx-auto"
                            >
                                <FlaskIcon className="h-5 w-5" />
                                إعادة إنشاء الخطة
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PRPPage;
