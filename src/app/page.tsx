"use client";
import { useState, useMemo } from "react";
import { UserCircle, CheckCircle, Clock, BookOpen, Calendar, AlertTriangle, XOctagon, Info, TrendingUp, Users, Award, ShieldCheck, Filter, CalendarHeart, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend, LineChart, Line } from "recharts";
import { useTranslation } from '@/lib/LanguageContext';
import { useData, type Course } from '@/lib/useData';

export default function Home() {
  const { t, lang, td } = useTranslation();
  const { courses: MOCK_COURSES, employees: MOCK_EMPLOYEES, records: MOCK_RECORDS, loading, error, refetch } = useData();
  const [activeTab, setActiveTab] = useState<'overview' | 'individual'>('overview');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('EMP-101');
  
  // Dashboard Filters
  const [timeFilter, setTimeFilter] = useState<'month' | 'quarter' | 'year' | 'all'>('month');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  const formatDateThai = (dateStr: string) => new Date(dateStr).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentQuarter = Math.floor(currentMonth / 3);

  // Filter Logic
  const deptFilteredRecords = useMemo(() => {
    return MOCK_RECORDS.filter(r => {
      const emp = MOCK_EMPLOYEES.find(e => e.id === r.empId);
      if (deptFilter === 'all') return true;
      return emp?.department === deptFilter;
    });
  }, [deptFilter]);

  const filteredRecords = useMemo(() => {
    return deptFilteredRecords.filter(r => {
      const d = new Date(r.date);
      const rMonth = d.getMonth();
      const rYear = d.getFullYear();
      const rQuarter = Math.floor(rMonth / 3);
      
      if (timeFilter === 'all') return true;
      if (timeFilter === 'year') return rYear === currentYear;
      if (timeFilter === 'quarter') return rYear === currentYear && rQuarter === currentQuarter;
      if (timeFilter === 'month') return rYear === currentYear && rMonth === currentMonth;
      return true;
    });
  }, [deptFilteredRecords, timeFilter, currentMonth, currentYear, currentQuarter]);

  // --- Metrics ---
  const uniqueEmpsTrained = new Set(filteredRecords.map(r => r.empId)).size;

  const passedRecords = filteredRecords.filter(r => r.score >= 70);
  const passRate = filteredRecords.length > 0 ? Math.round((passedRecords.length / filteredRecords.length) * 100) : 0;

  const totalPassedHours = passedRecords.reduce((sum, r) => {
    const course = MOCK_COURSES.find(c => c.id === r.courseId);
    return sum + (course ? course.hours : 0);
  }, 0);
  
  const relevantEmps = MOCK_EMPLOYEES.filter(e => deptFilter === 'all' || e.department === deptFilter);
  const avgHoursPerEmp = relevantEmps.length > 0 ? Math.round(totalPassedHours / relevantEmps.length) : 0;

  const validCertsCount = filteredRecords.filter(r => {
    if (r.score < 70) return false;
    const course = MOCK_COURSES.find(c => c.id === r.courseId);
    if (!course) return false;
    if (course.expiry_years === 0) return true;
    const expiryDate = new Date(r.date);
    expiryDate.setFullYear(expiryDate.getFullYear() + course.expiry_years);
    return expiryDate.getTime() >= today.getTime();
  }).length;

  // --- Charts Data ---
  // Bar Chart: Popular courses
  const courseCountMap: Record<string, number> = {};
  filteredRecords.forEach(r => {
    courseCountMap[r.courseId] = (courseCountMap[r.courseId] || 0) + 1;
  });
  const barChartData = Object.keys(courseCountMap).map(courseId => {
    const course = MOCK_COURSES.find(c => c.id === courseId);
    return { name: td(course ? course.title : courseId), count: courseCountMap[courseId] };
  }).sort((a, b) => b.count - a.count);

  // Pie Chart: Hours by Dept
  const deptColors: Record<string, string> = {
    'เตรียมไม้': '#3b82f6', // blue
    'แปรรูปไม้สด': '#f97316', // orange
    'คลังสินค้า': '#10b981', // blue
    'สำนักงาน': '#a855f7' // purple
  };
  const pieDataMap: Record<string, number> = {};
  passedRecords.forEach(r => {
    const emp = MOCK_EMPLOYEES.find(e => e.id === r.empId);
    const course = MOCK_COURSES.find(c => c.id === r.courseId);
    if (emp && course) {
      pieDataMap[emp.department] = (pieDataMap[emp.department] || 0) + course.hours;
    }
  });
  const pieChartData = Object.keys(pieDataMap).map(dept => ({
    name: td(dept), value: pieDataMap[dept], fill: deptColors[dept] || '#cbd5e1'
  }));

  // Line Chart: 6 Months Trend
  const lineChartData = useMemo(() => {
    const result = [];
    const d = new Date();
    d.setDate(1); // Set to 1st to avoid overflow
    for (let i = 5; i >= 0; i--) {
      const tempDate = new Date(d);
      tempDate.setMonth(tempDate.getMonth() - i);
      result.push({
        monthYear: tempDate.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short', year: '2-digit' }),
        month: tempDate.getMonth(),
        year: tempDate.getFullYear(),
        total: 0,
        pass: 0
      });
    }
    deptFilteredRecords.forEach(r => {
      const rd = new Date(r.date);
      const dataPt = result.find(ld => ld.month === rd.getMonth() && ld.year === rd.getFullYear());
      if (dataPt) {
        dataPt.total += 1;
        if (r.score >= 70) dataPt.pass += 1;
      }
    });
    return result;
  }, [deptFilteredRecords, lang]);

  // Heatmap: 365 Days Activity
  const heatmapDays = useMemo(() => {
    const today = new Date();
    const endDate = new Date(today);
    const dayOfWeek = endDate.getDay() === 0 ? 7 : endDate.getDay(); // 1=Mon
    endDate.setDate(endDate.getDate() + (7 - dayOfWeek)); // Shift to End of week (Sunday)
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (53 * 7) + 1); // 53 columns

    const countMap: Record<string, number> = {};
    deptFilteredRecords.forEach(r => {
      const d = r.date.split('T')[0];
      countMap[d] = (countMap[d] || 0) + 1;
    });

    const daysArray = [];
    const curr = new Date(startDate);
    while (curr <= endDate) {
      const dStr = curr.toISOString().split('T')[0];
      daysArray.push({
        dateStr: dStr,
        dateObj: new Date(curr),
        count: countMap[dStr] || 0,
        isFuture: curr.getTime() > today.getTime()
      });
      curr.setDate(curr.getDate() + 1);
    }
    return daysArray;
  }, [deptFilteredRecords]);

  const heatmapWeeks = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < heatmapDays.length; i += 7) {
      weeks.push(heatmapDays.slice(i, i + 7));
    }
    return weeks;
  }, [heatmapDays]);

  const getHeatmapColor = (count: number, isFuture: boolean) => {
    if (isFuture) return "bg-transparent";
    if (count === 0) return "bg-bg-primary border border-border-color";
    if (count === 1) return "bg-blue-200";
    if (count === 2) return "bg-blue-400";
    if (count >= 3 && count <= 4) return "bg-blue-600";
    return "bg-blue-800";
  };

  // --- Alerts ---
  interface AlertItem { type: 'expired' | 'expiring' | 'missing'; message: string; empName: string; }
  const alerts: AlertItem[] = [];

  deptFilteredRecords.forEach(r => {
    if (r.score >= 70) {
      const course = MOCK_COURSES.find(c => c.id === r.courseId);
      if (course && course.expiry_years > 0) {
        const expiryDate = new Date(r.date);
        expiryDate.setFullYear(expiryDate.getFullYear() + course.expiry_years);
        
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const emp = MOCK_EMPLOYEES.find(e => e.id === r.empId);
        
        if (diffDays < 0) {
          alerts.push({ type: 'expired', message: t('alert.expired', td(course.title), Math.abs(diffDays)), empName: td(emp?.fullName || r.empId) });
        } else if (diffDays <= 30) {
          alerts.push({ type: 'expiring', message: t('alert.expiring', td(course.title), diffDays), empName: td(emp?.fullName || r.empId) });
        }
      }
    }
  });

  relevantEmps.forEach(emp => {
    const compulsoryCourses = MOCK_COURSES.filter(c => c.is_compulsory);
    compulsoryCourses.forEach(course => {
      const hasPassed = MOCK_RECORDS.some(r => r.empId === emp.id && r.courseId === course.id && r.score >= 70);
      if (!hasPassed) {
        alerts.push({ type: 'missing', message: t('alert.missing', td(course.title)), empName: td(emp.fullName) });
      }
    });
  });

  // --- Logic for Individual Profile (Phase 5) ---
  const selectedEmp = MOCK_EMPLOYEES.find(e => e.id === selectedEmpId);
  const empRecords = MOCK_RECORDS.filter(r => r.empId === selectedEmpId);
  const sortedEmpRecords = [...empRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const indTotalHours = empRecords.filter(r => r.score >= 70).reduce((sum, r) => {
    const course = MOCK_COURSES.find(c => c.id === r.courseId);
    return sum + (course ? course.hours : 0);
  }, 0);

  const calculateExpiryDate = (recordDateStr: string, course?: Course) => {
    if (!course) return "-";
    if (course.expiry_years === 0) return t('courses.noExpiry');
    const date = new Date(recordDateStr);
    date.setFullYear(date.getFullYear() + course.expiry_years);
    return formatDateThai(date.toISOString());
  };

  const getTimeFilterLabel = () => {
    if (timeFilter === 'month') return t('dashboard.timeMonth');
    if (timeFilter === 'quarter') return t('dashboard.timeQuarter');
    if (timeFilter === 'year') return t('dashboard.timeYear');
    return t('dashboard.timeAll');
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64 text-slate-400 gap-2">
        <Loader2 className="animate-spin" size={20} /> กำลังโหลด Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl">
          เกิดข้อผิดพลาด: {error}
          <button onClick={refetch} className="ml-3 underline">ลองใหม่</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Page Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">{t('dashboard.title')}</h1>
          <p className="text-text-secondary">{t('dashboard.subtitle')}</p>
        </div>
        <div className="bg-bg-primary border border-border-color p-1.5 rounded-xl inline-flex w-fit shadow-inner">
          <button 
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'overview' ? 'bg-bg-card text-blue-600 shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setActiveTab('overview')}
          >
            {t('dashboard.tabOverview')}
          </button>
          <button 
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'individual' ? 'bg-bg-card text-blue-600 shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setActiveTab('individual')}
          >
            {t('dashboard.tabIndividual')}
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
          
          {/* Filters Bar */}
          <div className="bg-bg-card rounded-2xl border border-border-color/50 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 text-text-secondary font-medium whitespace-nowrap">
              <Filter size={18} /> {t('dashboard.filterTitle')}
            </div>
            <select 
              className="w-full sm:w-auto px-4 py-2 border border-border-color rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-bg-primary font-medium text-text-primary"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
            >
              <option value="month">{t('dashboard.timeMonth')}</option>
              <option value="quarter">{t('dashboard.timeQuarter')}</option>
              <option value="year">{t('dashboard.timeYear')}</option>
              <option value="all">{t('dashboard.timeAll')}</option>
            </select>
            <select 
              className="w-full sm:w-auto px-4 py-2 border border-border-color rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-bg-primary font-medium text-text-primary"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="all">{t('dashboard.deptAll')}</option>
              <option value="เตรียมไม้">{td('เตรียมไม้')}</option>
              <option value="แปรรูปไม้สด">{td('แปรรูปไม้สด')}</option>
              <option value="คลังสินค้า">{td('คลังสินค้า')}</option>
              <option value="สำนักงาน">{td('สำนักงาน')}</option>
            </select>
          </div>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <div className="bg-bg-card rounded-2xl border border-border-color/50 shadow-sm overflow-hidden">
              <div className="bg-bg-primary border-b border-border-color/50 px-6 py-4 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} />
                <h3 className="font-bold text-text-primary">{t('dashboard.alerts')}</h3>
                <span className="ml-auto bg-border-color text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">{alerts.length} {t('dashboard.items')}</span>
              </div>
              <div className="p-2 max-h-60 overflow-y-auto">
                <div className="space-y-2 p-2">
                  {alerts.map((alert, idx) => (
                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border ${
                      alert.type === 'expired' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                      alert.type === 'expiring' ? 'bg-orange-50 border-orange-100 text-orange-800' :
                      'bg-amber-50 border-amber-100 text-amber-800'
                    }`}>
                      <div className="mt-0.5 shrink-0">
                        {alert.type === 'expired' && <XOctagon size={18} className="text-rose-500" />}
                        {alert.type === 'expiring' && <Clock size={18} className="text-orange-500" />}
                        {alert.type === 'missing' && <Info size={18} className="text-amber-500" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-0.5">{alert.empName}</p>
                        <p className="text-sm opacity-90">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Metrics Row (4 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-bg-card rounded-2xl p-6 border border-border-color/50 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
              <Users className="text-blue-500 relative z-10 mb-4" size={28} />
              <p className="text-text-secondary font-medium mb-1 relative z-10">{t('dashboard.trainedEmp')} ({getTimeFilterLabel()})</p>
              <div className="flex items-end gap-2 relative z-10">
                <h2 className="text-4xl font-black text-text-primary">{uniqueEmpsTrained}</h2>
                <span className="text-text-secondary font-medium mb-1">{t('dashboard.person')}</span>
              </div>
            </div>

            <div className="bg-bg-card rounded-2xl p-6 border border-border-color/50 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
              <Award className="text-blue-500 relative z-10 mb-4" size={28} />
              <p className="text-text-secondary font-medium mb-1 relative z-10">{t('dashboard.passRate')}</p>
              <div className="flex items-end gap-2 relative z-10">
                <h2 className="text-4xl font-black text-text-primary">{passRate}</h2>
                <span className="text-text-secondary font-medium mb-1">%</span>
              </div>
            </div>

            <div className="bg-bg-card rounded-2xl p-6 border border-border-color/50 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-110 transition-transform"></div>
              <TrendingUp className="text-purple-500 relative z-10 mb-4" size={28} />
              <p className="text-text-secondary font-medium mb-1 relative z-10">{t('dashboard.avgHours')}</p>
              <div className="flex items-end gap-2 relative z-10">
                <h2 className="text-4xl font-black text-text-primary">{avgHoursPerEmp}</h2>
                <span className="text-text-secondary font-medium mb-1">{t('dashboard.hoursPerPerson')}</span>
              </div>
            </div>

            <div className="bg-bg-card rounded-2xl p-6 border border-border-color/50 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-sky-50 rounded-full group-hover:scale-110 transition-transform"></div>
              <ShieldCheck className="text-sky-500 relative z-10 mb-4" size={28} />
              <p className="text-text-secondary font-medium mb-1 relative z-10">{t('dashboard.validCerts')}</p>
              <div className="flex items-end gap-2 relative z-10">
                <h2 className="text-4xl font-black text-text-primary">{validCertsCount}</h2>
                <span className="text-text-secondary font-medium mb-1">{t('dashboard.certs')}</span>
              </div>
            </div>
          </div>

          {/* Charts Section (Bar & Pie) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-bg-card rounded-2xl p-6 border border-border-color/50 shadow-sm">
              <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-500" />
                {t('dashboard.popularCourses')}
              </h3>
              <div className="h-[250px] w-full">
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="count" name={t('dashboard.totalTrain')} fill="#10b981" radius={[6, 6, 0, 0]} barSize={40}>
                        {barChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#34d399'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-secondary/70 font-medium">{t('common.noData')}</div>
                )}
              </div>
            </div>

            <div className="bg-bg-card rounded-2xl p-6 border border-border-color/50 shadow-sm">
              <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <Clock size={20} className="text-blue-500" />
                {t('dashboard.hoursByDept')}
              </h3>
              <div className="h-[250px] w-full">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-secondary/70 font-medium">{t('common.noData')}</div>
                )}
              </div>
            </div>
          </div>

          {/* Heatmap Section */}
          <div className="bg-bg-card rounded-2xl p-6 border border-border-color/50 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
              <CalendarHeart size={20} className="text-blue-500" />
              {t('dashboard.heatmapTitle')}
            </h3>
            
            <div className="overflow-x-auto pb-4">
              <div className="min-w-max flex flex-col">
                <div className="flex gap-[2px] mb-2 text-xs text-text-secondary/70 font-medium pl-6">
                  {heatmapWeeks.map((week, wIdx) => {
                    const prevWeek = wIdx > 0 ? heatmapWeeks[wIdx - 1] : null;
                    const monthStr = week[0].dateObj.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short' });
                    const prevMonthStr = prevWeek ? prevWeek[0].dateObj.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short' }) : null;
                    const showMonth = wIdx === 0 || monthStr !== prevMonthStr;
                    return (
                      <div key={`m-${wIdx}`} className="w-[12px] relative">
                        {showMonth && <span className="absolute -left-1 truncate w-10">{monthStr}</span>}
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex gap-2">
                  <div className="flex flex-col gap-[2px] text-[10px] text-text-secondary/70 font-medium text-right pr-1 mt-0.5">
                    <div className="h-[12px] leading-[12px]">{t('day.mon')}</div>
                    <div className="h-[12px]"></div>
                    <div className="h-[12px] leading-[12px]">{t('day.wed')}</div>
                    <div className="h-[12px]"></div>
                    <div className="h-[12px] leading-[12px]">{t('day.fri')}</div>
                    <div className="h-[12px]"></div>
                    <div className="h-[12px]"></div>
                  </div>
                  
                  <div className="flex gap-[2px]">
                    {heatmapWeeks.map((week, wIdx) => (
                      <div key={`w-${wIdx}`} className="flex flex-col gap-[2px]">
                        {week.map((day, dIdx) => (
                          <div 
                            key={`d-${dIdx}`} 
                            title={`${formatDateThai(day.dateStr)} · ${day.count === 0 ? t('dashboard.heatmapNoData') : t('dashboard.heatmapData', day.count)}`}
                            className={`w-[12px] h-[12px] rounded-sm ${getHeatmapColor(day.count, day.isFuture)} transition-colors hover:ring-1 hover:ring-blue-500`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 text-xs text-text-secondary font-medium mt-4">
              <span>{t('dashboard.heatmapLess')}</span>
              <div className="flex gap-[3px]">
                <div className="w-[12px] h-[12px] rounded-sm bg-bg-primary border border-border-color"></div>
                <div className="w-[12px] h-[12px] rounded-sm bg-blue-200"></div>
                <div className="w-[12px] h-[12px] rounded-sm bg-blue-400"></div>
                <div className="w-[12px] h-[12px] rounded-sm bg-blue-600"></div>
                <div className="w-[12px] h-[12px] rounded-sm bg-blue-800"></div>
              </div>
              <span>{t('dashboard.heatmapMore')}</span>
            </div>
          </div>

          {/* Line Chart Section */}
          <div className="bg-bg-card rounded-2xl p-6 border border-border-color/50 shadow-sm">
            <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-purple-500" />
              {t('dashboard.trend6Months')}
            </h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="monthYear" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey="total" name={t('dashboard.totalTrain')} stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="pass" name={t('common.pass')} stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* --- Phase 5 Content: Individual Profile --- */}
      {activeTab === 'individual' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-bg-card rounded-2xl p-6 border border-border-color/50 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-bg-primary border border-border-color text-text-secondary rounded-2xl flex items-center justify-center shrink-0">
              <UserCircle size={32} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-secondary mb-2">{t('emp.searchSelect')}</label>
              <select 
                className="w-full max-w-md px-4 py-3 border border-border-color rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-bg-primary font-medium text-text-primary text-lg"
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
              >
                {MOCK_EMPLOYEES.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.id} - {td(emp.fullName)} ({td(emp.department)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedEmp && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="col-span-1 space-y-6">
                <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-600/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-bg-card/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <h2 className="text-sm font-medium text-blue-100 mb-1">{t('emp.info')}</h2>
                  <p className="text-2xl font-bold mb-4">{td(selectedEmp.fullName)}</p>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-blue-500/30 pb-2">
                      <span className="text-blue-100">{t('emp.id')}</span><span className="font-bold">{selectedEmp.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-blue-500/30 pb-2">
                      <span className="text-blue-100">{t('emp.dept')}</span><span className="font-bold">{td(selectedEmp.department)}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-blue-100">{t('emp.position')}</span><span className="font-bold">{td(selectedEmp.position)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-bg-card rounded-3xl p-6 border border-border-color/50 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                    <Clock size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary mb-1">{t('emp.totalHours')}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-text-primary">{indTotalHours}</span>
                      <span className="text-text-secondary/70 font-medium">{t('courses.hours')}</span>
                    </div>
                    <p className="text-xs text-text-secondary/70 mt-1">{t('emp.hoursInfo')}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-1 lg:col-span-2">
                <div className="bg-bg-card rounded-3xl border border-border-color/50 shadow-sm p-6">
                  <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                    <BookOpen size={20} className="text-blue-500" /> {t('emp.trainingHistory')}
                    <span className="ml-auto text-sm font-medium bg-bg-primary border border-border-color text-text-secondary px-3 py-1 rounded-full">{t('emp.total')} {empRecords.length} {t('dashboard.items')}</span>
                  </h3>
                  {sortedEmpRecords.length > 0 ? (
                    <div className="space-y-4">
                      {sortedEmpRecords.map(record => {
                        const course = MOCK_COURSES.find(c => c.id === record.courseId);
                        const isPass = record.score >= 70;
                        const expiryText = calculateExpiryDate(record.date, course);
                        
                        return (
                          <div key={record.id} className="border border-border-color/50 rounded-2xl p-5 hover:border-blue-500/30 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="inline-block px-2 py-1 bg-bg-primary border border-border-color text-text-secondary text-xs font-bold rounded mb-2">{td(course?.category || '')}</span>
                                <h4 className="text-lg font-bold text-text-primary group-hover:text-blue-600 transition-colors">{td(course?.title || '')}</h4>
                              </div>
                              {isPass ? (
                                <div className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-lg flex flex-col items-center">
                                  <span className="text-xs font-medium mb-0.5">{t('common.pass')}</span><span className="text-lg font-bold">{record.score}</span>
                                </div>
                              ) : (
                                <div className="bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1.5 rounded-lg flex flex-col items-center">
                                  <span className="text-xs font-medium mb-0.5">{t('common.fail')}</span><span className="text-lg font-bold">{record.score}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-text-secondary">
                              <div className="flex items-center gap-1.5"><Calendar size={14} /> {t('emp.trainDate')} <span className="text-text-primary font-medium">{formatDateThai(record.date)}</span></div>
                              {isPass && course && course.hours > 0 && (
                                 <div className="flex items-center gap-1.5"><Clock size={14} /> {t('emp.hoursEarned')} <span className="text-blue-600 font-bold">+{course.hours} {t('dashboard.hoursPerPerson').split('/')[0]}</span></div>
                              )}
                              {isPass && (
                                <div className="flex items-center gap-1.5"><CheckCircle size={14} className="text-blue-500" /> {t('emp.expireDate')} <span className="text-text-primary font-medium">{expiryText}</span></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-border-color/50 rounded-2xl">
                      <div className="w-16 h-16 bg-bg-primary text-slate-300 rounded-full flex items-center justify-center mb-4"><BookOpen size={24} /></div>
                      <p className="text-text-secondary text-lg font-medium">{t('emp.noHistory')}</p>
                      <p className="text-text-secondary/70 text-sm">{t('emp.noHistoryDesc')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
