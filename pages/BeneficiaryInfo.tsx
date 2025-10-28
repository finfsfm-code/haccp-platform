

import React, { useState, useEffect } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';

const CompanyInfo: React.FC = () => {
  const { companyInfo, showNotification, updateCompanyInfo } = useAppContext();
  const [localInfo, setLocalInfo] = useState(companyInfo);

  useEffect(() => {
    setLocalInfo(companyInfo);
  }, [companyInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await updateCompanyInfo(localInfo);
    showNotification('تم حفظ بيانات الشركة بنجاح.', 'success');
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">بيانات الشركة</h2>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">اسم الشركة</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={localInfo.companyName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">العنوان</label>
          <input
            type="text"
            id="address"
            name="address"
            value={localInfo.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="contactPerson" className="block text-sm font-medium text-slate-700 mb-1">مسؤول التواصل</label>
          <input
            type="text"
            id="contactPerson"
            name="contactPerson"
            value={localInfo.contactPerson}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={localInfo.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            id="email"
            name="email"
            value={localInfo.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={handleSave}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyInfo;