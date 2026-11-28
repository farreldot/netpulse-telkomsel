import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function Layout() {
  const location = useLocation();
  const isChangePassword = location.pathname === '/change-password';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900 selection:bg-red-500 selection:text-white">
      <Header />
      
      {/* Kontainer responsif luas: menyesuaikan penuh di desktop (max-w-6xl) dan mobile */}
      <main className={`flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 ${isChangePassword ? 'pb-12 md:pb-16' : 'pb-32 md:pb-36'}`}>
        <Outlet />
      </main>

      {!isChangePassword && <BottomNav />}
    </div>
  );
}
