"use client";
import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Calendar, FileText, UserCircle, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from '@/lib/LanguageContext';

interface Course { id: string; title: string; expiry_years: number; }
interface Employee { id: string; fullName: string; department: string; }
interface TrainingRecord {
  id: string; // Internal record ID
  empId: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  trainer: string;
  score: number;
}

// Mock Data for Lookups
const MOCK_COURSES: Course[] = [
  { id: 'SFT-001', title: 'ความปลอดภัยในการทำงานกับเครื่องจักร', expiry_years: 1 },
  { id: 'ORI-001', title: 'ปฐมนิเทศพนักงานใหม่', expiry_years: 0 },
  { id: 'SKL-001', title: 'เทคนิคการแปรรูปไม้ยางพารา', expiry_years: 2 },
];

const MOCK_EMPLOYEES: Employee[] = [
  { id: 'EMP-101', fullName: 'สมชาย ใจดี', department: 'เตรียมไม้' },
  { id: 'EMP-102', fullName: 'วิชัย รักงาน', department: 'แปรรูปไม้สด' },
  { id: 'EMP-103', fullName: 'ดวงใจ ขยันยิ่ง', department: 'สำนักงาน' },
  { id: 'EMP-104', fullName: 'สมศักดิ์ กล้าหาญ', department: 'คลังสินค้า' },
];

const MOCK_RECORDS: TrainingRecord[] = [
  { id: 'TR-1001', empId: 'EMP-101', courseId: 'SFT-001', date: '2026-05-20', trainer: 'คุณวนัสรา', score: 85 },
  { id: 'TR-1002', empId: 'EMP-102', courseId: 'SKL-001', date: '2026-05-22', trainer: 'คุณสมภพ', score: 65 }, // Fail
  { id: 'TR-1003', empId: 'EMP-104', courseId: 'ORI-001', date: '2026-05-24', trainer: 'HR Team', score: 100 },
];

export default function TrainingPage() {
  const { t, lang, td } = useTranslation();
  const [records, setRecords] = useState<TrainingRecord[]>(MOCK_RECORDS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingRecord, setEditingRecord] = useState<TrainingRecord | null>(null);
  const [formData, setFormData] = useState<Partial<TrainingRecord>>({
    empId: '', courseId: '', date: new Date().toISOString().split('T')[0], trainer: '', score: 0
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const openAddModal = () => {
    setEditingRecord(null);
    setFormData({ 
      empId: '', courseId: '', date: new Date().toISOString().split('T')[0], trainer: '', score: 0 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record: TrainingRecord) => {
    setEditingRecord(record);
    setFormData({ ...record });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('training.confirmDel'))) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.empId || !formData.courseId || !formData.date || !formData.trainer) {
      alert(t('training.scoreMissing'));
      return;
    }
    
    if (formData.score !== undefined && (formData.score < 0 || formData.score > 100)) {
      alert(t('training.scoreRange'));
      return;
    }

    if (editingRecord) {
      setRecords(records.map(r => r.id === editingRecord.id ? { ...formData } as TrainingRecord : r));
    } else {
      const newId = `TR-${Date.now()}`;
      setRecords([...records, { ...formData, id: newId } as TrainingRecord]);
    }
    setIsModalOpen(false);
  };

  // Helper Functions
  const getEmpDetails = (empId: string) => MOCK_EMPLOYEES.find(e => e.id === empId);
  const getCourseDetails = (courseId: string) => MOCK_COURSES.find(c => c.id === courseId);
  
  const formatDateThai = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Logic Phase 4: Calculate Expiry
  const calculateExpiryDate = (recordDateStr: string, course?: Course) => {
    if (!course) return "-";
    if (course.expiry_years === 0) return t('courses.noExpiry');
    
    const date = new Date(recordDateStr);
    date.setFullYear(date.getFullYear() + course.expiry_years);
    return formatDateThai(date.toISOString());
  };

  // Sort by date descending
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter
  const filteredRecords = sortedRecords.filter(r => {
    const emp = getEmpDetails(r.empId);
    const course = getCourseDetails(r.courseId);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (emp && emp.fullName.toLowerCase().includes(searchLower)) ||
      (emp && emp.id.toLowerCase().includes(searchLower)) ||
      (course && course.title.toLowerCase().includes(searchLower)) ||
      r.trainer.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('training.title')}</h1>
          <p className="text-slate-500">{t('training.subtitle')}</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30"
        >
          <Plus size={20} />
          {t('training.addBtn')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t('training.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500 font-medium flex items-center gap-2">
            <Calendar size={16} /> {t('training.sortDate')}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 text-left font-medium w-36">{t('training.colDate')}</th>
                <th className="px-6 py-4 text-left font-medium">{t('training.colEmp')}</th>
                <th className="px-6 py-4 text-left font-medium">{t('training.colCourse')}</th>
                <th className="px-6 py-4 text-center font-medium w-32">{t('training.colResult')}</th>
                <th className="px-6 py-4 text-center font-medium w-36">{t('training.colExpire')}</th>
                <th className="px-6 py-4 text-right font-medium w-28">{t('common.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => {
                const emp = getEmpDetails(record.empId);
                const course = getCourseDetails(record.courseId);
                
                // Logic Phase 4
                const isPass = record.score >= 70;
                const expiryText = calculateExpiryDate(record.date, course);
                
                return (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {formatDateThai(record.date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-bold">{td(emp?.fullName || record.empId)}</div>
                      <div className="text-slate-400 text-xs">{emp?.id} • {td(emp?.department || '')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700 font-medium line-clamp-1">{td(course?.title || record.courseId)}</div>
                      <div className="text-slate-400 text-xs">{t('training.trainerPrefix')} {td(record.trainer)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="font-bold text-slate-700 text-sm">{record.score} / 100</span>
                        {isPass ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <CheckCircle size={12} /> {t('common.pass')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                            <XCircle size={12} /> {t('common.fail')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {course?.expiry_years === 0 ? (
                         <span className="text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded">{t('courses.noExpiry')}</span>
                       ) : (
                         <div className="text-sm text-slate-600">{expiryText}</div>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(record)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    {t('common.noHistory')}
                  </td>
                </tr>
              )}
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
                {editingRecord ? t('training.editModal') : t('training.addModal')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t('training.formEmp')}</label>
                   <select 
                     className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                     value={formData.empId}
                     onChange={e => setFormData({...formData, empId: e.target.value})}
                   >
                     <option value="" disabled>{t('training.selectEmp')}</option>
                     {MOCK_EMPLOYEES.map(emp => (
                       <option key={emp.id} value={emp.id}>[{emp.id}] {td(emp.fullName)} ({td(emp.department)})</option>
                     ))}
                   </select>
                 </div>
                 <div className="col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t('training.formCourse')}</label>
                   <select 
                     className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                     value={formData.courseId}
                     onChange={e => setFormData({...formData, courseId: e.target.value})}
                   >
                     <option value="" disabled>{t('training.selectCourse')}</option>
                     {MOCK_COURSES.map(course => (
                       <option key={course.id} value={course.id}>[{course.id}] {td(course.title)}</option>
                     ))}
                   </select>
                 </div>
                 <div className="col-span-2 md:col-span-1">
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t('training.formDate')}</label>
                   <input 
                     type="date" 
                     className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium text-slate-700" 
                     value={formData.date}
                     onChange={e => setFormData({...formData, date: e.target.value})}
                   />
                 </div>
                 <div className="col-span-2 md:col-span-1">
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t('training.formScore')}</label>
                   <input 
                     type="number" 
                     min="0"
                     max="100"
                     className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" 
                     value={formData.score === undefined ? '' : formData.score}
                     onChange={e => setFormData({...formData, score: Number(e.target.value)})}
                   />
                 </div>
                 <div className="col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t('training.formTrainer')}</label>
                   <input 
                     type="text" 
                     className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" 
                     value={formData.trainer}
                     onChange={e => setFormData({...formData, trainer: e.target.value})}
                   />
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
