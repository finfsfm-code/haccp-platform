import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`text-white font-bold text-center ${className}`}>
        <h1 className="text-2xl tracking-wider">Food Safety est.</h1>
        <p className="text-lg font-semibold opacity-80">مؤسسة سلامة الغذاء</p>
    </div>
);
