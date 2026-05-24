"use client";
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { useTranslation } from '@/lib/LanguageContext';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useTranslation();

  return (
    <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-md border-b border-border-color h-16 flex items-center justify-end px-4 md:px-8 shrink-0 transition-colors duration-300">
      <div className="flex items-center bg-bg-card border border-border-color shadow-sm rounded-full p-1 gap-1">
        {/* Theme Toggle */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-blue-600 text-white shadow-sm' : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'}`}
            title={t('theme.light')}
          >
            <Sun size={16} />
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-blue-600 text-white shadow-sm' : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'}`}
            title={t('theme.dark')}
          >
            <Moon size={16} />
          </button>
          <button 
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-blue-600 text-white shadow-sm' : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'}`}
            title={t('theme.system')}
          >
            <Monitor size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="w-[1px] h-5 bg-border-color mx-1"></div>

        {/* Language Toggle */}
        <div className="flex items-center">
          <button 
            onClick={() => setLang('th')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${lang === 'th' ? 'bg-blue-600 text-white shadow-sm' : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'}`}
          >
            TH
          </button>
          <button 
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${lang === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'}`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
