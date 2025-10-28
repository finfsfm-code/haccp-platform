

import React from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon.tsx';
import { XCircleIcon } from './icons/XCircleIcon.tsx';
import { XIcon } from './icons/XIcon.tsx';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';
// FIX: Added .ts extension to resolve module.
import { Notification as NotificationType } from '../types.ts';

const Notification: React.FC<NotificationType> = ({ message, type }) => {
  const { showNotification } = useAppContext() as any; // Cast to any to access setNotification which is not in the context type but an implementation detail

  const handleClose = () => {
    // A bit of a hack since the context doesn't expose setNotification directly.
    // In a real app, you'd have a more robust notification system.
    // This is a simplified way to make it disappear for the mock.
    const root = document.querySelector('.fixed.top-5.right-5');
    if (root) {
        root.innerHTML = '';
    }
  };
  
  const iconMap = {
    success: <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />,
    error: <XCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />,
  };

  const styleMap = {
    success: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      button: 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600',
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      button: 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-offset-red-50 focus:ring-red-600',
    },
  };

  const styles = styleMap[type];
  const icon = iconMap[type];

  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
        <div className={`rounded-lg ${styles.bg} p-4 shadow-lg ring-1 ring-black ring-opacity-5`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {icon}
                </div>
                <div className="mx-3 flex-1 pt-0.5">
                    <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
                </div>
                <div className="flex flex-shrink-0">
                    <button
                        type="button"
                        onClick={handleClose}
                        className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.button}`}
                    >
                        <span className="sr-only">Dismiss</span>
                        <XIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Notification;