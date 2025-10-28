import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { SensorType, SiteSectionSubType, TransportCartSubType } from '../types';

interface AddSensorModalProps {
    isOpen: boolean;
    onClose: () => void;
    sensorType: SensorType;
}

const siteSectionSubTypes: Record<SiteSectionSubType, string> = {
    dry_storage: 'المستودع الجاف',
    cold_storage: 'المستودع المبرد',
    freezer_storage: 'المستودع المجمد',
    receiving: 'منطقة الاستلام',
    prep_general: 'منطقة التحضير العام',
    prep_salad: 'تحضير السلطات والفواكه',
    prep_pastry: 'تحضير الحلويات',
    bakery: 'المخبز',
    washing: 'الغسيل والنظافة',
    waste_room: 'غرفة النفايات',
};

const transportCartSubTypes: Record<TransportCartSubType, string> = {
    hot: 'عربة نقل ساخن',
    cold: 'عربة نقل بارد',
};

const tabLabels: Record<SensorType, string> = {
    site_section: 'قسم موقع',
    refrigerator: 'ثلاجة',
    freezer: 'مجمد',
    oven: 'فرن',
    hot_holding: 'وحدة تسخين',
    transport_cart: 'عربة نقل',
};

const AddSensorModal: React.FC<AddSensorModalProps> = ({ isOpen, onClose, sensorType }) => {
    const { addSensor, showNotification } = useAppContext();
    const [name, setName] = useState('');
    // FIX: Use a more specific type for the state to satisfy the `addSensor` function signature.
    const [subType, setSubType] = useState<SiteSectionSubType | TransportCartSubType | ''>('');

    // Reset state when modal opens or sensorType changes
    useEffect(() => {
        if (isOpen) {
            setName('');
            // Set default subtype
            if (sensorType === 'site_section') {
                setSubType('dry_storage');
            } else if (sensorType === 'transport_cart') {
                setSubType('hot');
            } else {
                setSubType('');
            }
        }
    }, [isOpen, sensorType]);

    const handleSave = () => {
        if (!name.trim()) {
            showNotification('يرجى إدخال اسم تعريفي.', 'error');
            return;
        }
        addSensor({
            name,
            type: sensorType,
            subType: subType || undefined,
        });
        onClose();
    };

    const needsSubType = sensorType === 'site_section' || sensorType === 'transport_cart';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`إضافة ${tabLabels[sensorType]} جديد`}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="sensor-name" className="block text-sm font-medium text-slate-700 mb-1">
                        الاسم التعريفي (مثال: ثلاجة عرض الحلويات، فرن المخبز الرئيسي)
                    </label>
                    <input
                        id="sensor-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder={`اسم ${tabLabels[sensorType]} الجديد`}
                    />
                </div>

                {sensorType === 'site_section' && (
                    <div>
                        <label htmlFor="site-section-subtype" className="block text-sm font-medium text-slate-700 mb-1">
                            نوع القسم
                        </label>
                        <select
                            id="site-section-subtype"
                            value={subType}
                            // FIX: Cast the value from the event to maintain type safety for the `subType` state.
                            onChange={(e) => setSubType(e.target.value as SiteSectionSubType)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                        >
                            {Object.entries(siteSectionSubTypes).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                )}
                
                {sensorType === 'transport_cart' && (
                    <div>
                        <label htmlFor="transport-cart-subtype" className="block text-sm font-medium text-slate-700 mb-1">
                            نوع العربة
                        </label>
                        <select
                            id="transport-cart-subtype"
                            value={subType}
                            // FIX: Cast the value from the event to maintain type safety for the `subType` state.
                            onChange={(e) => setSubType(e.target.value as TransportCartSubType)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                        >
                             {Object.entries(transportCartSubTypes).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                    <button onClick={onClose} type="button" className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">
                        إلغاء
                    </button>
                    <button
                        onClick={handleSave}
                        className="me-3 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
                        disabled={!name.trim() || (needsSubType && !subType)}
                    >
                        حفظ وإضافة
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddSensorModal;