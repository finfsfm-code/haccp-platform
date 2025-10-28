

import React, { useState } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';

interface AdminLoginProps {
    onNavigateToCompanyLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigateToCompanyLogin }) => {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
      <div className="text-center">
          <h1 className={`text-2xl font-bold text-slate-800`}>Food Safety est.</h1>
          <p className={`text-xl font-semibold text-slate-600 mt-1`}>مؤسسة سلامة الغذاء</p>
      </div>
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">دخول مالك المنصة</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          مرحبًا بعودتك!
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="email-address" className="sr-only">البريد الإلكتروني</label>
            <input id="email-address" name="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" placeholder="البريد الإلكتروني" />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">كلمة المرور</label>
            <input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" placeholder="كلمة المرور" />
          </div>
        </div>

        <div>
          <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400">
            {isLoading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </div>
      </form>
      <p className="mt-2 text-center text-sm text-slate-600">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToCompanyLogin(); }} className="font-medium text-emerald-600 hover:text-emerald-500">
          العودة إلى دخول الشركات
        </a>
      </p>
    </div>
  );
};

export default AdminLogin;