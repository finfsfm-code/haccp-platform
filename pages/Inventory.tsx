

import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArchiveBoxIcon } from '../components/icons/ArchiveBoxIcon';
import { CubeIcon } from '../components/icons/CubeIcon';
import Modal from '../components/Modal';
import { PlusIcon } from '../components/icons/PlusIcon';
import { Ingredient, MaterialReceipt } from '../types';
import { AlertTriangleIcon } from '../components/icons/AlertTriangleIcon';

const Inventory: React.FC = () => {
    const { products, productionOrders, salesOrders, materialReceipts, receiveMaterials, suppliers, showNotification, hasPermission, getCompanyBusinessType } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const businessType = getCompanyBusinessType();
    const isKitchen = businessType === 'kitchen' || businessType === 'restaurant';

    const emptyReceipt: Omit<MaterialReceipt, 'id' | 'isCompliant' | 'temperatureCompliant' | 'ingredientName'> = {
        receiptDate: new Date().toISOString().slice(0, 10),
        supplierId: '',
        ingredientId: '',
        batchNumber: '',
        quantity: 0,
        unit: 'g',
        expiryDate: '',
        actualTemperature: 0,
        requiredTemperature: 4,
        packagingIntact: true,
        colorAndOdorNormal: true,
        pestFree: true,
    };
    const [newReceipt, setNewReceipt] = useState(emptyReceipt);
    
    const inputStyle = "w-full mt-1 p-2 bg-white border border-slate-300 rounded-md text-slate-800 shadow-sm focus:ring-emerald-500 focus:border-emerald-500";

    // Original simpler calculations for factory view
    const ingredientInventory = useMemo(() => {
        const inventory: { [key: string]: { quantity: number, unit: string } } = {};
        materialReceipts.forEach(r => {
            if (!inventory[r.ingredientId]) inventory[r.ingredientId] = { quantity: 0, unit: r.unit };
            inventory[r.ingredientId].quantity += r.quantity;
        });
        productionOrders.forEach(po => {
            if (po.materialsIssued) {
                po.usedIngredients.forEach(ui => {
                    if (inventory[ui.ingredientId]) {
                        inventory[ui.ingredientId].quantity -= ui.quantityUsed;
                    }
                });
            }
        });

        const allIngredients = products.flatMap(p => p.ingredients);
        return Object.entries(inventory).map(([id, { quantity, unit }]) => {
            const ingredientInfo = allIngredients.find(i => i.id === id);
            return {
                ingredientId: id,
                name: ingredientInfo?.name || 'مادة غير معروفة',
                quantity,
                unit
            };
        });
    }, [products, productionOrders, materialReceipts]);

    const productInventory = useMemo(() => {
        const inventory: { [key: string]: number } = {};
        productionOrders.forEach(po => {
            if (po.status === 'completed') {
                inventory[po.productId] = (inventory[po.productId] || 0) + po.quantity;
            }
        });
        salesOrders.forEach(so => {
            so.products.forEach(p => {
                if (inventory[p.productId]) {
                    inventory[p.productId] -= p.quantity;
                }
            });
        });
        return Object.entries(inventory)
            .map(([id, quantity]) => ({
                name: products.find(p => p.id === id)?.name || 'منتج غير معروف',
                quantity,
            }))
            .filter(item => item.quantity > 0);
    }, [products, productionOrders, salesOrders]);

    // New detailed calculations for kitchen view
    const detailedIngredientInventory = useMemo(() => {
        const allIngredients = new Map<string, Ingredient>();
        products.flatMap(p => p.ingredients).forEach(ing => {
            if (!allIngredients.has(ing.id)) {
                allIngredients.set(ing.id, ing);
            }
        });

        const stock: { [key: string]: { grams: number; pieces: number } } = {};
        const getStockItem = (id: string) => {
            if (!stock[id]) stock[id] = { grams: 0, pieces: 0 };
            return stock[id];
        };

        materialReceipts.forEach(r => {
            const item = getStockItem(r.ingredientId);
            if (r.unit === 'kg') item.grams += r.quantity * 1000;
            else if (r.unit === 'g') item.grams += r.quantity;
            else if (r.unit === 'piece') item.pieces += r.quantity;
        });

        productionOrders.forEach(po => {
            if (po.materialsIssued) {
                po.usedIngredients.forEach(ui => {
                    const item = getStockItem(ui.ingredientId);
                    let quantityUsed = ui.quantityUsed;
                    if (ui.unit === 'kg') item.grams -= quantityUsed * 1000;
                    else if (ui.unit === 'g') item.grams -= quantityUsed;
                    else if (ui.unit === 'piece') item.pieces -= quantityUsed;
                });
            }
        });

        return Array.from(allIngredients.values()).map(ingredient => {
            const supplier = suppliers.find(s => s.id === ingredient.supplierId);
            const stockItem = getStockItem(ingredient.id);
            const currentStock = ingredient.unit === 'piece' ? stockItem.pieces : stockItem.grams;
            const isLow = ingredient.reorderPoint ? currentStock < ingredient.reorderPoint : false;
            
            let displayStock: string;
            if (ingredient.unit === 'piece') {
                displayStock = `${currentStock} قطعة`;
            } else {
                displayStock = currentStock > 1000 ? `${(currentStock / 1000).toFixed(2)} kg` : `${currentStock.toFixed(0)} g`;
            }

            let displayReorder: string;
            if (ingredient.reorderPoint) {
                if (ingredient.unit === 'piece') {
                    displayReorder = `${ingredient.reorderPoint} قطعة`;
                } else {
                     displayReorder = ingredient.reorderPoint > 1000 ? `${(ingredient.reorderPoint / 1000).toFixed(2)} kg` : `${ingredient.reorderPoint} g`;
                }
            } else {
                displayReorder = 'لم تحدد';
            }

            return { ...ingredient, supplierName: supplier?.name || 'غير محدد', displayStock, displayReorder, isLowStock: isLow };
        });
    }, [products, materialReceipts, productionOrders, suppliers]);

    const detailedFinishedGoodsInventory = useMemo(() => {
        const finishedGoods: any[] = [];
        const completedOrders = productionOrders.filter(po => po.status === 'completed');

        completedOrders.forEach(order => {
            const product = products.find(p => p.id === order.productId);
            let soldQuantity = 0;
            salesOrders.forEach(so => {
                so.products.forEach(p => {
                    if (p.productId === order.productId && p.batchNumber === order.batchNumber) {
                        soldQuantity += p.quantity;
                    }
                });
            });

            const remainingQuantity = order.quantity - soldQuantity;

            if (remainingQuantity > 0) {
                 finishedGoods.push({
                    id: order.id,
                    productName: product?.name || 'وجبة غير معروفة',
                    batchNumber: order.batchNumber,
                    productionDate: order.productionDate,
                    producedQuantity: order.quantity,
                    remainingQuantity: remainingQuantity,
                });
            }
        });
        return finishedGoods;
    }, [productionOrders, salesOrders, products]);


    const allIngredientsList = useMemo(() => {
        const ingredientsMap = new Map<string, { id: string, name: string }>();
        products.flatMap(p => p.ingredients).forEach(ing => {
            if (!ingredientsMap.has(ing.id)) {
                ingredientsMap.set(ing.id, { id: ing.id, name: ing.name });
            }
        });
        return Array.from(ingredientsMap.values());
    }, [products]);
    
    const handleSaveReceipt = async () => {
        if (!newReceipt.supplierId || !newReceipt.ingredientId || !newReceipt.batchNumber || newReceipt.quantity <= 0) {
            showNotification('يرجى تعبئة جميع الحقول المطلوبة.', 'error');
            return;
        }

        const ingredient = allIngredientsList.find(i => i.id === newReceipt.ingredientId);

        // FIX: Added the missing `isCompliant` property to the `receiptToSave` object to satisfy the type requirements of the `receiveMaterials` function.
        const temperatureCompliant = newReceipt.actualTemperature <= newReceipt.requiredTemperature;
        const receiptToSave = {
            ...newReceipt,
            ingredientName: ingredient?.name || 'Unknown',
            temperatureCompliant: temperatureCompliant,
            isCompliant: newReceipt.packagingIntact && newReceipt.colorAndOdorNormal && newReceipt.pestFree && temperatureCompliant,
        };

        await receiveMaterials(receiptToSave);
        setIsModalOpen(false);
        setNewReceipt(emptyReceipt);
    };

    const isCompliant = newReceipt.packagingIntact && newReceipt.colorAndOdorNormal && newReceipt.pestFree && newReceipt.actualTemperature <= newReceipt.requiredTemperature;

    const renderFactoryInventory = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center gap-3 mb-4"><ArchiveBoxIcon className="h-8 w-8 text-slate-500" /><h3 className="text-xl font-bold text-slate-700">مخزون المواد الأولية</h3></div>
                <div className="overflow-x-auto"><table className="min-w-full"><thead className="bg-slate-50"><tr><th className="px-4 py-2 text-right text-xs font-medium text-slate-500">المادة</th><th className="px-4 py-2 text-right text-xs font-medium text-slate-500">الكمية المتاحة</th></tr></thead><tbody className="divide-y divide-slate-200">{ingredientInventory.map(item => (<tr key={item.ingredientId}><td className="px-4 py-2 text-sm text-slate-800">{item.name}</td><td className="px-4 py-2 text-sm text-slate-600 font-mono">{item.quantity.toFixed(2)} {item.unit}</td></tr>))}</tbody></table></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center gap-3 mb-4"><CubeIcon className="h-8 w-8 text-slate-500" /><h3 className="text-xl font-bold text-slate-700">مخزون المنتجات الجاهزة</h3></div>
                <div className="overflow-x-auto"><table className="min-w-full"><thead className="bg-slate-50"><tr><th className="px-4 py-2 text-right text-xs font-medium text-slate-500">المنتج</th><th className="px-4 py-2 text-right text-xs font-medium text-slate-500">الكمية المتاحة</th></tr></thead><tbody className="divide-y divide-slate-200">{productInventory.map((item, i) => (<tr key={i}><td className="px-4 py-2 text-sm text-slate-800">{item.name}</td><td className="px-4 py-2 text-sm text-slate-600 font-mono">{item.quantity} وحدة</td></tr>))}</tbody></table></div>
            </div>
        </div>
    );

    const renderKitchenInventory = () => (
      <>
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex items-center gap-3 mb-4"><ArchiveBoxIcon className="h-8 w-8 text-slate-500" /><h3 className="text-xl font-bold text-slate-700">مخزون المواد الأولية</h3></div>
            <div className="overflow-x-auto">
                <table className="min-w-full"><thead className="bg-slate-50"><tr>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">المادة</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">المورد</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">الكمية الحالية</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">نقطة إعادة الطلب</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">الحالة</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-200">{detailedIngredientInventory.map(item => (
                    <tr key={item.id}>
                        <td className="px-4 py-2 text-sm text-slate-800">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-slate-600">{item.supplierName}</td>
                        <td className="px-4 py-2 text-sm text-slate-600 font-mono">{item.displayStock}</td>
                        <td className="px-4 py-2 text-sm text-slate-600 font-mono">{item.displayReorder}</td>
                        <td className="px-4 py-2 text-center">
                            {item.isLowStock ? (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center justify-center gap-1">
                                    <AlertTriangleIcon className="h-4 w-4" /> كمية منخفضة
                                </span>
                            ) : (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">متوفر</span>
                            )}
                        </td>
                    </tr>
                ))}</tbody></table>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex items-center gap-3 mb-4"><CubeIcon className="h-8 w-8 text-slate-500" /><h3 className="text-xl font-bold text-slate-700">مخزون الوجبات الجاهزة</h3></div>
            <div className="overflow-x-auto"><table className="min-w-full"><thead className="bg-slate-50"><tr>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">الوجبة</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">رقم التحضير (Batch)</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">تاريخ التحضير</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">الكمية المنتجة</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">الكمية المتبقية</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-200">{detailedFinishedGoodsInventory.map(item => (
                 <tr key={item.id}>
                    <td className="px-4 py-2 text-sm text-slate-800">{item.productName}</td>
                    <td className="px-4 py-2 text-sm text-slate-600 font-mono">{item.batchNumber}</td>
                    <td className="px-4 py-2 text-sm text-slate-600">{new Date(item.productionDate).toLocaleDateString('ar-SA')}</td>
                    <td className="px-4 py-2 text-sm text-slate-600 font-mono">{item.producedQuantity} وحدة</td>
                    <td className="px-4 py-2 text-sm text-slate-800 font-bold font-mono">{item.remainingQuantity} وحدة</td>
                </tr>
            ))}</tbody></table>
            {detailedFinishedGoodsInventory.length === 0 && <p className="text-center text-slate-500 py-4">لا توجد وجبات جاهزة في المخزون حالياً.</p>}
            </div>
        </div>
      </>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">إدارة المخزون</h2>
                {hasPermission('inventory:manage') && (
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition">
                        <PlusIcon className="h-5 w-5" />
                        استلام مواد جديدة
                    </button>
                )}
            </div>
            
            {isKitchen ? renderKitchenInventory() : renderFactoryInventory()}

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-slate-700 mb-4">سجل الاستلام</h3>
                <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr><th className="px-3 py-2 text-right">المادة</th><th className="px-3 py-2 text-right">المورد</th><th className="px-3 py-2 text-right">تاريخ الاستلام</th><th className="px-3 py-2 text-right">الحالة</th></tr></thead><tbody className="divide-y">{[...materialReceipts].reverse().map(r => <tr key={r.id}>
                    <td className="px-3 py-2">{r.ingredientName} <span className="block text-xs font-mono">{r.batchNumber}</span></td>
                    <td className="px-3 py-2">{suppliers.find(s=>s.id === r.supplierId)?.name}</td>
                    <td className="px-3 py-2">{r.receiptDate}</td>
                    <td className="px-3 py-2"><span className={`px-2 py-0.5 text-xs rounded-full ${r.isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.isCompliant ? 'مقبول' : 'مرفوض'}</span></td>
                </tr>)}</tbody></table></div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل استلام مواد جديدة">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium text-slate-700">تاريخ الاستلام</label><input type="date" value={newReceipt.receiptDate} onChange={e => setNewReceipt(r => ({...r, receiptDate: e.target.value}))} className={inputStyle} /></div>
                        <div><label className="text-sm font-medium text-slate-700">تاريخ الانتهاء</label><input type="date" value={newReceipt.expiryDate} onChange={e => setNewReceipt(r => ({...r, expiryDate: e.target.value}))} className={inputStyle} /></div>
                        <div><label className="text-sm font-medium text-slate-700">المورد</label><select value={newReceipt.supplierId} onChange={e => setNewReceipt(r => ({...r, supplierId: e.target.value}))} className={inputStyle}><option value="" disabled>اختر مورداً</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                        <div><label className="text-sm font-medium text-slate-700">المادة الخام</label><select value={newReceipt.ingredientId} onChange={e => setNewReceipt(r => ({...r, ingredientId: e.target.value}))} className={inputStyle}><option value="" disabled>اختر مادة</option>{allIngredientsList.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
                        <div><label className="text-sm font-medium text-slate-700">رقم التشغيلة</label><input type="text" value={newReceipt.batchNumber} onChange={e => setNewReceipt(r => ({...r, batchNumber: e.target.value}))} className={inputStyle} /></div>
                        <div className="grid grid-cols-2 gap-2">
                             <div><label className="text-sm font-medium text-slate-700">الكمية المستلمة</label><input type="number" value={newReceipt.quantity} onChange={e => setNewReceipt(r => ({...r, quantity: Number(e.target.value)}))} className={inputStyle} /></div>
                             {/* FIX: Add type assertion to onChange handler to fix type error where string is not assignable to 'g' | 'kg' | 'piece'. */}
                             <div><label className="text-sm font-medium text-slate-700">الوحدة</label><select value={newReceipt.unit} onChange={e => setNewReceipt(r => ({...r, unit: e.target.value as 'g' | 'kg' | 'piece'}))} className={inputStyle}><option value="g">جرام</option><option value="kg">كيلوجرام</option><option value="piece">قطعة</option></select></div>
                        </div>
                    </div>
                    <fieldset className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                        <legend className="px-2 font-semibold text-slate-700">فحوصات الجودة</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                             <div><label className="text-sm font-medium text-slate-700">درجة الحرارة المطلوبة (°C)</label><input type="number" value={newReceipt.requiredTemperature} onChange={e => setNewReceipt(r => ({...r, requiredTemperature: Number(e.target.value)}))} className="w-full mt-1 p-2 bg-white border border-slate-300 rounded text-slate-800" /></div>
                             <div><label className="text-sm font-medium text-slate-700">درجة الحرارة الفعلية (°C)</label><input type="number" value={newReceipt.actualTemperature} onChange={e => setNewReceipt(r => ({...r, actualTemperature: Number(e.target.value)}))} className="w-full mt-1 p-2 bg-white border border-slate-300 rounded text-slate-800" /></div>
                             <div className={`p-2 rounded text-center font-bold ${newReceipt.actualTemperature <= newReceipt.requiredTemperature ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{newReceipt.actualTemperature <= newReceipt.requiredTemperature ? 'مطابق' : 'غير مطابق'}</div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-700">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={newReceipt.packagingIntact} onChange={e => setNewReceipt(r => ({...r, packagingIntact: e.target.checked}))} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"/> سلامة التغليف</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={newReceipt.colorAndOdorNormal} onChange={e => setNewReceipt(r => ({...r, colorAndOdorNormal: e.target.checked}))} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"/> اللون والرائحة طبيعية</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={newReceipt.pestFree} onChange={e => setNewReceipt(r => ({...r, pestFree: e.target.checked}))} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"/> خالية من الآفات</label>
                        </div>
                    </fieldset>
                    <div className={`p-3 rounded-md font-bold text-center ${isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isCompliant ? 'الحالة النهائية: مقبول' : 'الحالة النهائية: مرفوض'}
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={handleSaveReceipt} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">حفظ الاستلام</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default Inventory;