import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { FlaskIcon } from '../../components/icons/FlaskIcon.tsx';
import { ArrowLeftIcon } from '../../components/icons/ArrowLeftIcon.tsx';

const HazardAnalysis: React.FC = () => {
  const { setActivePage } = useAppContext();

  return (
    <div className="bg-white p-12 rounded-lg shadow-md text-center max-w-2xl mx-auto">
        <FlaskIcon className="h-16 w-16 mx-auto text-slate-400"/>
        <h2 className="text-2xl font-bold text-slate-800 mt-4">تحليل المخاطر</h2>
        <p className="text-slate-600 mt-4">
            يتم إجراء تحليل المخاطر بشكل تفاعلي لكل خطوة من خطوات التصنيع مباشرة من خلال صفحة "مخطط تدفق العمليات".
        </p>
        <p className="text-slate-600 mt-2">
            يرجى الانتقال إلى هناك لبدء أو استكمال تحليل المخاطر لمنتجاتك.
        </p>
        <button
            onClick={() => setActivePage('ProcessFlow')}
            className="mt-6 bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 transition text-lg flex items-center gap-2 mx-auto"
        >
            <span>الانتقال إلى مخطط العمليات</span>
             <ArrowLeftIcon className="h-5 w-5" />
        </button>
    </div>
  );
};

export default HazardAnalysis;