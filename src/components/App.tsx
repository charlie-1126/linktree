import { useState } from 'react';
import { Navigation } from './Navigation';
import { ProfilePage } from './ProfilePage';
import { StatsPage } from './StatsPage';

export function App() {
  const [currentPage, setCurrentPage] = useState<'profile' | 'stats'>('profile');

  return (
    <>
      <Navigation onPageChange={setCurrentPage} />
      
      {currentPage === 'profile' ? <ProfilePage /> : <StatsPage />}
    </>
  );
}
