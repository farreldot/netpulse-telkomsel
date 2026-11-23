import React from 'react';
import { NavLink } from 'react-router-dom';
import { Radio, Activity, ScanLine, Users, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { isAdmin } = useAuth();

  const navItems = [
    {
      to: '/sites',
      label: 'Daftar Site',
      icon: Radio,
    },
    {
      to: '/logs',
      label: 'Log Sinyal',
      icon: Activity,
    },
    {
      to: '/scan',
      label: 'Uji OCR',
      icon: ScanLine,
      isSpecial: true,
    },
    ...(isAdmin
      ? [
          {
            to: '/mitra',
            label: 'Mitra',
            icon: Users,
          },
        ]
      : []),
    {
      to: '/profile',
      label: 'Profil',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe">
      <div className="max-w-md mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => {
                  if (item.isSpecial) {
                    return `flex flex-col items-center justify-center -mt-5 transition-transform active:scale-95`;
                  }
                  return `flex flex-col items-center justify-center py-1 px-2 min-w-[60px] rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-telkomsel-red font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`;
                }}
              >
                {({ isActive }) => {
                  if (item.isSpecial) {
                    return (
                      <>
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all ${
                            isActive
                              ? 'bg-telkomsel-darkred ring-4 ring-red-100 text-white scale-105'
                              : 'bg-telkomsel-red text-white hover:bg-telkomsel-darkred'
                          }`}
                        >
                          <Icon className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <span
                          className={`text-[11px] mt-1 font-medium ${
                            isActive ? 'text-telkomsel-red font-bold' : 'text-slate-600'
                          }`}
                        >
                          {item.label}
                        </span>
                      </>
                    );
                  }

                  return (
                    <>
                      <div
                        className={`p-1 rounded-lg transition-colors ${
                          isActive ? 'bg-red-50 text-telkomsel-red' : ''
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 transition-transform ${
                            isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[11px] tracking-tight ${
                          isActive ? 'font-bold text-telkomsel-red' : 'text-slate-500'
                        }`}
                      >
                        {item.label}
                      </span>
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
