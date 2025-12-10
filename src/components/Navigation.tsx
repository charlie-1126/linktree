import { User, Trophy } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  onPageChange: (page: 'profile' | 'stats') => void;
}

export function Navigation({ onPageChange }: NavigationProps) {
  const [activePage, setActivePage] = useState<'profile' | 'stats'>('profile');

  const handlePageChange = (page: 'profile' | 'stats') => {
    setActivePage(page);
    onPageChange(page);
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-1.5 mb-4 sm:mb-8 flex gap-1.5">
      <button
        onClick={() => handlePageChange('profile')}
        className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg transition-all ${
          activePage === 'profile'
            ? 'bg-white text-black font-medium'
            : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
        }`}
      >
        <User size={20} />
        <span className="hidden sm:inline">프로필</span>
      </button>
      <button
        onClick={() => handlePageChange('stats')}
        className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg transition-all ${
          activePage === 'stats'
            ? 'bg-white text-black font-medium'
            : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
        }`}
      >
        <Trophy size={20} />
        <span className="hidden sm:inline">전적</span>
      </button>
    </div>
  );
}
