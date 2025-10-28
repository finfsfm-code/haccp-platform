import React from 'react';

export const TemperatureIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5a3 3 0 11-6 0 3 3 0 016 0zM13.5 4.5v5.25A3.75 3.75 0 0110.5 15h-3a3.75 3.75 0 01-3.75-3.75V4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75h.008v.008H8.25V9.75zm0 2.25h.008v.008H8.25v-2.25zm0 2.25h.008v.008H8.25V14.25z" />
    </svg>
);

export default TemperatureIcon;