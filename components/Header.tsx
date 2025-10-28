

import React from 'react';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';
import { LogoutIcon } from './icons/LogoutIcon.tsx';
// FIX: Added .ts extension to resolve module.
import { TeamMember } from '../types.ts';

const Header: React.FC = () => {
  const { logout, currentUser } = useAppContext();

  const isTeamMember = currentUser?.role === 'TEAM_MEMBER';
  const displayName = isTeamMember ? (currentUser as TeamMember).name : currentUser?.companyName;
  const subText = isTeamMember ? currentUser?.companyName : 'مرحباً بعودتك!';
  
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };


  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-lg">
            {getInitials(displayName)}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">مرحباً، {displayName}</h1>
          <p className="text-sm text-slate-500">{subText}</p>
        </div>
      </div>
      <div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[var(--destructive)] transition-colors"
        >
          <LogoutIcon className="h-5 w-5"/>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </header>
  );
};

export default Header;