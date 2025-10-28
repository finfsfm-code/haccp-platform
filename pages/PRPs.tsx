import React from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { prpLibrary } from '../types.ts';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon.tsx';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon.tsx';

const PRPs: React.FC = () => {
  const { setActivePage } = useAppContext();

  const prpItems = [
    { id: 'PersonalHygiene', key: 'personalHygiene' as const },
    { id: 'CleaningAndSanitation', key: 'cleaningAndSanitation' as const },
    { id: 'PestControl', key: 'pestControl' as const },
    { id: 'SupplierControl', key: 'supplierControl' as const },
  ];

  return (
    <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">البرامج الأولية (PRPs)</h2>
        <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-slate-600 mb-6">
                البرامج الأولية هي الممارسات والإجراءات الأساسية التي تشكل الأساس لنظام فعال لسلامة الغذاء (HACCP). اختر أحد البرامج أدناه لإنشاء أو مراجعة خطته.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prpItems.map(item => {
                    const info = prpLibrary[item.key];
                    return (
                        <button 
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-right hover:border-emerald-500 hover:bg-emerald-50 transition group"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{info.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{info.description}</p>
                                </div>
                                <ShieldCheckIcon className="h-10 w-10 text-slate-400 group-hover:text-emerald-500 transition"/>
                            </div>
                            <div className="mt-4 text-sm font-semibold text-emerald-600 flex items-center gap-2">
                                <span>الانتقال إلى الخطة</span>
                                <ArrowLeftIcon className="h-4 w-4 transform transition-transform group-hover:-translate-x-1" />
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    </div>
  );
};

export default PRPs;