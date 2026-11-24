import React, { useState, useEffect } from 'react';
import { Radio, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 pt-safe transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Identitas Brand & Logo Minimalis Telkomsel */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-telkomsel-gradient flex items-center justify-center shadow-md shadow-red-500/20 text-white">
            <Radio className="w-4 h-4 stroke-[2.4]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                NetPulse <span className="text-telkomsel-gradient font-black">Log</span>
              </h1>
              <span className="text-[10px] bg-red-50 text-telkomsel-red font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-red-200/60">
                Telkomsel
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight mt-0.5 hidden xs:block">
              BTS & Drive Test Monitoring
            </p>
          </div>
        </div>

        {/* Minimalist Controls: Network Status & User Role Badge */}
        <div className="flex items-center space-x-2.5">
          {/* Indikator Jaringan Online / Offline */}
          <div
            className={`flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-all ${
              isOnline
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700'
                : 'bg-amber-50/80 border-amber-200 text-amber-700'
            }`}
            title={isOnline ? 'Online - Jaringan Aktif' : 'Offline - Mode Cache PWA Aktif'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-[10px] font-semibold hidden sm:inline">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Badge Peran Pengguna (Admin / Mitra) */}
          {user && (
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border shadow-xs text-[11px] font-bold uppercase tracking-wider ${
                isAdmin
                  ? 'bg-red-50 text-telkomsel-red border-red-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-telkomsel-red' : 'bg-blue-600'}`}
              />
              <span>{user.role}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
