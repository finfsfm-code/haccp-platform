

import React, { useState } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';

interface LoginProps {
    onNavigateToRegister: () => void;
    onNavigateToAdminLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onNavigateToRegister, onNavigateToAdminLogin }) => {
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

  const inputStyle = "w-full px-4 py-3 bg-slate-100 text-slate-800 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-500 text-right";

  return (
    <div className="w-full max-w-md p-8 sm:p-12 space-y-6 bg-white rounded-2xl shadow-xl text-center">
        <div className="text-center">
            <h1 className={`text-3xl font-bold text-slate-800`}>Food Safety est.</h1>
            <p className={`text-2xl font-semibold text-slate-600 mt-1`}>مؤسسة سلامة الغذاء</p>
        </div>
        
        <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">تسجيل الدخول</h2>
            <p className="text-slate-600">أهلاً بك مجددًا! أدخل بياناتك للوصول إلى حساب شركتك.</p>
        </div>
        
        <form className="space-y-5 text-right" onSubmit={handleLogin}>
            <div>
                <input id="email-address" name="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputStyle} placeholder="البريد الإلكتروني" />
            </div>
            <div>
                <input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputStyle} placeholder="كلمة المرور" />
            </div>

            <div className="pt-4">
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-slate-400">
                    {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </button>
            </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
            ليس لديك حساب؟{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToRegister(); }} className="font-medium text-emerald-600 hover:text-emerald-500">
            أنشئ حسابًا جديدًا
            </a>
        </p>
        
        <p className="mt-4 text-center text-xs text-slate-500">
            هل أنت مالك المنصة؟{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToAdminLogin(); }} className="font-medium text-slate-600 hover:text-slate-800 underline">
            الدخول من هنا
            </a>
        </p>
    </div>
  );
};

export default Login;