

import React, { useEffect, useState } from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';

interface VerifyEmailProps {
    token: string;
    onNavigateToLogin: () => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ token, onNavigateToLogin }) => {
    const { verifyEmail } = useAppContext();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        const doVerification = async () => {
            if (!token) {
                setStatus('error');
                return;
            }
            const success = await verifyEmail(token);
            setStatus(success ? 'success' : 'error');
        };

        // Add a small delay to simulate network request
        const timer = setTimeout(doVerification, 1000);
        return () => clearTimeout(timer);
    }, [token, verifyEmail]);

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg text-center">
            {status === 'verifying' && (
                <>
                    <h2 className="text-2xl font-bold text-slate-900">جاري تفعيل حسابك...</h2>
                    <div className="flex justify-center items-center py-4">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-dashed rounded-full animate-spin"></div>
                    </div>
                    <p className="text-slate-600">يرجى الانتظار قليلاً.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <h2 className="text-2xl font-bold text-green-600">تم تفعيل الحساب بنجاح!</h2>
                    <p className="text-slate-600 mt-4">
                        أصبح حسابك نشطًا الآن. يمكنك تسجيل الدخول للبدء في استخدام المنصة.
                    </p>
                    <button
                        onClick={onNavigateToLogin}
                        className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                        الانتقال إلى صفحة تسجيل الدخول
                    </button>
                </>
            )}

            {status === 'error' && (
                 <>
                    <h2 className="text-2xl font-bold text-red-600">فشل تفعيل الحساب</h2>
                    <p className="text-slate-600 mt-4">
                        يبدو أن رابط التفعيل غير صالح أو قد انتهت صلاحيته. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.
                    </p>
                     <button
                        onClick={onNavigateToLogin}
                        className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white bg-slate-600 hover:bg-slate-700"
                    >
                        العودة إلى صفحة تسجيل الدخول
                    </button>
                </>
            )}
        </div>
    );
};

export default VerifyEmail;