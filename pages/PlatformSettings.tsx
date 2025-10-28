
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';

const PlatformSettings: React.FC = () => {
    const { showNotification } = useAppContext();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSendAnnouncement = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) {
            showNotification('يرجى تعبئة موضوع الرسالة ومحتواها.', 'error');
            return;
        }
        // In a real app, this would trigger a backend process to email all users.
        console.log('Sending announcement:', { subject, message });
        showNotification('تم إرسال الإعلان بنجاح لجميع المشتركين!', 'success');
        setSubject('');
        setMessage('');
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">إعدادات المنصة</h2>
            
            <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold text-slate-700 mb-4">إرسال إعلان عام</h3>
                <p className="text-sm text-slate-600 mb-6">استخدم هذا النموذج لإرسال رسالة أو إعلان لجميع مسؤولي الشركات المسجلين في المنصة.</p>
                <form onSubmit={handleSendAnnouncement} className="space-y-4">
                     <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">الموضوع</label>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md"
                            placeholder="مثال: تحديث جديد للمنصة"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">نص الرسالة</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md"
                            placeholder="اكتب محتوى رسالتك هنا..."
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-md hover:bg-emerald-700"
                        >
                            إرسال الإعلان الآن
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlatformSettings;
