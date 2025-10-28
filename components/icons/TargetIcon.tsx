import React from 'react';

export const TargetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 10-7.07 7.072m7.07-7.072a5 5 0 11-7.07 7.072m7.07-7.072L12 12m0 0l-3.536-3.536M12 12l3.536 3.536M12 12l-3.536 3.536" />
    </svg>
);