"use client";
import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, BookOpen, Clock, AlertCircle } from "lucide-react";
import { useTranslation } from '@/lib/LanguageContext';

type CourseCategory = 'ความปลอดภัย' | 'ทักษะงาน' | 'ปฐมนิเทศ';

interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  is_compulsory: boolean;
  hours: number;
  expiry_years: number; // 0 = no expiry
}

const MOCK_COURSES: Course[] = [
  { id: 'SFT-001', title: 'ความปลอดภัยในการทำงานกับเครื่องจักร', category: 'ความปลอดภัย', is_compulsory: true, hours: 6, expiry_years: 1 },
  { id: 'ORI-001', title: 'ปฐมนิเทศพนักงานใหม่', category: 'ปฐมนิเทศ', is_compulsory: true, hours: 3, expiry_years: 0 },
  { id: 'SKL-001', title: 'เทคนิคการแปรรูปไม้ยางพารา', category: 'ทักษะงาน', is_compulsory: false, hours: 12, expiry_years: 2 },
];

export default function CoursesPage() {
  const { t, td } = useTranslation();
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  const [formData, setFormData] = useState<Partial<Course>>({
    id: '', title: '', category: 'ความปลอดภัย', is_compulsory: false, hours: 0, expiry_years: 0
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({ id: '', title: '', category: 'ความปลอดภัย', is_compulsory: false, hours: 0, expiry_years: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({ ...course });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('training.confirmDel'))) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.id || !formData.title) {
      alert(t('training.scoreMissing'));
      return;
    }

    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? { ...formData } as Course : c));
    } else {
      setCourses([...courses, { ...formData } as Course]);
    }
    setIsModalOpen(false);
  };

  const compulsoryCount = courses.filter(c => c.is_compulsory).length;
  const avgHours = courses.length ? Math.round(courses.reduce((acc, curr) => acc + curr.hours, 0) / courses.length) : 0;

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('courses.title')}</h1>
          <p className="text-slate-500">{t('courses.subtitle')}</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30"
        >
          <Plus size={20} />
          {t('courses.addBtn')}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">{t('courses.total')}</p>
            <p className="text-2xl font-bold text-slate-800">{courses.length} <span className="text-sm font-medium text-slate-500">{t('courses.courses')}</span></p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">{t('courses.compulsory')}</p>
            <p className="text-2xl font-bold text-slate-800">{compulsoryCount} <span className="text-sm font-medium text-slate-500">{t('courses.courses')}</span></p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">{t('courses.avgHours')}</p>
            <p className="text-2xl font-bold text-slate-800">{avgHours} <span className="text-sm font-medium text-slate-500">{t('courses.hours')}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t('courses.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 text-left font-medium w-32">{t('courses.colId')}</th>
                <th className="px-6 py-4 text-left font-medium">{t('courses.colTitle')}</th>
                <th className="px-6 py-4 text-left font-medium w-36">{t('courses.colCategory')}</th>
                <th className="px-6 py-4 text-center font-medium w-28">{t('courses.colHours')}</th>
                <th className="px-6 py-4 text-center font-medium w-32">{t('courses.colExpiry')}</th>
                <th className="px-6 py-4 text-center font-medium w-28">{t('courses.colCompulsory')}</th>
                <th className="px-6 py-4 text-right font-medium w-28">{t('common.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase())).map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{course.id}</td>
                  <td className="px-6 py-4 text-slate-800">{td(course.title)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {td(course.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600">{course.hours} {t('courses.hours')}</td>
                  <td className="px-6 py-4 text-center text-slate-600">
                    {course.expiry_years === 0 ? <span className="text-emerald-500 font-medium text-xs bg-emerald-50 px-2 py-1 rounded">{t('courses.noExpiry')}</span> : `${course.expiry_years} ${t('courses.years')}`}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {course.is_compulsory ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 text-sm font-medium bg-amber-50 px-2 py-1 rounded">
                        ✓ {t('courses.colCompulsory')}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(course)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal เพิ่ม/แก้ไข */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingCourse ? t('courses.editModal') : t('courses.addModal')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">{t('courses.formId')}</label>
                 <input 
                   type="text" 
                   className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" 
                   value={formData.id}
                   onChange={e => setFormData({...formData, id: e.target.value})}
                   disabled={!!editingCourse}
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">{t('courses.formTitle')}</label>
                 <input 
                   type="text" 
                   className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" 
                   value={formData.title}
                   onChange={e => setFormData({...formData, title: e.target.value})}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t('courses.formCategory')}</label>
                   <select 
                     className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                     value={formData.category}
                     onChange={e => setFormData({...formData, category: e.target.value as CourseCategory})}
                   >
                     <option value="ความปลอดภัย">{td('ความปลอดภัย')}</option>
                     <option value="ทักษะงาน">{td('ทักษะงาน')}</option>
                     <option value="ปฐมนิเทศ">{td('ปฐมนิเทศ')}</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t('courses.formHours')}</label>
                   <input 
                     type="number" 
                     className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" 
                     value={formData.hours}
                     onChange={e => setFormData({...formData, hours: Number(e.target.value)})}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t('courses.formExpiry')} (0 = {t('courses.noExpiry')})</label>
                   <input 
                     type="number" 
                     className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" 
                     value={formData.expiry_years}
                     onChange={e => setFormData({...formData, expiry_years: Number(e.target.value)})}
                   />
                 </div>
                 <div className="flex flex-col justify-end pb-2">
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                       type="checkbox" 
                       className="w-4 h-4 text-emerald-500 focus:ring-emerald-500/20 border-slate-300 rounded"
                       checked={formData.is_compulsory}
                       onChange={e => setFormData({...formData, is_compulsory: e.target.checked})}
                     />
                     <span className="text-sm font-medium text-slate-700">{t('courses.formCompulsory')}</span>
                   </label>
                 </div>
               </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors shadow-md shadow-emerald-500/20"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
