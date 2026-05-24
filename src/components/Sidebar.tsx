"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Users, GraduationCap, Menu, X, Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { t, lang, setLang } = useTranslation();
  const { theme, setTheme } = useTheme();

  const menu = [
    { name: t('sidebar.dashboard'), icon: LayoutDashboard, path: '/' },
    { name: t('sidebar.courses'), icon: BookOpen, path: '/courses' },
    { name: t('sidebar.employees'), icon: Users, path: '/employees' },
    { name: t('sidebar.training'), icon: GraduationCap, path: '/training' },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  // wait until translation is mounted to avoid hydration warning, or just render empty string initially which is handled by t()
  
  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-5 left-5 z-40 p-2.5 bg-white rounded-xl shadow-md border border-slate-100 text-slate-600 hover:text-emerald-500 transition-colors"
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-bg text-sidebar-text p-4 flex flex-col transition-all duration-300 ease-in-out shadow-2xl md:shadow-none
        md:relative md:translate-x-0 border-r border-border-color/10
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex justify-between items-center mb-8 px-4 mt-2 md:mt-4">
          <div>
            <h1 className="text-2xl font-bold text-sidebar-active">{t('sidebar.title')}</h1>
            <p className="text-sidebar-text/70 text-sm mt-1">{t('sidebar.subtitle')}</p>
          </div>
          {/* Close Button on Mobile inside Sidebar */}
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden text-sidebar-text/70 hover:text-sidebar-text p-1 rounded-lg hover:bg-sidebar-hover transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 space-y-2">
          {menu.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setIsOpen(false)} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-sidebar-active/10 text-sidebar-active shadow-[inset_4px_0_0_0_var(--sidebar-active)]' : 'text-sidebar-text/80 hover:bg-sidebar-hover hover:text-sidebar-text'}`}
              >
                <Icon size={20} className={isActive ? "text-sidebar-active" : "text-sidebar-text/60"} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto space-y-3">
          {/* Theme & Language Toggle in one row */}
          <div className="bg-sidebar-hover/50 p-1 rounded-xl flex items-center justify-between">
            {/* Theme Toggle (Left) */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg transition-all ${theme === 'light' ? 'bg-sidebar-active text-white shadow-md' : 'text-sidebar-text/60 hover:text-sidebar-text hover:bg-sidebar-hover'}`}
                title={t('theme.light')}
              >
                <Sun size={16} />
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-sidebar-active text-white shadow-md' : 'text-sidebar-text/60 hover:text-sidebar-text hover:bg-sidebar-hover'}`}
                title={t('theme.dark')}
              >
                <Moon size={16} />
              </button>
              <button 
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-lg transition-all ${theme === 'system' ? 'bg-sidebar-active text-white shadow-md' : 'text-sidebar-text/60 hover:text-sidebar-text hover:bg-sidebar-hover'}`}
                title={t('theme.system')}
              >
                <Monitor size={16} />
              </button>
            </div>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-border-color/20 mx-1"></div>

            {/* Language Toggle (Right) */}
            <div className="flex items-center flex-1">
              <button 
                onClick={() => setLang('th')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${lang === 'th' ? 'bg-sidebar-active text-white shadow-md' : 'text-sidebar-text/60 hover:text-sidebar-text hover:bg-sidebar-hover'}`}
              >
                TH
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${lang === 'en' ? 'bg-sidebar-active text-white shadow-md' : 'text-sidebar-text/60 hover:text-sidebar-text hover:bg-sidebar-hover'}`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="bg-sidebar-hover p-3 rounded-xl border border-border-color/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-active flex items-center justify-center text-white font-bold text-sm shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-[10px] text-sidebar-text/60 truncate">{t('sidebar.admin')}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
