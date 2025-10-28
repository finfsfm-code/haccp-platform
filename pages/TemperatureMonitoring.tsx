
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Sensor, SensorType } from '../types.ts';
import SensorCard from '../components/SensorCard.tsx';
import AddSensorModal from '../components/AddSensorModal.tsx';
import { PlusIcon } from '../components/icons/PlusIcon.tsx';
import { RefreshCwIcon } from '../components/icons/RefreshCwIcon.tsx';

const tabConfig: { key: SensorType, label: string }[] = [
    { key: 'site_section', label: 'أقسام الموقع' },
    { key: 'refrigerator', label: 'الثلاجات' },
    { key: 'freezer', label: 'المجمدات' },
    { key: 'oven', label: 'الأفران' },
    { key: 'hot_holding', label: 'وحدات الحفظ الساخن' },
    { key: 'transport_cart', label: 'عربات النقل' },
];

const TemperatureMonitoring: React.FC = () => {
    const { sensors, setSensors, hasPermission } = useAppContext();
    const [activeTab, setActiveTab] = useState<SensorType>('site_section');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const canManage = hasPermission('haccp:manage_temp_monitoring');

    const handleOpenModal = (type: SensorType) => {
        setActiveTab(type);
        setIsModalOpen(true);
    };

    // Simulate real-time data fluctuations
    const simulateData = () => {
        setIsSimulating(true);
        setSensors(currentSensors => 
            currentSensors.map(sensor => {
                const fluctuation = (Math.random() - 0.5) * (sensor.warningThreshold / 2);
                let newValue = sensor.currentValue + fluctuation;
                // Occasionally create a bigger spike to test warnings/dangers
                if (Math.random() < 0.05) {
                    newValue += (Math.random() - 0.5) * sensor.warningThreshold * 3;
                }
                return { ...sensor, currentValue: parseFloat(newValue.toFixed(1)) };
            })
        );
        setTimeout(() => setIsSimulating(false), 500);
    };
    
    useEffect(() => {
        const interval = setInterval(simulateData, 15000); // Simulate every 15 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">مراقبة درجات الحرارة والرطوبة</h2>
                <button
                    onClick={simulateData}
                    disabled={isSimulating}
                    className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-700 transition disabled:opacity-50"
                >
                    <RefreshCwIcon className={`h-5 w-5 ${isSimulating ? 'animate-spin' : ''}`} />
                    تحديث القراءات
                </button>
            </div>

            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabConfig.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.key
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sensors.filter(s => s.type === activeTab).map(sensor => (
                        <SensorCard key={sensor.id} sensor={sensor} />
                    ))}
                    {canManage && (
                         <button
                            onClick={() => handleOpenModal(activeTab)}
                            className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                        >
                            <PlusIcon className="h-10 w-10" />
                            <span className="mt-2 font-semibold">إضافة حساس جديد</span>
                        </button>
                    )}
                </div>
               
            </div>
            
            <AddSensorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} sensorType={activeTab} />
        </div>
    );
};

export default TemperatureMonitoring;
