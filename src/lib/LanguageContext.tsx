"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dictionaries } from './translations';

type Language = 'th' | 'en';

const dataDictionary: Record<string, string> = {
  'เตรียมไม้': 'Wood Prep',
  'แปรรูปไม้สด': 'Sawmill',
  'คลังสินค้า': 'Warehouse',
  'สำนักงาน': 'Office',
  'ความปลอดภัย': 'Safety',
  'ทักษะงาน': 'Job Skills',
  'ปฐมนิเทศ': 'Orientation',
  'ความปลอดภัยเครื่องจักร': 'Machine Safety',
  'ความปลอดภัยในการทำงานกับเครื่องจักร': 'Machine Safety',
  'ปฐมนิเทศพนักงานใหม่': 'New Employee Orientation',
  'การแปรรูปไม้ยางพารา': 'Rubberwood Processing',
  'เทคนิคการแปรรูปไม้ยางพารา': 'Rubberwood Processing',
  'การขับโฟล์คลิฟต์': 'Forklift Operation',
  'สมชาย ใจดี': 'Somchai Jaidee',
  'วิชัย รักงาน': 'Wichai Rakngan',
  'ดวงใจ ขยันยิ่ง': 'Duangjai Khayanying',
  'สมศักดิ์ กล้าหาญ': 'Somsak Klahan',
  'มานี สีใส': 'Manee Seesay',
  'พนักงานผลิต': 'Production Worker',
  'หัวหน้ากะ': 'Shift Leader',
  'เจ้าหน้าที่บุคคล': 'HR Officer',
  'พนักงานขับโฟล์คลิฟต์': 'Forklift Driver',
  'คุณวนัสรา': 'Ms. Vanasara',
  'คุณสมภพ': 'Mr. Sompop',
  'วิทยากร': 'Trainer',
  'HR': 'HR Team'
};

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, ...args: any[]) => string;
  td: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>('th');

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as Language;
    if (savedLang === 'en' || savedLang === 'th') {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('app-lang', newLang);
  };

  const t = (key: string, ...args: any[]) => {
    // ใช้ภาษาไทยเป็น default ระหว่าง SSR และก่อน mount เสร็จ
    // หลัง mount และอ่าน localStorage แล้วจะ re-render เอง
    let text = dictionaries[lang]?.[key] || dictionaries['th']?.[key] || key;
    if (args.length > 0) {
      args.forEach(arg => {
        text = text.replace(/%[sd]/, String(arg));
      });
    }
    return text;
  };

  const td = (text: string) => {
    if (lang === 'en' && dataDictionary[text]) {
      return dataDictionary[text];
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, td }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
