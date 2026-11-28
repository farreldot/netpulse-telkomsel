import React from 'react';
import { NavLink } from 'react-router-dom';
import { ScanLine, Radio, Activity, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { isAdmin } = useAuth();

  const navItems = [
    {
      to: '/scan',
      label: 'Uji OCR',
      icon: ScanLine,
    },
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
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-lg pb-safe md:bottom-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md lg:max-w-lg md:rounded-full md:border md:border-slate-200/90 md:shadow-floating md:pb-0 transition-all duration-300">
      <div className="max-w-md mx-auto md:max-w-none px-3 sm:px-4">
        <div className="flex items-center justify-around h-16 md:h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative py-1 px-1.5 focus:outline-none"
              >
                {({ isActive }) => (
                  <motion.div
                    whileTap={{ scale: 0.92 }}
                    className="flex flex-col items-center justify-center py-1 px-2 min-w-[54px] sm:min-w-[62px] relative rounded-xl"
                  >
                    {/* Active Background Pill Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavPill"
                        className="absolute inset-0 bg-red-50/90 rounded-2xl -z-10 border border-red-200/60"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    <div className="relative">
                      <Icon
                        className={`w-5 h-5 transition-all duration-200 ${
                          isActive
                            ? 'text-telkomsel-red stroke-[2.4] scale-105'
                            : 'text-slate-400 group-hover:text-slate-600 stroke-[1.8]'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight transition-colors ${
                        isActive
                          ? 'font-bold text-telkomsel-red'
                          : 'font-medium text-slate-500'
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
