import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col justify-between">
      <Header />
      
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 pb-28">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
