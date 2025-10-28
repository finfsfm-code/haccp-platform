import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ProductionOrder, Product, Ingredient } from '../types';
import Modal from '../components/Modal';
import { PlusIcon } from '../components/icons/PlusIcon';
import { ArrowUpTrayIcon } from '../components/icons/ArrowUpTrayIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';

const ProductionOrders: React.FC = () => {
    const { products, productionOrders, addProductionOrder, updateProductionOrder, showNotification, issueMaterialsForProduction, materialReceipts, hasPermission, getCompanyBusinessType } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [orderToStart, setOrderToStart] = useState<ProductionOrder | null>(null);
    const [rawMaterialBatches, setRawMaterialBatches] = useState<{ ingredientId: string; batchNumber: string; }[]>([]);

    const businessType = getCompanyBusinessType();
    const isKitchen = businessType === 'kitchen' || businessType === 'restaurant';
    
    const [newOrder, setNewOrder] = useState<Omit<ProductionOrder, 'id' | 'orderNumber' | 'usedIngredients' | 'materialsIssued' | 'rawMaterialBatchNumbers'>>({
        productId: '',
        quantity: 100,
        batchNumber: `B${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 900 + 100)}`,
        productionDate: new Date().toISOString().slice(0, 10),
        expiryDate: '',
        status: 'planned',
        notes: '',
    });

    const handleOpenModal = () => {
        setNewOrder({
            productId: '',
            quantity: isKitchen ? 10 : 100,
            batchNumber: `B${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 900 + 100)}`,
            productionDate: new Date().toISOString().slice(0, 10),
            expiryDate: '',
            status: 'planned',
            notes: '',
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = async () => {
        if (!newOrder.productId || !newOrder.batchNumber) {
            showNotification('يرجى اختيار منتج وتعيين رقم تشغيلة.', 'error');
            return;
        }
        await addProductionOrder(newOrder);
        showNotification(`تمت إضافة ${isKitchen ? 'أمر التحضير' : 'أمر التشغيل'} بنجاح!`, 'success');
        handleCloseModal();
    };

    const handleIssueMaterials = async (orderId: string) => {
        await issueMaterialsForProduction(orderId);
    };
    
    const handleOpenStartProductionModal = (order: ProductionOrder) => {
        const product = products.find(p => p.id === order.productId);
        if (!product) return;
        
        const initialBatches = product.ingredients.map(ing => ({
            ingredientId: ing.id,
            batchNumber: '',
        }));
        setRawMaterialBatches(initialBatches);
        setOrderToStart(order);
        setIsStartModalOpen(true);
    };

    const handleConfirmStartProduction = async () => {
        if (!orderToStart) return;

        // Ensure all batch numbers are filled
        if (rawMaterialBatches.some(b => !b.batchNumber.trim())) {
            showNotification('يرجى إدخال أرقام التشغيلات لجميع المواد الخام.', 'error');
            return;
        }

        await updateProductionOrder({ 
            ...orderToStart, 
            status: 'in-progress', 
            rawMaterialBatchNumbers: rawMaterialBatches 
        });
        showNotification(`تم بدء تنفيذ الأمر ${orderToStart.orderNumber}`, 'success');
        setIsStartModalOpen(false);
        setOrderToStart(null);
    };

    const getStatusChip = (status: ProductionOrder['status']) => {
        const styles = {
            planned: 'bg-slate-200 text-slate-800',
            'materials-issued': 'bg-yellow-200 text-yellow-800',
            'in-progress': 'bg-blue-200 text-blue-800',
            completed: 'bg-green-200 text-green-800',
        };
        const text = {
            planned: 'مخطط له',
            'materials-issued': 'تم صرف المواد',
            'in-progress': 'قيد التنفيذ',
            completed: 'مكتمل',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
    };
    
    const ingredientsForStartModal = useMemo(() => {
        if (!orderToStart) return [];
        const product = products.find(p => p.id === orderToStart.productId);
        return product?.ingredients || [];
    }, [orderToStart, products]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{isKitchen ? 'أوامر التحضير' : 'أوامر التشغيل والإنتاج'}</h2>
                {hasPermission('production:create') && (
                    <button onClick={handleOpenModal} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition">
                        <PlusIcon className="h-5 w-5" />
                        {isKitchen ? 'إنشاء أمر تحضير' : 'إنشاء أمر تشغيل'}
                    </button>
                )}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
                {productionOrders.length === 0 ? (
                    <p className="text-slate-500 text-center">لم يتم إنشاء أي {isKitchen ? 'أوامر تحضير' : 'أوامر تشغيل'} بعد.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{isKitchen ? 'رقم التحضير' : 'رقم التشغيلة'}</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{isKitchen ? 'الوجبة' : 'المنتج'}</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">الكمية</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{isKitchen ? 'تاريخ التحضير' : 'تاريخ الإنتاج'}</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">الحالة</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {productionOrders.map(order => {
                                    const product = products.find(p => p.id === order.productId);
                                    return (
                                        <tr key={order.id}>
                                            <td className="px-4 py-2 text-sm font-mono text-slate-800">{order.batchNumber}</td>
                                            <td className="px-4 py-2 text-sm">{product?.name || 'منتج محذوف'}</td>
                                            <td className="px-4 py-2 text-sm">{order.quantity}</td>
                                            <td className="px-4 py-2 text-sm">{new Date(order.productionDate).toLocaleDateString('ar-SA')}</td>
                                            <td className="px-4 py-2 text-center">{getStatusChip(order.status)}</td>
                                            <td className="px-4 py-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    {hasPermission('production:manage') && order.status === 'planned' && (
                                                        <button onClick={() => handleIssueMaterials(order.id)} className="text-xs bg-yellow-500 text-white px-2 py-1 rounded flex items-center gap-1">
                                                            <ArrowUpTrayIcon className="h-4 w-4"/> صرف المواد
                                                        </button>
                                                    )}
                                                    {hasPermission('production:manage') && order.status === 'materials-issued' && (
                                                        <button onClick={() => handleOpenStartProductionModal(order)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                                            بدء التنفيذ
                                                        </button>
                                                    )}
                                                    {hasPermission('production:manage') && order.status === 'in-progress' && (
                                                        <button onClick={() => updateProductionOrder({ ...order, status: 'completed' })} className="text-xs bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1">
                                                           <CheckCircleIcon className="h-4 w-4"/> إكمال
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isKitchen ? "إنشاء أمر تحضير جديد" : "إنشاء أمر تشغيل جديد"}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{isKitchen ? 'الوجبة' : 'المنتج'}</label>
                        <select value={newOrder.productId} onChange={e => setNewOrder(o => ({ ...o, productId: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                            <option value="" disabled>اختر {isKitchen ? 'وجبة' : 'منتجاً'}...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">الكمية المطلوبة</label>
                            <input type="number" min="1" value={newOrder.quantity} onChange={e => setNewOrder(o => ({ ...o, quantity: parseInt(e.target.value, 10) || 0 }))} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{isKitchen ? 'رقم التحضير' : 'رقم التشغيلة (Batch)'}</label>
                            <input type="text" value={newOrder.batchNumber} onChange={e => setNewOrder(o => ({ ...o, batchNumber: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{isKitchen ? 'تاريخ التحضير' : 'تاريخ الإنتاج'}</label>
                            <input type="date" value={newOrder.productionDate} onChange={e => setNewOrder(o => ({ ...o, productionDate: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الانتهاء</label>
                            <input type="date" value={newOrder.expiryDate} onChange={e => setNewOrder(o => ({ ...o, expiryDate: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
                        <textarea value={newOrder.notes} onChange={e => setNewOrder(o => ({ ...o, notes: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md" rows={3}></textarea>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
                            حفظ الأمر
                        </button>
                    </div>
                </div>
            </Modal>
            
             {orderToStart && (
                <Modal isOpen={isStartModalOpen} onClose={() => setIsStartModalOpen(false)} title={`بدء ${isKitchen ? 'تحضير' : 'إنتاج'}: ${orderToStart.batchNumber}`}>
                    <div className="space-y-4">
                        <p className="text-slate-600">لتفعيل التتبع، يرجى إدخال أرقام التشغيلات للمواد الخام التي سيتم استخدامها.</p>
                        {ingredientsForStartModal.map((ing, index) => {
                            // Find available batches for this ingredient
                            const availableBatches = materialReceipts
                                .filter(r => r.ingredientId === ing.id)
                                .map(r => r.batchNumber);

                            return (
                                <div key={ing.id} className="grid grid-cols-3 gap-4 items-center">
                                    <label className="font-medium text-slate-700 col-span-1">{ing.name}</label>
                                    <input 
                                        type="text"
                                        list={`batches-${ing.id}`}
                                        placeholder="رقم تشغيلة المادة الخام"
                                        value={rawMaterialBatches.find(b => b.ingredientId === ing.id)?.batchNumber || ''}
                                        onChange={e => {
                                            const updated = [...rawMaterialBatches];
                                            const item = updated.find(b => b.ingredientId === ing.id);
                                            if (item) item.batchNumber = e.target.value;
                                            setRawMaterialBatches(updated);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md col-span-2"
                                    />
                                    <datalist id={`batches-${ing.id}`}>
                                        {availableBatches.map(b => <option key={b} value={b} />)}
                                    </datalist>
                                </div>
                            );
                        })}
                         <div className="flex justify-end pt-4 border-t">
                            <button onClick={handleConfirmStartProduction} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                تأكيد وبدء {isKitchen ? 'التحضير' : 'الإنتاج'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ProductionOrders;