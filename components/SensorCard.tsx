import React from 'react';
import { Sensor } from '../types';

interface SensorCardProps {
    sensor: Sensor;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensor }) => {
    const { currentValue, targetMin, targetMax, warningThreshold, unit } = sensor;

    const getStatus = (): { status: 'compliant' | 'warning' | 'danger'; color: string } => {
        const lowerWarning = targetMin - warningThreshold;
        const upperWarning = targetMax + warningThreshold;

        if (currentValue >= targetMin && currentValue <= targetMax) {
            return { status: 'compliant', color: 'border-emerald-500' };
        }
        if (currentValue > upperWarning || currentValue < lowerWarning) {
            return { status: 'danger', color: 'border-red-500' };
        }
        return { status: 'warning', color: 'border-yellow-400' };
    };

    const { status, color } = getStatus();

    return (
        <div className={`bg-white p-4 rounded-lg shadow-md border-l-8 transition-colors duration-500 ${color}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-slate-800">{sensor.name}</h3>
                    <p className="text-xs text-slate-500">{sensor.location}</p>
                </div>
                 <span className={`text-xs font-semibold px-2 py-1 rounded-full
                    ${status === 'compliant' ? 'bg-emerald-100 text-emerald-800' :
                      status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800 animate-pulse'}`}>
                    {status === 'compliant' ? 'مطابق' : status === 'warning' ? 'تحذير' : 'خطر'}
                </span>
            </div>
            <div className="text-center my-4">
                <p className="text-5xl font-bold text-slate-900">
                    {currentValue.toFixed(1)}<span className="text-3xl text-slate-500">{unit}</span>
                </p>
            </div>
            <div className="text-center text-xs text-slate-600 border-t pt-2">
                <p>المستهدف: {targetMin}{unit} - {targetMax}{unit}</p>
            </div>
        </div>
    );
};

export default SensorCard;
