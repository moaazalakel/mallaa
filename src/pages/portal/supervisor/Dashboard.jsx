import { useMemo, useRef, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { auditsStorage, casesStorage, usersStorage } from '../../../data/storage';
import {
  CASE_STATUS,
  CHART_COLORS,
  DISABILITY_TYPES,
  EDUCATION_PROGRAMS,
  GOVERNORATES,
  INCLUSION_TYPES,
  REFERRAL_SOURCES,
  ROLES,
} from '../../../data/constants';
import KPICard from '../../../components/charts/KPICard';
import BarChart from '../../../components/charts/BarChart';
import DonutChart from '../../../components/charts/DonutChart';
import HeatMap from '../../../components/charts/HeatMap';
import RadarChart from '../../../components/charts/RadarChart';
import Card from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Select from '../../../components/ui/Select';
import DatePicker from '../../../components/ui/DatePicker';
import Button from '../../../components/ui/Button';
import ExportPdfButton from '../../../components/ui/ExportPdfButton';
import { IoCheckmarkCircle, IoPeople, IoTime } from 'react-icons/io5';
import { format, subMonths } from 'date-fns';

const Dashboard = () => {
  const exportRef = useRef(null);
  const { user, isSectionHead } = useAuth();

  const allCasesData = casesStorage.getAll();
  const allUsers = usersStorage.getAll();
  const allAudits = auditsStorage.getAll();

  const [selectedGovernorateId, setSelectedGovernorateId] = useState('');
  const [selectedDisabilityType, setSelectedDisabilityType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filters = useMemo(() => {
    return {
      selectedGovernorateId,
      selectedDisabilityType,
      fromDate,
      toDate,
    };
  }, [fromDate, selectedDisabilityType, selectedGovernorateId, toDate]);

  const parseISODate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  const isWithinRange = (dateValue) => {
    const d = parseISODate(dateValue);
    if (!d) return false;
    const from = parseISODate(filters.fromDate);
    const to = parseISODate(filters.toDate);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  };

  const filteredCases = useMemo(() => {
    let filtered = [...allCasesData];

    if (filters.selectedGovernorateId) {
      filtered = filtered.filter((c) => c.governorateId === filters.selectedGovernorateId);
    }

    if (filters.selectedDisabilityType) {
      filtered = filtered.filter((c) => c.disabilityType === filters.selectedDisabilityType);
    }

    if (filters.fromDate || filters.toDate) {
      filtered = filtered.filter((c) => isWithinRange(c.createdAt));
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [allCasesData, filters]);

  const specialists = useMemo(() => {
    return allUsers.filter((u) => u.role === ROLES.SPECIALIST);
  }, [allUsers]);

  const specialistsCount = useMemo(() => {
    if (!filters.selectedGovernorateId) return specialists.length;
    return specialists.filter((s) => s.governorateId === filters.selectedGovernorateId).length;
  }, [filters.selectedGovernorateId, specialists]);

  const totalCases = filteredCases.length;

  const avgReportDays = useMemo(() => {
    const diffs = filteredCases
      .map((c) => {
        const createdAt = c.createdAt ? new Date(c.createdAt) : null;
        const diagnosisDate = c.diagnosisDate ? new Date(c.diagnosisDate) : null;
        if (!createdAt || Number.isNaN(createdAt.getTime()) || !diagnosisDate || Number.isNaN(diagnosisDate.getTime())) {
          return null;
        }
        const diffDays = Math.round((diagnosisDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? diffDays : null;
      })
      .filter((v) => typeof v === 'number');

    if (diffs.length === 0) return 0;
    return Math.round(diffs.reduce((sum, v) => sum + v, 0) / diffs.length);
  }, [filteredCases]);

  const auditedCases = useMemo(() => {
    const byCaseId = new Map(allAudits.map((a) => [a.caseId, a]));
    return filteredCases
      .map((c) => ({ caseItem: c, audit: byCaseId.get(c.id) }))
      .filter((x) => Boolean(x.audit));
  }, [allAudits, filteredCases]);

  const noMajorNotesPct = useMemo(() => {
    if (auditedCases.length === 0) return 0;

    const isNoMajor = (audit) => {
      // demo logic: مكتملة + ملاحظات عامة قصيرة + أغلب المحاور ليست طويلة
      if (audit.reviewStatus !== 'مكتملة') return false;
      const generalLen = (audit.generalNotes || '').trim().length;
      if (generalLen >= 120) return false;
      const axes = audit.professionalAxesNotes || {};
      const axisLens = Object.values(axes).map((v) => (v || '').trim().length);
      const longAxes = axisLens.filter((n) => n >= 160).length;
      return longAxes === 0;
    };

    const ok = auditedCases.filter((x) => isNoMajor(x.audit)).length;
    return Math.round((ok / auditedCases.length) * 100);
  }, [auditedCases]);

  // KPI Drill-down refs
  const refCasesTable = useRef(null);
  const refSpecialists = useRef(null);
  const refTrends = useRef(null);

  const scrollToRef = (ref) => {
    if (!ref?.current) return;
    try {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      // noop
    }
  };

  // Gender distribution (Pie)
  const genderData = useMemo(() => {
    const male = filteredCases.filter((c) => c.gender === 'ذكر').length;
    const female = filteredCases.filter((c) => c.gender === 'أنثى').length;
    return [
      { name: 'الذكور', value: male },
      { name: 'الإناث', value: female },
    ];
  }, [filteredCases]);

  // Educational support structure cards (unique schools)
  const educationStructure = useMemo(() => {
    const publicSchools = new Set();
    const privateSchools = new Set();
    const inclusionOrSpecial = new Set();

    filteredCases.forEach((c) => {
      const schoolName = (c.school || '').trim();
      if (!schoolName) return;
      if (c.schoolType === 'مدارس حكومية') publicSchools.add(schoolName);
      if (c.schoolType === 'مدارس خاصة') privateSchools.add(schoolName);

      if (c.educationProgram && c.educationProgram !== 'التعليم الأساسي') inclusionOrSpecial.add(schoolName);
      if (c.inclusionType === 'جزئي') inclusionOrSpecial.add(schoolName);
    });

    return {
      publicCount: publicSchools.size,
      privateCount: privateSchools.size,
      inclusionOrSpecialCount: inclusionOrSpecial.size,
    };
  }, [filteredCases]);

  // Education program distribution
  const educationProgramData = useMemo(() => {
    const counts = Object.fromEntries(EDUCATION_PROGRAMS.map((p) => [p, 0]));
    filteredCases.forEach((c) => {
      if (c.educationProgram && counts[c.educationProgram] !== undefined) counts[c.educationProgram] += 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredCases]);

  // Referral source distribution (bar)
  const referralData = useMemo(() => {
    const counts = Object.fromEntries(REFERRAL_SOURCES.map((s) => [s, 0]));
    filteredCases.forEach((c) => {
      if (c.referralSource && counts[c.referralSource] !== undefined) counts[c.referralSource] += 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredCases]);

  // Specialists per governorate (heatmap/table)
  const specialistsPerGov = useMemo(() => {
    return GOVERNORATES.map((g) => {
      const count = specialists.filter((s) => s.governorateId === g.id).length;
      return { governorateId: g.id, governorateName: g.name, value: count };
    });
  }, [specialists]);

  const specialistsHeatMapData = useMemo(() => {
    return specialistsPerGov.map((g) => ({ governorateId: g.governorateId, value: g.value }));
  }, [specialistsPerGov]);

  // Professional axes (7) - statistical only
  const professionalAxes = useMemo(() => ([
    { key: 'axis1', label: 'التحضير والاستعداد المهني' },
    { key: 'axis2', label: 'جودة أدوات القياس المستخدمة' },
    { key: 'axis3', label: 'دقة التحليل والتفسير' },
    { key: 'axis4', label: 'جودة التوصيات والتقارير' },
    { key: 'axis5', label: 'التوثيق والحوكمة' },
    { key: 'axis6', label: 'التواصل المهني' },
    { key: 'axis7', label: 'التطوير المستمر والتعلم الذاتي' },
  ]), []);

  const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

  const hashString = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  const mulberry32 = (a) => {
    return () => {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const axisScoreFromAudit = (audit, caseId, axisKey) => {
    const note = (audit?.professionalAxesNotes?.[axisKey] || '').trim();
    const seed = `${caseId}|${axisKey}|${note.length}`;
    const rand = mulberry32(hashString(seed));
    const jitter = Math.round((rand() - 0.5) * 12); // -6..+6
    const base = note ? 72 + Math.min(22, Math.round(note.length / 8)) : 65;
    return clamp(base + jitter);
  };

  const governorateAxisAverages = useMemo(() => {
    const auditsByCaseId = new Map(allAudits.map((a) => [a.caseId, a]));
    return GOVERNORATES.map((g) => {
      const cases = filteredCases.filter((c) => c.governorateId === g.id);
      const scored = cases
        .map((c) => ({ c, a: auditsByCaseId.get(c.id) }))
        .filter((x) => Boolean(x.a));

      const axes = professionalAxes.map((ax) => {
        if (scored.length === 0) {
          const seed = `${g.id}|${ax.key}|fallback|${cases.length}`;
          const rand = mulberry32(hashString(seed));
          const base = 70 + Math.round((rand() - 0.5) * 10);
          return { name: ax.label, value: clamp(base) };
        }

        const avg = Math.round(
          scored.reduce((sum, x) => sum + axisScoreFromAudit(x.a, x.c.id, ax.key), 0) / scored.length
        );
        return { name: ax.label, value: clamp(avg) };
      });

      const overall = Math.round(axes.reduce((s, a) => s + a.value, 0) / axes.length);
      return {
        governorateId: g.id,
        governorateName: g.name,
        axes,
        overall,
      };
    });
  }, [allAudits, filteredCases, professionalAxes]);

  const radarAverages = useMemo(() => {
    // National average for radar chart (not affected by governorate filter)
    const stats = governorateAxisAverages;
    return professionalAxes.map((ax, idx) => {
      const avg = Math.round(stats.reduce((sum, g) => sum + (g.axes[idx]?.value || 0), 0) / Math.max(1, stats.length));
      return { name: ax.label, value: clamp(avg) };
    });
  }, [governorateAxisAverages, professionalAxes]);

  const overallRankingData = useMemo(() => {
    return [...governorateAxisAverages]
      .sort((a, b) => b.overall - a.overall)
      .map((g) => ({ name: g.governorateName, value: g.overall }));
  }, [governorateAxisAverages]);

  const detailedTableColumns = useMemo(() => {
    return [
      { header: 'المحافظة', accessor: 'governorateName' },
      { header: 'المتوسط الكلي', accessor: 'overall', render: (row) => `${row.overall}%` },
      ...professionalAxes.map((ax, idx) => ({
        header: ax.label,
        accessor: `axis_${idx}`,
        render: (row) => `${row.axes[idx]?.value ?? 0}%`,
      })),
    ];
  }, [professionalAxes]);

  // Trends over time (last 6 months) with inclusionType comparison
  const trendsData = useMemo(() => {
    const now = new Date();
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthCases = filteredCases.filter((c) => {
        const d = new Date(c.createdAt);
        return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
      });

      const total = monthCases.length;
      const full = monthCases.filter((c) => c.inclusionType === 'كلي').length;
      const partial = monthCases.filter((c) => c.inclusionType === 'جزئي').length;

      months.push({
        name: monthNames[monthDate.getMonth()],
        total,
        كلي: full,
        جزئي: partial,
      });
    }
    return months;
  }, [filteredCases]);

  const governorateOptions = useMemo(() => ([
    { value: '', label: 'جميع المحافظات' },
    ...GOVERNORATES.map((g) => ({ value: g.id, label: g.name })),
  ]), []);

  const disabilityOptions = useMemo(() => ([
    { value: '', label: 'جميع أنواع الإعاقة' },
    ...DISABILITY_TYPES.map((d) => ({ value: d, label: d })),
  ]), []);

  const clearFilters = () => {
    setSelectedGovernorateId('');
    setSelectedDisabilityType('');
    setFromDate('');
    setToDate('');
  };

  const downloadCsv = () => {
    // Export summary by governorate (current filtered view)
    const header = ['المحافظة', 'المتوسط_الكلي', ...professionalAxes.map((a) => a.label)];
    const rows = governorateAxisAverages.map((g) => [
      g.governorateName,
      String(g.overall),
      ...g.axes.map((a) => String(a.value)),
    ]);
    const csv = [header, ...rows].map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mallaa-dashboard-summary.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const selectedGovName = filters.selectedGovernorateId
    ? GOVERNORATES.find((g) => g.id === filters.selectedGovernorateId)?.name
    : 'جميع المحافظات';

  return (
    <div className="space-y-6" dir="rtl" ref={exportRef}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">لوحة المؤشرات الثالثة: لوحة المتابعة الإحصائية لمؤشرات الملاءة</h1>
          <p className="text-gray-600">
            متابعة إحصائية لمؤشرات الملاءة
            {filters.selectedGovernorateId ? <span className="text-[#211551] font-bold"> - {selectedGovName}</span> : null}
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3 md:items-end">
          <ExportPdfButton
            targetRef={exportRef}
            fileName={`لوحة-المتابعة-الإحصائية-لمؤشرات-الملاءة${filters.selectedGovernorateId ? `-${selectedGovName}` : ''}.pdf`}
            className="w-full md:w-auto"
          />
          <Button type="button" variant="outline" className="w-full md:w-auto" onClick={downloadCsv}>
            تحميل Excel (CSV)
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="المحافظة"
            value={filters.selectedGovernorateId}
            onChange={(e) => setSelectedGovernorateId(e.target.value)}
            options={governorateOptions}
          />
          <Select
            label="نوع الإعاقة"
            value={filters.selectedDisabilityType}
            onChange={(e) => setSelectedDisabilityType(e.target.value)}
            options={disabilityOptions}
          />
          <DatePicker
            label="الفترة الزمنية (من)"
            value={filters.fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <DatePicker
            label="الفترة الزمنية (إلى)"
            value={filters.toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button type="button" variant="outline" onClick={clearFilters}>
            مسح الفلاتر
          </Button>
        </div>
      </Card>

      {/* 1️⃣ KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button type="button" className="text-right" onClick={() => scrollToRef(refCasesTable)}>
          <KPICard title="إجمالي الحالات التشخيصية المسجلة" value={totalCases} icon={IoPeople} color="primary" />
        </button>
        <button type="button" className="text-right" onClick={() => scrollToRef(refSpecialists)}>
          <KPICard title="عدد أخصائيي التشخيص (حسب المحافظات)" value={specialistsCount} icon={IoPeople} color="info" />
        </button>
        <button type="button" className="text-right" onClick={() => scrollToRef(refTrends)}>
          <KPICard title="متوسط زمن إنجاز التقرير التشخيصي (يوم)" value={avgReportDays} icon={IoTime} color="warning" />
        </button>
        <button type="button" className="text-right" onClick={() => scrollToRef(refCasesTable)}>
          <KPICard title="نسبة الحالات المعتمدة دون ملاحظات جوهرية" value={`${noMajorNotesPct}%`} icon={IoCheckmarkCircle} color="success" />
        </button>
      </div>

      {/* 2️⃣ + 3️⃣ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="توزيع الطلبة حسب النوع الاجتماعي">
          <DonutChart data={genderData} height={300} innerRadius={0} outerRadius={95} />
        </Card>
        <Card title="البنية التعليمية الداعمة">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
              <p className="text-sm text-gray-600 mb-1">عدد المدارس الحكومية</p>
              <p className="text-2xl font-bold text-[#211551]">{educationStructure.publicCount}</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
              <p className="text-sm text-gray-600 mb-1">عدد المدارس الخاصة</p>
              <p className="text-2xl font-bold text-[#211551]">{educationStructure.privateCount}</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
              <p className="text-sm text-gray-600 mb-1">مدارس الدمج / التربية الخاصة</p>
              <p className="text-2xl font-bold text-[#211551]">{educationStructure.inclusionOrSpecialCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 4️⃣ + 5️⃣ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="توزيع الحالات حسب برنامج التعليم">
          <DonutChart data={educationProgramData} height={320} innerRadius={55} outerRadius={95} />
        </Card>
        <Card title="توزيع حالات الإحالة حسب المصدر">
          <BarChart
            data={referralData}
            dataKey="value"
            nameKey="name"
            barColor={CHART_COLORS.blue}
            height={320}
            horizontal={true}
          />
        </Card>
      </div>

      {/* 6️⃣ */}
      <div ref={refSpecialists}>
        <Card title="توزيع أخصائيي التشخيص حسب المحافظات (خريطة حرارية)">
          <HeatMap data={specialistsHeatMapData} height={280} />
          <div className="mt-4 text-sm text-gray-600">إجمالي الأخصائيين: {specialists.length}</div>
        </Card>
      </div>

      {/* 7️⃣ + 8️⃣ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="مقارنة أداء المحافظات حسب محاور الملاءة (عرض إحصائي)">
          <RadarChart data={radarAverages} height={420} />
        </Card>
        <Card title="الترتيب العام للمحافظات (Overall Ranking)">
          <BarChart
            data={overallRankingData}
            dataKey="value"
            nameKey="name"
            barColor={CHART_COLORS.orange}
            height={420}
            horizontal={true}
            maxValue={100}
          />
        </Card>
      </div>

      {/* 9️⃣ (لرئيس القسم فقط) */}
      {isSectionHead() ? (
        <Card title="جدول الدرجات التفصيلية (للمحللين فقط)">
          <Table columns={detailedTableColumns} data={governorateAxisAverages} />
        </Card>
      ) : null}

      {/* 🔟 */}
      <div ref={refTrends}>
        <Card title="اتجاهات الحالات عبر الزمن (آخر 6 أشهر) + مقارنة كلي/جزئي">
          <ResponsiveContainer width="100%" height={320}>
            <RechartsLineChart data={trendsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#374151', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="كلي" stroke={CHART_COLORS.green} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="جزئي" stroke={CHART_COLORS.purple} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="total" stroke={CHART_COLORS.blue} strokeWidth={2} dot={false} />
            </RechartsLineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-3">
            ملاحظة: هذا عرض تجميعي يعتمد على البيانات المسجلة (createdAt + inclusionType).
          </p>
        </Card>
      </div>

      {/* Drill-down target table */}
      <div ref={refCasesTable}>
        <Card title="تفاصيل الحالات (Drill Down)">
          <Table
            columns={[
              { header: 'رقم الحالة', accessor: 'id' },
              { header: 'اسم الطالب', accessor: 'studentName' },
              { header: 'المحافظة', accessor: 'governorateId', render: (row) => GOVERNORATES.find((g) => g.id === row.governorateId)?.name || '—' },
              { header: 'تاريخ التسجيل', accessor: 'createdAt', render: (row) => (row.createdAt ? format(new Date(row.createdAt), 'yyyy-MM-dd') : '—') },
              { header: 'نوع الإعاقة', accessor: 'disabilityType' },
              { header: 'برنامج التعليم', accessor: 'educationProgram' },
              { header: 'نوع الدمج', accessor: 'inclusionType' },
              { header: 'مصدر الإحالة', accessor: 'referralSource' },
              { header: 'حالة الحالة', accessor: 'status' },
            ]}
            data={filteredCases.slice(0, 50)}
          />
          <div className="mt-3 text-xs text-gray-500">
            يتم عرض أول 50 حالة فقط للحفاظ على سرعة الواجهة.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
