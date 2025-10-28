

import React, { useState, useEffect } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';
// FIX: Added .ts extension to resolve module.
import { Product, Ingredient, MealCategory, CookingInstructions, ServingMethod } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';
import { PencilIcon } from '../components/icons/PencilIcon.tsx';
import { FlowChartIcon } from '../components/icons/FlowChartIcon.tsx';
// FIX: Added .tsx extension to resolve module.
import { DocumentIcon } from '../components/icons/DocumentIcon.tsx';
// FIX: Added .ts extension to resolve module.
import * as geminiService from '../services/geminiService.ts';
import { AlertTriangleIcon } from '../components/icons/AlertTriangleIcon.tsx';

const emptyProduct: Omit<Product, 'id'> = {
    name: '',
    description: '',
    barcode: '',
    sizeOrWeight: '',
    ingredients: [],
    category: 'lunch',
    allergens: [],
    preparationSteps: [],
    cookingInstructions: [],
    servingMethod: { packaging: '', servingCondition: 'immediate', hotHoldingTemperature: '', coldHoldingTemperature: '', requiresExpiryPrinting: false },
    headChefId: '',
};

const emptyIngredient: Omit<Ingredient, 'id'> = {
    name: '',
    amount: 0,
    unit: 'g',
    supplierId: '',
    reorderPoint: 0,
};

const emptyCookingStep: Omit<CookingInstructions, 'id'> = {
    temperature: '',
    time: '',
    tools: '',
    responsiblePersonId: '',
};

const Products: React.FC = () => {
    const { 
        products, 
        suppliers,
        team,
        addProduct, 
        updateProduct, 
        deleteProduct, 
        showNotification, 
        setActivePage,
        setHaccpProductIdForPlan,
        setPrintablePlanProductId,
        processFlows,
        ccpDeterminations,
        hasPermission,
        getCompanyBusinessType
    } = useAppContext();

    const businessType = getCompanyBusinessType();
    const isKitchen = businessType === 'kitchen' || businessType === 'restaurant';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [currentProductData, setCurrentProductData] = useState<Omit<Product, 'id'>>(emptyProduct);
    const [isAnalyzingAllergens, setIsAnalyzingAllergens] = useState(false);

    useEffect(() => {
        const ingredientNames = currentProductData.ingredients
            ?.map(i => i.name)
            .filter(name => name?.trim() !== '');

        if (!ingredientNames || ingredientNames.length === 0) {
            setCurrentProductData(p => ({ ...p, allergens: [] }));
            return;
        }

        const handler = setTimeout(async () => {
            setIsAnalyzingAllergens(true);
            try {
                const allergens = await geminiService.analyzeAllergens(ingredientNames);
                setCurrentProductData(p => ({ ...p, allergens: allergens }));
            } catch (error) {
                console.error("Allergen analysis failed:", error);
                showNotification('فشل تحليل مسببات الحساسية.', 'error');
            } finally {
                setIsAnalyzingAllergens(false);
            }
        }, 1500); // Debounce for 1.5s

        return () => {
            clearTimeout(handler);
        };
    }, [JSON.stringify(currentProductData.ingredients?.map(i => i.name))]);
    
    // Effect for smart packaging suggestions
    useEffect(() => {
        if (!isModalOpen) return;
        const servingCondition = currentProductData.servingMethod?.servingCondition;
        let suggestion = '';
        let requiresPrinting = false;

        if (servingCondition === 'immediate') {
            suggestion = 'صحن تقديم';
        } else if (servingCondition === 'internal_transport') {
            suggestion = 'تغليف بنايلون حراري';
        } else if (servingCondition === 'external_transport') {
            suggestion = 'علب بلاستيك غذائي محكمة الغلق';
            requiresPrinting = true;
        }

        // Only update if the packaging is empty or was a previous suggestion
        const previousSuggestions = ['صحن تقديم', 'تغليف بنايلون حراري', 'علب بلاستيك غذائي محكمة الغلق', ''];
        if (previousSuggestions.includes(currentProductData.servingMethod?.packaging || '')) {
             handleNestedChange('servingMethod', 'packaging', suggestion);
        }
        handleNestedChange('servingMethod', 'requiresExpiryPrinting', requiresPrinting);

    }, [currentProductData.servingMethod?.servingCondition, isModalOpen]);


    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setCurrentProductData({
                ...emptyProduct,
                ...JSON.parse(JSON.stringify(product)), // Deep copy
                cookingInstructions: product.cookingInstructions || [],
            });
        } else {
            setEditingProduct(null);
            setCurrentProductData(emptyProduct);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setCurrentProductData(emptyProduct);
    };

    const handleSave = async () => {
        if (!currentProductData.name) {
            showNotification('يرجى تعبئة اسم المنتج/الوجبة.', 'error');
            return;
        }

        if (editingProduct) {
            await updateProduct({ ...editingProduct, ...currentProductData });
            showNotification('تم تحديث الوجبة بنجاح!', 'success');
        } else {
            await addProduct(currentProductData);
            showNotification('تمت إضافة الوجبة بنجاح!', 'success');
        }
        handleCloseModal();
    };
    
    const handleFieldChange = (field: keyof Omit<Product, 'id'>, value: any) => {
        setCurrentProductData(p => ({ ...p, [field]: value }));
    };

    // FIX: Correctly update nested state for `servingMethod` in a type-safe way to resolve incorrect type inference for the state update, and ensure all required properties are present.
    const handleNestedChange = (section: 'servingMethod', field: keyof ServingMethod, value: any) => {
        setCurrentProductData(p => ({
            ...p,
            [section]: {
                // Provide defaults for all required fields to satisfy the ServingMethod type
                packaging: p[section]?.packaging ?? '',
                servingCondition: p[section]?.servingCondition ?? 'immediate',
                requiresExpiryPrinting: p[section]?.requiresExpiryPrinting ?? false,
                ...p[section], // Spread existing values, overwriting defaults
                [field]: value, // Apply the new change
            }
        }));
    };

    const handleIngredientChange = (index: number, field: keyof Omit<Ingredient, 'id'>, value: string | number) => {
        const updatedIngredients = [...(currentProductData.ingredients ?? [])];
        (updatedIngredients[index] as any)[field] = value;
        setCurrentProductData(p => ({ ...p, ingredients: updatedIngredients }));
    };
    
    const handleAddIngredient = () => {
        const newIngredient: Ingredient = { ...emptyIngredient, id: `new_${Date.now()}`};
        setCurrentProductData(p => ({...p, ingredients: [...(p.ingredients ?? []), newIngredient]}));
    };

    const handleRemoveIngredient = (index: number) => {
        setCurrentProductData(p => ({ ...p, ingredients: p.ingredients?.filter((_, i) => i !== index) }));
    };
    
    const handlePrepStepChange = (index: number, value: string) => {
        const updatedSteps = [...(currentProductData.preparationSteps ?? [])];
        updatedSteps[index] = value;
        setCurrentProductData(p => ({ ...p, preparationSteps: updatedSteps }));
    };

    const handleAddPrepStep = () => {
        setCurrentProductData(p => ({...p, preparationSteps: [...(p.preparationSteps ?? []), '']}));
    };

    const handleRemovePrepStep = (index: number) => {
        setCurrentProductData(p => ({ ...p, preparationSteps: p.preparationSteps?.filter((_, i) => i !== index) }));
    };

    const handleCookingStepChange = (index: number, field: keyof Omit<CookingInstructions, 'id'>, value: string) => {
        const updatedSteps = [...(currentProductData.cookingInstructions ?? [])];
        (updatedSteps[index] as any)[field] = value;
        setCurrentProductData(p => ({...p, cookingInstructions: updatedSteps}));
    };

    const handleAddCookingStep = () => {
        const newStep: CookingInstructions = { ...emptyCookingStep, id: `cook_${Date.now()}` };
        setCurrentProductData(p => ({ ...p, cookingInstructions: [...(p.cookingInstructions ?? []), newStep] }));
    };

    const handleRemoveCookingStep = (index: number) => {
        setCurrentProductData(p => ({ ...p, cookingInstructions: p.cookingInstructions?.filter((_, i) => i !== index) }));
    };
    
    const isHaccpPlanComplete = (productId: string) => {
        const flow = processFlows.find(f => f.productId === productId);
        return !!flow && flow.steps.length > 0 && flow.steps.every(s => s.hazardAnalysis) && !!ccpDeterminations[productId];
    };
    
    const categoryMap: Record<MealCategory, string> = {
        breakfast: 'الإفطار',
        lunch: 'الغداء',
        dinner: 'العشاء',
        coffee_break: 'كوفي بريك',
        desserts: 'الحلويات',
        banquets: 'الولائم',
        custom: 'وجبات مخصصة',
    };
    
    const darkInputStyle = "w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md placeholder-slate-400";
    const lightSelectStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800";

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{isKitchen ? 'إدارة الوجبات (المنيو)' : 'إدارة المنتجات'}</h2>
                {hasPermission('product:create') && (
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition">
                        <PlusIcon className="h-5 w-5" />
                        {isKitchen ? 'إضافة وجبة/صنف' : 'إضافة منتج'}
                    </button>
                )}
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
                {products.length === 0 ? <p className="text-slate-500 text-center">لم تتم إضافة أي {isKitchen ? 'وجبات' : 'منتجات'} بعد.</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(p => (
                            <div key={p.id} className="border rounded-lg shadow-sm flex flex-col bg-slate-50">
                                <div className="p-4 flex-grow">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg text-slate-800">{p.name}</h3>
                                        {isKitchen && p.category && <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">{categoryMap[p.category]}</span>}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">{p.description}</p>
                                    <h4 className="text-sm font-semibold text-slate-700 mt-3">المكونات:</h4>
                                    <ul className="text-xs text-slate-600 list-disc list-inside mt-1 space-y-1">
                                        {p.ingredients.slice(0, 4).map(ing => <li key={ing.id}>{ing.name} ({ing.amount} {ing.unit})</li>)}
                                        {p.ingredients.length > 4 && <li>...والمزيد</li>}
                                    </ul>
                                </div>
                                <div className="p-3 bg-slate-100 border-t flex items-center justify-end gap-2">
                                    <button onClick={() => { setHaccpProductIdForPlan(p.id); setActivePage('ProcessFlow'); }} className="text-slate-600 hover:text-blue-700 p-1.5 rounded-full hover:bg-slate-200 transition" title="مخطط العمليات"><FlowChartIcon className="h-5 w-5"/></button>
                                    <button onClick={() => { setPrintablePlanProductId(p.id); }} disabled={!isHaccpPlanComplete(p.id)} className="text-slate-600 hover:text-emerald-700 p-1.5 rounded-full hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed" title={isKitchen ? "نظام الهاسب للوجبة" : "عرض وطباعة خطة الهاسب"}><DocumentIcon className="h-5 w-5"/></button>
                                    <div className="border-l h-5 mx-1"></div>
                                    {hasPermission('product:edit') && <button onClick={() => handleOpenModal(p)} className="text-slate-600 hover:text-blue-700 p-1.5 rounded-full hover:bg-slate-200 transition" title="تعديل"><PencilIcon className="h-5 w-5"/></button>}
                                    {hasPermission('product:delete') && <button onClick={() => deleteProduct(p.id)} className="text-slate-600 hover:text-red-700 p-1.5 rounded-full hover:bg-slate-200 transition" title="حذف"><TrashIcon className="h-5 w-5"/></button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isKitchen ? (
                 <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? "تعديل الوجبة" : "إضافة وجبة جديدة"}>
                    <div className="space-y-6 text-right">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select value={currentProductData.category} onChange={e => handleFieldChange('category', e.target.value as MealCategory)} className="w-full px-4 py-3 bg-white text-slate-800 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                {Object.entries(categoryMap).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                            </select>
                            <input type="text" placeholder="اسم الوجبة" value={currentProductData.name} onChange={e => handleFieldChange('name', e.target.value)} className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-600 rounded-md placeholder-slate-400" />
                        </div>
                        <textarea placeholder="وصف الوجبة" value={currentProductData.description} onChange={e => handleFieldChange('description', e.target.value)} className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-600 rounded-md placeholder-slate-400" rows={2}/>
                        
                        {/* Ingredients */}
                        <fieldset className="p-4 border-t-2 border-emerald-500"><legend className="px-2 font-bold text-lg">المكونات</legend>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {currentProductData.ingredients?.map((ing, index) => (
                                    <div key={ing.id} className="flex flex-wrap items-center gap-2 p-2 bg-slate-100 rounded-md">
                                        <button onClick={() => handleRemoveIngredient(index)} className="text-red-500 hover:text-red-700 p-2"><TrashIcon className="h-5 w-5"/></button>
                                        <div className="flex-1 min-w-[120px]"><select value={ing.supplierId} onChange={e => handleIngredientChange(index, 'supplierId', e.target.value)} className={`${lightSelectStyle} text-xs`}><option value="">اختر مورداً</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                                        <div className="w-24"><input type="number" min="0" value={ing.amount} onChange={e => handleIngredientChange(index, 'amount', Number(e.target.value))} className={darkInputStyle} placeholder="الكمية" /></div>
                                        <div className="w-28"><select value={ing.unit} onChange={e => handleIngredientChange(index, 'unit', e.target.value)} className={lightSelectStyle}><option value="g">جرام</option><option value="kg">كيلو</option><option value="ml">مل</option><option value="l">لتر</option><option value="piece">قطعة / حبة</option></select></div>
                                        <div className="w-28"><input type="number" min="0" value={ing.reorderPoint || ''} onChange={e => handleIngredientChange(index, 'reorderPoint', Number(e.target.value))} placeholder="إعادة الطلب" className={darkInputStyle} title="نقطة إعادة الطلب" /></div>
                                        <div className="flex-1 min-w-[150px]"><input type="text" value={ing.name} onChange={e => handleIngredientChange(index, 'name', e.target.value)} placeholder="اسم المكون" className={darkInputStyle}/></div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleAddIngredient} className="text-sm text-emerald-600 hover:underline mt-2">+ إضافة مكون</button>
                        </fieldset>

                        {/* Allergens */}
                        <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-md">
                            <h4 className="font-semibold text-amber-800 flex items-center gap-2"><AlertTriangleIcon className="h-5 w-5"/> مسببات الحساسية (تحليل تلقائي)</h4>
                            {isAnalyzingAllergens ? <p className="text-sm text-slate-500 animate-pulse">جاري التحليل...</p> : 
                             currentProductData.allergens && currentProductData.allergens.length > 0 ? 
                             <div className="flex flex-wrap gap-2 mt-2">{currentProductData.allergens.map(a => <span key={a} className="bg-amber-200 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">{a}</span>)}</div> : 
                             <p className="text-sm text-slate-500 mt-1">لم يتم تحديد مسببات حساسية شائعة.</p>
                            }
                        </div>

                        {/* Prep Steps */}
                        <fieldset className="p-4 border-t-2 border-emerald-500"><legend className="px-2 font-bold text-lg">خطوات التحضير</legend>
                            <div className="space-y-2">
                                {currentProductData.preparationSteps?.map((step, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="font-semibold">{index+1}.</span>
                                        <input type="text" value={step} onChange={e => handlePrepStepChange(index, e.target.value)} className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded-md" />
                                        <button onClick={() => handleRemovePrepStep(index)} className="text-red-500"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                ))}
                            </div>
                             <button onClick={handleAddPrepStep} className="text-sm text-emerald-600 hover:underline mt-2">+ إضافة خطوة تحضير</button>
                        </fieldset>

                        {/* Cooking */}
                        <fieldset className="p-4 border-t-2 border-emerald-500"><legend className="px-2 font-bold text-lg">خطوات الطهي</legend>
                            <div className="space-y-3">
                                {currentProductData.cookingInstructions?.map((step, index) => (
                                     <div key={step.id} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                                        <select value={step.responsiblePersonId} onChange={e => handleCookingStepChange(index, 'responsiblePersonId', e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white"><option value="">المسؤول...</option>{team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                                        <input type="text" placeholder="الأداة" value={step.tools} onChange={e => handleCookingStepChange(index, 'tools', e.target.value)} className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md" />
                                        <input type="text" placeholder="الوقت (دقيقة)" value={step.time} onChange={e => handleCookingStepChange(index, 'time', e.target.value)} className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md" />
                                        <input type="text" placeholder="الحرارة (C°)" value={step.temperature} onChange={e => handleCookingStepChange(index, 'temperature', e.target.value)} className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md" />
                                        <button onClick={() => handleRemoveCookingStep(index)} className="text-red-500 justify-self-center"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleAddCookingStep} className="text-sm text-emerald-600 hover:underline mt-2">+ إضافة خطوة طهي</button>
                        </fieldset>

                        {/* Serving */}
                        <fieldset className="p-4 border-t-2 border-emerald-500"><legend className="px-2 font-bold text-lg">طريقة التقديم والنقل</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select value={currentProductData.servingMethod?.servingCondition || 'immediate'} onChange={e => handleNestedChange('servingMethod', 'servingCondition', e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white">
                                    <option value="immediate">تقديمه في الحال</option>
                                    <option value="internal_transport">نقل داخلي</option>
                                    <option value="external_transport">نقل خارجي</option>
                                </select>
                                <input type="text" placeholder="نوع التغليف" value={currentProductData.servingMethod?.packaging || ''} onChange={e => handleNestedChange('servingMethod', 'packaging', e.target.value)} className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                <input type="text" placeholder="حرارة الحفظ (ساخن)" value={currentProductData.servingMethod?.hotHoldingTemperature || ''} onChange={e => handleNestedChange('servingMethod', 'hotHoldingTemperature', e.target.value)} className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md" />
                                <input type="text" placeholder="حرارة الحفظ (بارد)" value={currentProductData.servingMethod?.coldHoldingTemperature || ''} onChange={e => handleNestedChange('servingMethod', 'coldHoldingTemperature', e.target.value)} className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md" />
                            </div>
                             {currentProductData.servingMethod?.servingCondition === 'external_transport' && (
                                <div className="mt-3">
                                    <label className="flex items-center gap-2 text-sm text-slate-700">
                                        <input type="checkbox" checked={currentProductData.servingMethod?.requiresExpiryPrinting || false} onChange={e => handleNestedChange('servingMethod', 'requiresExpiryPrinting', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                        يتطلب طباعة تاريخ صلاحية على العبوة
                                    </label>
                                </div>
                            )}
                        </fieldset>
                        
                        {/* Chef */}
                        <div>
                            <label className="font-semibold">الشيف المسؤول عن الوصفة</label>
                             <select value={currentProductData.headChefId} onChange={e => handleFieldChange('headChefId', e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white mt-1"><option value="">اختر الشيف...</option>{team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                        </div>
                        
                        <div className="flex justify-end pt-4 border-t"><button onClick={handleSave} className="bg-emerald-600 text-white px-5 py-2.5 rounded-md hover:bg-emerald-700">{editingProduct ? 'حفظ التغييرات' : 'حفظ الوجبة'}</button></div>
                    </div>
                 </Modal>
            ) : (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}>
                    <div className="space-y-4">
                        <input type="text" placeholder="اسم المنتج" value={currentProductData.name} onChange={e => setCurrentProductData(p => ({ ...p, name: e.target.value }))} className={darkInputStyle} />
                        <textarea placeholder="وصف المنتج" value={currentProductData.description} onChange={e => setCurrentProductData(p => ({ ...p, description: e.target.value }))} className={darkInputStyle} rows={2}/>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="الحجم/الوزن" value={currentProductData.sizeOrWeight} onChange={e => setCurrentProductData(p => ({ ...p, sizeOrWeight: e.target.value }))} className={darkInputStyle} />
                            <input type="text" placeholder="الباركود" value={currentProductData.barcode} onChange={e => setCurrentProductData(p => ({ ...p, barcode: e.target.value }))} className={darkInputStyle} />
                        </div>

                        <h4 className="font-semibold pt-4 border-t">المكونات</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {currentProductData.ingredients.map((ing, index) => (
                                <div key={ing.id} className="p-3 bg-slate-100 rounded-md border grid grid-cols-1 md:grid-cols-5 gap-3">
                                    <input type="text" value={ing.name} onChange={e => handleIngredientChange(index, 'name', e.target.value)} placeholder="اسم المكون" className={`md:col-span-2 ${darkInputStyle}`}/>
                                    <input type="number" min="0" value={ing.amount} onChange={e => handleIngredientChange(index, 'amount', Number(e.target.value))} className={darkInputStyle} />
                                    <select value={ing.unit} onChange={e => handleIngredientChange(index, 'unit', e.target.value)} className={lightSelectStyle}>
                                        <option value="g">جرام</option><option value="kg">كيلو</option><option value="ml">مل</option><option value="l">لتر</option><option value="piece">قطعة / حبة</option>
                                    </select>
                                    <div className="flex items-center gap-2">
                                        <select value={ing.supplierId} onChange={e => handleIngredientChange(index, 'supplierId', e.target.value)} className={`flex-grow text-xs ${lightSelectStyle}`}>
                                            <option value="">اختر مورداً...</option>
                                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        <button onClick={() => handleRemoveIngredient(index)} className="text-red-500 hover:text-red-700 flex-shrink-0"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddIngredient} className="text-sm text-emerald-600 hover:underline">+ إضافة مكون آخر</button>
                        
                        <div className="flex justify-end pt-4 border-t">
                            <button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">{editingProduct ? 'حفظ التغييرات' : 'حفظ المنتج'}</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Products;