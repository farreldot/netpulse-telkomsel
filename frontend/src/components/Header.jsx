import React, { useState, useEffect } from 'react';
import { Radio, Wifi, WifiOff, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-telkomsel-red via-red-600 to-telkomsel-darkred text-white shadow-md pt-safe">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-extrabold text-base tracking-tight leading-none text-white">
                NetPulse <span className="font-medium text-red-200">Log</span>
              </h1>
              <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Telkomsel
              </span>
            </div>
            <p className="text-[11px] text-red-100 font-medium tracking-tight mt-0.5">
              BTS & Drive Test Monitoring
            </p>
          </div>
        </div>

        {/* Status Pill & User Role */}
        <div className="flex items-center space-x-2">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all text-xs flex items-center space-x-1 active:scale-95"
              title="Install NetPulse PWA"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold hidden sm:inline">Install</span>
            </button>
          )}

          {/* Online/Offline indicator */}
          <div
            className={`flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full border ${
              isOnline
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
                : 'bg-amber-500/20 border-amber-400/40 text-amber-100'
            }`}
            title={isOnline ? 'Online - Terhubung ke Jaringan' : 'Offline - Menggunakan Cache Lokal'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-300" />
                <span className="text-[10px] font-medium hidden xs:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-300" />
                <span className="text-[10px] font-medium">Offline</span>
              </>
            )}
          </div>

          {/* User Role Badge */}
          {user && (
            <div className="bg-white text-telkomsel-red font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
              {user.role}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
