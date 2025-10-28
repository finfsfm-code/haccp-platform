
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { SupportTicket } from '../types.ts';
import Modal from '../components/Modal.tsx';

const SupportTickets: React.FC = () => {
    const { supportTickets, updateSupportTicket } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [reply, setReply] = useState('');

    const handleOpenModal = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setReply(ticket.reply || '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTicket(null);
        setReply('');
    };

    const handleSendReply = async () => {
        if (selectedTicket && reply.trim()) {
            await updateSupportTicket(selectedTicket.id, reply);
            handleCloseModal();
        }
    };
    
    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">تذاكر الدعم الفني</h2>
            <div className="space-y-4">
                {supportTickets.map(ticket => (
                    <div key={ticket.id} className="p-4 border rounded-md flex justify-between items-center hover:bg-slate-50 cursor-pointer" onClick={() => handleOpenModal(ticket)}>
                        <div>
                            <p className="font-semibold text-slate-800">{ticket.subject}</p>
                            <p className="text-sm text-slate-600">{ticket.companyName} - {new Date(ticket.createdAt).toLocaleString('ar-SA')}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-800'}`}>
                            {ticket.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                        </span>
                    </div>
                ))}
            </div>

            {selectedTicket && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`تذكرة دعم: ${selectedTicket.subject}`}>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-md">
                            <p className="text-sm font-medium text-slate-600">من: {selectedTicket.companyName}</p>
                            <p className="mt-2 text-slate-800">{selectedTicket.message}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">الرد على التذكرة</label>
                            <textarea
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                rows={5}
                                className="w-full p-2 border border-slate-300 rounded-md"
                                placeholder={selectedTicket.status === 'closed' ? 'تم الرد على هذه التذكرة.' : 'اكتب ردك هنا...'}
                                disabled={selectedTicket.status === 'closed'}
                            />
                        </div>
                         <div className="flex justify-end pt-4">
                             <button onClick={handleCloseModal} type="button" className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">إغلاق</button>
                            {selectedTicket.status === 'open' && (
                                <button onClick={handleSendReply} className="me-3 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">إرسال الرد</button>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default SupportTickets;
