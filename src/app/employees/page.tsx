"use client";
import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Users, HardHat, Building2, PackageSearch, Loader2 } from "lucide-react";
import { useTranslation } from '@/lib/LanguageContext';
import { useData, saveEmployee, deleteEmployee, type Employee, type Department } from '@/lib/useData';

export default function EmployeesPage() {
  const { t, td } = useTranslation();
  const { employees, loading, error, refetch } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Employee>>({
    id: '', fullName: '', department: 'เตรียมไม้', position: ''
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const openAddModal = () => {
    setEditingEmp(null);
    setFormData({ id: '', fullName: '', department: 'เตรียมไม้', position: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({ ...emp });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('training.confirmDel'))) return;
    const { error: delErr } = await deleteEmployee(id);
    if (delErr) {
      alert(`ลบไม่สำเร็จ: ${delErr.message}`);
      return;
    }
    await refetch();
  };

  const handleSave = async () => {
    if (!formData.id || !formData.fullName || !formData.position) {
      alert(t('training.scoreMissing'));
      return;
    }
    setSaving(true);
    const emp: Employee = {
      id: formData.id!,
      fullName: formData.fullName!,
      department: (formData.department || 'เตรียมไม้') as Department,
      position: formData.position!,
    };
    const { error: saveErr } = await saveEmployee(emp, !!editingEmp);
    setSaving(false);
    if (saveErr) {
      alert(`บันทึกไม่สำเร็จ: ${saveErr.message}`);
      return;
    }
    setIsModalOpen(false);
    await refetch();
  };

  const uniqueDepts = new Set(employees.map(e => e.department)).size;

  const getDeptIcon = (dept: string) => {
    switch(dept) {
      case 'เตรียมไม้': return <HardHat size={16} className="text-amber-600" />;
      case 'แปรรูปไม้สด': return <PackageSearch size={16} className="text-blue-600" />;
      case 'คลังสินค้า': return <Building2 size={16} className="text-blue-600" />;
      default: return <Users size={16} className="text-purple-600" />;
    }
  };

  const getDeptStyle = (dept: string) => {
    switch(dept) {
      case 'เตรียมไม้': return "bg-amber-50 text-amber-700 border-amber-200";
      case 'แปรรูปไม้สด': return "bg-blue-50 text-blue-700 border-blue-200";
      case 'คลังสินค้า': return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64 text-slate-400 gap-2">
        <Loader2 className="animate-spin" size={20} /> กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl">
          เกิดข้อผิดพลาด: {error}
          <button onClick={refetch} className="ml-3 underline">ลองใหม่</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('employees.title')}</h1>
          <p className="text-slate-500">{t('employees.subtitle')}</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
        >
          <Plus size={20} />
          {t('employees.addBtn')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">{t('employees.total')}</p>
            <p className="text-2xl font-bold text-slate-800">{employees.length} <span className="text-sm font-medium text-slate-500">{t('dashboard.person')}</span></p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">{t('employees.depts')}</p>
            <p className="text-2xl font-bold text-slate-800">{uniqueDepts} <span className="text-sm font-medium text-slate-500">{t('emp.dept')}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t('employees.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 text-left font-medium w-32">{t('employees.colId')}</th>
                <th className="px-6 py-4 text-left font-medium">{t('employees.colName')}</th>
                <th className="px-6 py-4 text-left font-medium w-48">{t('employees.colDept')}</th>
                <th className="px-6 py-4 text-left font-medium w-48">{t('employees.colPosition')}</th>
                <th className="px-6 py-4 text-right font-medium w-28">{t('common.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.filter(e => e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || e.id.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-600">{emp.id}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {emp.fullName.charAt(0)}
                      </div>
                      {td(emp.fullName)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getDeptStyle(emp.department)}`}>
                      {getDeptIcon(emp.department)}
                      {td(emp.department)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{td(emp.position)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(emp)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    {t('common.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal เพิ่ม/แก้ไขพนักงาน */}
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
                {editingEmp ? t('employees.editModal') : t('employees.addModal')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">{t('employees.formId')}</label>
                 <input 
                   type="text" 
                   className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                   value={formData.id}
                   onChange={e => setFormData({...formData, id: e.target.value})}
                   disabled={!!editingEmp}
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">{t('employees.formName')}</label>
                 <input 
                   type="text" 
                   className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                   value={formData.fullName}
                   onChange={e => setFormData({...formData, fullName: e.target.value})}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t('employees.formDept')}</label>
                   <select 
                     className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                     value={formData.department}
                     onChange={e => setFormData({...formData, department: e.target.value as Department})}
                   >
                     <option value="เตรียมไม้">{td('เตรียมไม้')}</option>
                     <option value="แปรรูปไม้สด">{td('แปรรูปไม้สด')}</option>
                     <option value="คลังสินค้า">{td('คลังสินค้า')}</option>
                     <option value="สำนักงาน">{td('สำนักงาน')}</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t('employees.formPosition')}</label>
                   <input 
                     type="text" 
                     className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                     value={formData.position}
                     onChange={e => setFormData({...formData, position: e.target.value})}
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
                disabled={saving}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
