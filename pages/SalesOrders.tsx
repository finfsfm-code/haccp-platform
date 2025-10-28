

import React, { useState } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';
// FIX: Added .ts extension to resolve module.
import { Customer, SalesOrder } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { TrashIcon } from '../components/icons/TrashIcon.tsx';

const SalesOrders: React.FC = () => {
    const { 
        customers, addCustomer, deleteCustomer, showNotification, 
        salesOrders, addSalesOrder, products, productionOrders, team,
        hasPermission
    } = useAppContext();
    
    // State for Customer Modal
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState<Omit<Customer, 'id'>>({ name: '', type: 'customer', phone: '', email: '', website: '', address: '' });
    
    // State for Sales Order Modal
    const [isSalesOrderModalOpen, setIsSalesOrderModalOpen] = useState(false);
    const [newOrder, setNewOrder] = useState<Omit<SalesOrder, 'id' | 'orderNumber' | 'date' | 'customer'>>({ 
        products: [{ productId: '', quantity: 1, batchNumber: '' }],
        deliveryDate: '',
        deliveryDriver: '',
        deliveryLocation: '',
        salesPersonId: '',
    });
    const [selectedCustomerId, setSelectedCustomerId] = useState('');


    const handleSaveCustomer = async () => {
        if (currentCustomer.name && currentCustomer.email) {
            await addCustomer(currentCustomer);
            showNotification('تمت إضافة العميل بنجاح.', 'success');
            setIsCustomerModalOpen(false);
            setCurrentCustomer({ name: '', type: 'customer', phone: '', email: '', website: '', address: '' });
        } else {
            showNotification('يرجى تعبئة اسم العميل وبريده الإلكتروني.', 'error');
        }
    };
    
    const handleDeleteCustomer = async (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
            await deleteCustomer(id);
        }
    };

    const handleOpenSalesOrderModal = () => {
        setNewOrder({ 
            products: [{ productId: '', quantity: 1, batchNumber: '' }],
            deliveryDate: '',
            deliveryDriver: '',
            deliveryLocation: '',
            salesPersonId: '',
        });
        setSelectedCustomerId('');
        setIsSalesOrderModalOpen(true);
    };

    const handleSaveSalesOrder = async () => {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (!customer) {
            showNotification('يرجى اختيار عميل.', 'error');
            return;
        }
        if (newOrder.products.some(p => !p.productId || !p.batchNumber || p.quantity <= 0)) {
            showNotification('يرجى تعبئة جميع بيانات المنتجات بشكل صحيح.', 'error');
            return;
        }
        if(!newOrder.deliveryDate || !newOrder.salesPersonId) {
            showNotification('يرجى تعبئة تاريخ التوصيل ومسؤول المبيعات.', 'error');
            return;
        }

        await addSalesOrder({ ...newOrder, customer });
        setIsSalesOrderModalOpen(false);
    };

    const handleOrderProductChange = (index: number, field: string, value: string | number) => {
        const updatedProducts = [...newOrder.products];
        updatedProducts[index] = { ...updatedProducts[index], [field]: value };
        // Reset batch number if product changes
        if(field === 'productId') {
            updatedProducts[index].batchNumber = '';
        }
        setNewOrder(o => ({ ...o, products: updatedProducts }));
    };

    const handleAddProductToOrder = () => {
        setNewOrder(o => ({ ...o, products: [...o.products, { productId: '', quantity: 1, batchNumber: '' }] }));
    };
    
    const handleRemoveProductFromOrder = (index: number) => {
        setNewOrder(o => ({ ...o, products: o.products.filter((_, i) => i !== index) }));
    };

    const handleCustomerSelectForOrder = (customerId: string) => {
        setSelectedCustomerId(customerId);
        const customer = customers.find(c => c.id === customerId);
        if (customer && customer.address) {
            setNewOrder(o => ({...o, deliveryLocation: customer.address! }));
        }
    };

    const getAvailableBatches = (productId: string) => {
        return productionOrders.filter(po => po.status === 'completed' && po.productId === productId);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">العملاء وأوامر البيع</h2>
                {hasPermission('sales:create') && (
                    <button onClick={handleOpenSalesOrderModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                        <PlusIcon className="h-5 w-5" />
                        إضافة أمر بيع
                    </button>
                )}
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-slate-700 mb-4">أوامر البيع المسجلة</h3>
                {salesOrders.length === 0 ? <p className="text-slate-500 text-center">لم تتم إضافة أي أوامر بيع بعد.</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">رقم الطلب</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">العميل</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">تاريخ التوصيل</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">مسؤول المبيعات</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">المنتجات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {salesOrders.map(order => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-2 text-sm font-mono">{order.orderNumber}</td>
                                        <td className="px-4 py-2 text-sm">{order.customer.name}</td>
                                        <td className="px-4 py-2 text-sm">{new Date(order.deliveryDate).toLocaleDateString('ar-SA')}</td>
                                        <td className="px-4 py-2 text-sm">{team.find(t => t.id === order.salesPersonId)?.name || 'غير محدد'}</td>
                                        <td className="px-4 py-2 text-sm">
                                            <ul className="list-disc list-inside">
                                                {order.products.map((p, i) => (
                                                    <li key={i}>{products.find(prod => prod.id === p.productId)?.name} (x{p.quantity}) - <span className="font-mono text-xs">{p.batchNumber}</span></li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-700">قائمة العملاء/الموزعين/المندوبين</h3>
                     {hasPermission('sales:create') && (
                        <button onClick={() => setIsCustomerModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 transition text-sm">
                            <PlusIcon className="h-4 w-4" />
                            إضافة عميل
                        </button>
                     )}
                </div>
                {customers.length === 0 ? <p className="text-slate-500 text-center">لم تتم إضافة أي عملاء بعد.</p> : (
                     <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">الاسم</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">البريد الإلكتروني</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">الهاتف</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">العنوان</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {customers.map(customer => (
                                    <tr key={customer.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{customer.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">{customer.email}</a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{customer.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{customer.address}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {hasPermission('sales:delete') && (
                                                <button onClick={() => handleDeleteCustomer(customer.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} title="إضافة عميل/موزع/مندوب">
                <div className="space-y-4">
                    <input type="text" placeholder="الاسم" value={currentCustomer.name} onChange={e => setCurrentCustomer(c => ({ ...c, name: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-md" />
                    <select value={currentCustomer.type} onChange={e => setCurrentCustomer(c => ({...c, type: e.target.value as Customer['type']}))} className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white">
                        <option value="customer">عميل</option>
                        <option value="distributor">موزع</option>
                        <option value="sales_rep">مندوب مبيعات</option>
                    </select>
                    <input type="email" placeholder="البريد الإلكتروني" value={currentCustomer.email} onChange={e => setCurrentCustomer(c => ({ ...c, email: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-md" />
                    <input type="tel" placeholder="رقم التواصل" value={currentCustomer.phone} onChange={e => setCurrentCustomer(c => ({ ...c, phone: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-md" />
                    <input type="text" placeholder="الموقع الإلكتروني (اختياري)" value={currentCustomer.website || ''} onChange={e => setCurrentCustomer(c => ({ ...c, website: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-md" />
                    <input type="text" placeholder="العنوان" value={currentCustomer.address || ''} onChange={e => setCurrentCustomer(c => ({ ...c, address: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-md" />
                    <div className="flex justify-end pt-4">
                        <button onClick={handleSaveCustomer} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">حفظ</button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isSalesOrderModalOpen} onClose={() => setIsSalesOrderModalOpen(false)} title="إنشاء أمر بيع جديد">
                 <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">العميل</label>
                            <select value={selectedCustomerId} onChange={e => handleCustomerSelectForOrder(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                                <option value="" disabled>اختر عميلاً...</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">مسؤول المبيعات</label>
                             <select value={newOrder.salesPersonId} onChange={e => setNewOrder(o => ({...o, salesPersonId: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                                <option value="" disabled>اختر المسؤول...</option>
                                {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ التوصيل</label>
                             <input type="date" value={newOrder.deliveryDate} onChange={e => setNewOrder(o => ({...o, deliveryDate: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                         </div>
                         <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-slate-700 mb-1">مسؤول التوصيل (السائق)</label>
                              <input type="text" value={newOrder.deliveryDriver} onChange={e => setNewOrder(o => ({...o, deliveryDriver: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                         </div>
                     </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">موقع التوصيل</label>
                         <input type="text" value={newOrder.deliveryLocation} onChange={e => setNewOrder(o => ({...o, deliveryLocation: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                     </div>

                    <h4 className="font-semibold pt-4 border-t">المنتجات</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {newOrder.products.map((p, index) => {
                            const availableBatches = getAvailableBatches(p.productId);
                            return (
                                <div key={index} className="p-3 bg-slate-50 rounded-md border grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <select value={p.productId} onChange={e => handleOrderProductChange(index, 'productId', e.target.value)} className="md:col-span-2 w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                                        <option value="" disabled>اختر منتجاً...</option>
                                        {products.map(prod => <option key={prod.id} value={prod.id}>{prod.name}</option>)}
                                    </select>
                                    <input type="number" min="1" value={p.quantity} onChange={e => handleOrderProductChange(index, 'quantity', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="الكمية" />
                                    <div className="flex items-center gap-2">
                                        <select value={p.batchNumber} onChange={e => handleOrderProductChange(index, 'batchNumber', e.target.value)} className="flex-grow w-full px-3 py-2 border border-slate-300 rounded-md bg-white" disabled={!p.productId || availableBatches.length === 0}>
                                            <option value="" disabled>اختر التشغيلة...</option>
                                            {/* FIX: Corrected property access from `batch.quantityProduced` to `batch.quantity` to match the `ProductionOrder` type definition. */}
                                            {availableBatches.map(batch => <option key={batch.id} value={batch.batchNumber}>{batch.batchNumber} ({batch.quantity} متوفر)</option>)}
                                        </select>
                                        <button onClick={() => handleRemoveProductFromOrder(index)} className="text-red-500 hover:text-red-700 flex-shrink-0"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                     <button onClick={handleAddProductToOrder} className="text-sm text-emerald-600 hover:underline">+ إضافة منتج آخر</button>

                    <div className="flex justify-end pt-4 border-t">
                        <button onClick={handleSaveSalesOrder} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">حفظ أمر البيع</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SalesOrders;