

import React, { useState } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';
// FIX: Added .ts extension to resolve module.
import { User, BusinessType } from '../types.ts';

interface RegisterProps {
    onNavigateToLogin: () => void;
    onRegisterSuccess: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigateToLogin, onRegisterSuccess }) => {
  const { register } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('factory');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const user = await register(companyName, email, password, businessType);
    if(user) {
      onRegisterSuccess(user);
    } else {
      setIsLoading(false);
    }
  };

  const inputStyle = "w-full px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 text-right";
  const selectStyle = "w-full px-4 py-3 bg-white text-slate-800 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right appearance-none";

  return (
    <div className="w-full max-w-md p-8 sm:p-12 space-y-6 bg-white rounded-2xl shadow-xl text-center">
      <div className="text-center">
          <h1 className={`text-3xl font-bold text-slate-800`}>Food Safety est.</h1>
          <p className={`text-2xl font-semibold text-slate-600 mt-1`}>مؤسسة سلامة الغذاء</p>
      </div>
      <div>
        <h2 className="mt-6 text-center text-4xl font-bold tracking-tight text-slate-900">إنشاء حساب شركة جديد</h2>
      </div>
      <form className="mt-8 space-y-5 text-right" onSubmit={handleRegister}>
        <div className="space-y-5">
            <input name="companyName" type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className={inputStyle} placeholder="اسم الشركة" />
            <div className="relative">
                <select name="businessType" required value={businessType} onChange={e => setBusinessType(e.target.value as BusinessType)} className={selectStyle}>
                    <option value="factory">مصنع</option>
                    <option value="kitchen">مطبخ مركزي / إعاشة</option>
                    <option value="restaurant">مطعم</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-slate-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
            <input name="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputStyle} placeholder="البريد الإلكتروني للمسؤول" />
            <input name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputStyle} placeholder="كلمة المرور" />
        </div>

        <div className="pt-4">
          <button type="submit" disabled={isLoading} className="group relative flex w-full justify-center rounded-md border border-transparent bg-emerald-600 py-3 px-4 text-lg font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-slate-400">
            {isLoading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </button>
        </div>
      </form>
       <p className="mt-6 text-center text-sm text-slate-600">
        لديك حساب بالفعل؟{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLogin(); }} className="font-medium text-emerald-600 hover:text-emerald-500">
          قم بتسجيل الدخول
        </a>
      </p>
    </div>
  );
};

export default Register;