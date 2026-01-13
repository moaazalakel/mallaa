import { useMemo, useRef, useState } from 'react';
import { casesStorage, usersStorage, auditsStorage } from '../../../data/storage';
import { GOVERNORATES, ROLES, CASE_STATUS, CHART_COLORS } from '../../../data/constants';
import Card from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Select from '../../../components/ui/Select';
import ExportPdfButton from '../../../components/ui/ExportPdfButton';
import KPICard from '../../../components/charts/KPICard';
import RadarChart from '../../../components/charts/RadarChart';
import BarChart from '../../../components/charts/BarChart';
import { IoCheckmarkCircle, IoTime, IoDocumentText } from 'react-icons/io5';

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

// Deterministic fallback so values don't jump on filter/rerender (demo mode)
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

const SpecialistsList = () => {
  const exportRef = useRef(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState('');

  const allCases = casesStorage.getAll();
  const allUsers = usersStorage.getAll();
  const allAudits = auditsStorage.getAll();

  // Get all specialists
  const specialists = useMemo(() => {
    return allUsers
      .filter((u) => u.role === ROLES.SPECIALIST)
      .map((specialist) => {
        const governorate = GOVERNORATES.find((g) => g.id === specialist.governorateId);
        const cases = allCases.filter((c) => c.governorateId === specialist.governorateId);
        const completedCases = cases.filter((c) => c.status === CASE_STATUS.COMPLETED);
        const audits = allAudits.filter((a) => a.specialistId === specialist.id);
        
        // Calculate KPIs
        // Deterministic fallback jitter per specialist + data counts
        const seedKey = `${specialist.id}|g:${specialist.governorateId}|a:${audits.length}|c:${cases.length}|cc:${completedCases.length}`;
        const rand = mulberry32(hashString(seedKey));
        const jitter = (range) => Math.round((rand() - 0.5) * range);

        const avgDocScore = audits.length > 0
          ? Math.round(audits.reduce((sum, a) => sum + (a.documentCompletenessScore || 0), 0) / audits.length)
          : clamp(86 + jitter(18));
        
        const avgDiagScore = audits.length > 0
          ? Math.round(audits.reduce((sum, a) => sum + (a.diagnosticQualityScore || 0), 0) / audits.length)
          : clamp(84 + jitter(18));
        
        const avgComplianceScore = audits.length > 0
          ? Math.round(audits.reduce((sum, a) => sum + (a.complianceScore || 0), 0) / audits.length)
          : clamp(88 + jitter(12));

        const overallScore = Math.round((avgDocScore + avgDiagScore + avgComplianceScore) / 3);

        return {
          id: specialist.id,
          name: specialist.name,
          governorate: governorate?.name || 'غير محدد',
          governorateId: specialist.governorateId,
          totalCases: cases.length,
          completedCases: completedCases.length,
          completionRate: cases.length > 0 ? Math.round((completedCases.length / cases.length) * 100) : 0,
          avgDiagnosisTime: clamp(22 + jitter(12), 8, 60),
          documentScore: avgDocScore,
          diagnosticScore: avgDiagScore,
          complianceScore: avgComplianceScore,
          overallScore,
        };
      });
  }, [allUsers, allCases, allAudits]);

  const filteredSpecialists = useMemo(() => {
    if (!selectedGovernorate) return specialists;
    return specialists.filter((s) => s.governorateId === selectedGovernorate);
  }, [specialists, selectedGovernorate]);

  // Calculate overall KPIs
  const totalSpecialists = Math.max(1, filteredSpecialists.length);
  const avgToolAccuracy = Math.round(filteredSpecialists.reduce((sum, s) => sum + s.diagnosticScore, 0) / totalSpecialists);
  const avgDocCompletion = Math.round(filteredSpecialists.reduce((sum, s) => sum + s.documentScore, 0) / totalSpecialists);
  const avgCompliance = Math.round(filteredSpecialists.reduce((sum, s) => sum + s.complianceScore, 0) / totalSpecialists);
  const avgSpeed = Math.round(filteredSpecialists.reduce((sum, s) => sum + s.avgDiagnosisTime, 0) / totalSpecialists);

  // Bar chart data (sorted by overall score)
  const barData = useMemo(() => {
    // Keep this as a national comparison across governorates (not affected by filter)
    return [...specialists]
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((s) => ({
        name: s.governorate,
        value: s.overallScore,
      }));
  }, [specialists]);

  const columns = [
    { header: 'اسم الأخصائي', accessor: 'name' },
    { header: 'المحافظة', accessor: 'governorate' },
    { header: 'عدد الحالات', accessor: 'totalCases' },
    {
      header: 'دقة التقارير',
      accessor: 'documentScore',
      render: (row) => `${row.documentScore}%`,
    },
    {
      header: 'دقة الحكم',
      accessor: 'diagnosticScore',
      render: (row) => `${row.diagnosticScore}%`,
    },
    {
      header: 'زمن الإنجاز',
      accessor: 'avgDiagnosisTime',
      render: (row) => `${row.avgDiagnosisTime} يوم`,
    },
    {
      header: 'التقييم الكلي',
      accessor: 'overallScore',
      render: (row) => (
        <Badge variant={row.overallScore >= 80 ? 'success' : row.overallScore >= 60 ? 'warning' : 'danger'}>
          {row.overallScore}%
        </Badge>
      ),
    },
  ];

  const governorateOptions = [
    { value: '', label: 'جميع المحافظات' },
    ...GOVERNORATES.map((g) => ({ value: g.id, label: g.name })),
  ];

  return (
    <div className="space-y-6" dir="rtl" ref={exportRef}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">لوحة تقييم ملاءمة فريق التشخيص</h1>
          <p className="text-gray-600">تقييم جودة الأداء عبر المحاور التشخيصية للملاءة التربوية</p>
        </div>
        <div className="w-full md:w-64">
          <Select
            label="تصفية حسب المحافظة"
            value={selectedGovernorate}
            onChange={(e) => setSelectedGovernorate(e.target.value)}
            options={governorateOptions}
          />
        </div>
      </div>
      <div className="flex justify-start md:justify-end">
        <ExportPdfButton
          targetRef={exportRef}
          fileName={`لوحة-تقييم-ملاءمة-فريق-التشخيص${selectedGovernorate ? `-${GOVERNORATES.find(g=>g.id===selectedGovernorate)?.name || ''}` : ''}.pdf`}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="دقة استخدام أدوات التشخيص" value={`${avgToolAccuracy}%`} icon={IoDocumentText} color="success" />
        <KPICard title="دقة الحكم التربوي (التوصيات)" value={`${avgCompliance}%`} icon={IoCheckmarkCircle} color="success" />
        <KPICard title="سرعة الإنجاز (يوم)" value={`${avgSpeed}`} subtitle="متوسط 25 يوم" icon={IoTime} color="info" />
        <KPICard title="اكتمال المستندات" value={`${avgDocCompletion}%`} icon={IoDocumentText} color="warning" />
        <KPICard title="الالتزام بالخطة التشخيصية" value={`${avgCompliance}%`} icon={IoCheckmarkCircle} color="success" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="الأداء الكلي (مخطط الرادار)">
          <RadarChart
            data={[
              { name: 'دقة التشخيص', value: avgToolAccuracy },
              { name: 'دقة التوصيات', value: avgCompliance },
              { name: 'اكتمال المستندات', value: avgDocCompletion },
              { name: 'سرعة الإنجاز', value: 100 - (avgSpeed * 2) },
              { name: 'الالتزام', value: avgCompliance },
            ]}
            height={350}
          />
        </Card>

        <Card title="مقارنة مؤشر الملاءة الكلي بين المحافظات">
          <BarChart
            data={barData}
            dataKey="value"
            nameKey="name"
            barColor={CHART_COLORS.green}
            height={350}
            horizontal={true}
            maxValue={100}
          />
        </Card>
      </div>

      {/* Specialists Table */}
      <Card title="تقييم أداء أخصائيي التشخيص (المستوى الفردي)">
        <Table columns={columns} data={filteredSpecialists} />
      </Card>
    </div>
  );
};

export default SpecialistsList;
