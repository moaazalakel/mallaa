import { useState, useMemo, useRef } from 'react';
import { casesStorage, usersStorage, activitiesStorage } from '../../../data/storage';
import { GOVERNORATES, CASE_STATUS, GOVERNANCE_AXES, CHART_COLORS } from '../../../data/constants';
import Card from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Select from '../../../components/ui/Select';
import ExportPdfButton from '../../../components/ui/ExportPdfButton';
import ExportCsvButton from '../../../components/ui/ExportCsvButton';
import RadarChart from '../../../components/charts/RadarChart';
import BarChart from '../../../components/charts/BarChart';

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

// Deterministic tiny PRNG so dashboard scores don't "jump" on re-render/filter change
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

const GovernoratesList = () => {
  const exportRef = useRef(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState('');

  const allCases = casesStorage.getAll();
  const allUsers = usersStorage.getAll();
  const allActivities = activitiesStorage.getAll();

  // Calculate stats per governorate
  const governorateStats = useMemo(() => {
    return GOVERNORATES.map((gov) => {
      const cases = allCases.filter((c) => c.governorateId === gov.id);
      const completedCases = cases.filter((c) => c.status === CASE_STATUS.COMPLETED);
      const specialist = allUsers.find((u) => u.governorateId === gov.id && u.role === 'الأخصائي');
      const activities = allActivities.filter((a) => a.governorateId === gov.id);

      const completionRate = cases.length > 0 ? Math.round((completedCases.length / cases.length) * 100) : 0;

      // Deterministic jitter tied to governorate + current counts (changes when data changes, not when filter changes)
      const seedKey = `${gov.id}|c:${cases.length}|cc:${completedCases.length}|a:${activities.length}`;
      const rand = mulberry32(hashString(seedKey));
      const jitter = (range) => Math.round((rand() - 0.5) * range);

      // Demo-but-stable KPI scores derived from real signals + small jitter
      const docScore = clamp(Math.round(62 + completionRate * 0.18 + Math.min(20, activities.length * 2) + jitter(8)));
      const diagScore = clamp(Math.round(66 + completionRate * 0.22 + Math.min(18, completedCases.length * 1.5) + jitter(8)));
      const speedScore = clamp(Math.round(60 + completionRate * 0.15 + jitter(10)));
      const complianceScore = clamp(Math.round(70 + completionRate * 0.12 + jitter(8)));

      const overallScore = Math.round((completionRate + docScore + diagScore + speedScore + complianceScore) / 5);

      return {
        id: gov.id,
        name: gov.name,
        totalCases: cases.length,
        completedCases: completedCases.length,
        completionRate,
        specialist: specialist?.name || 'غير معين',
        activities: activities.length,
        overallScore,
        docScore,
        diagScore,
        speedScore,
        complianceScore,
        kpiScores: GOVERNANCE_AXES.map((axis, i) => {
          const values = [
            completionRate,
            docScore,
            diagScore,
            speedScore,
            complianceScore,
            clamp(Math.round(72 + completionRate * 0.1 + jitter(10))), // رضا المستفيدين (مؤشر توضيحي)
            clamp(Math.round(68 + completionRate * 0.12 + jitter(10))), // كفاءة الفريق (مؤشر توضيحي)
            clamp(Math.round(70 + completionRate * 0.08 + jitter(10))), // الحوكمة/الالتزام (مؤشر توضيحي)
          ];
          return { name: axis, value: values[i] ?? 75 };
        }),
      };
    });
  }, [allCases, allUsers, allActivities]);

  // Filter stats based on selected governorate
  const filteredStats = useMemo(() => {
    if (!selectedGovernorate) return governorateStats;
    return governorateStats.filter(g => g.id === selectedGovernorate);
  }, [governorateStats, selectedGovernorate]);

  // Calculate overall KPIs
  const overallKPIs = useMemo(() => {
    const compute = (stats) => {
      const count = Math.max(1, stats.length);
      return {
        avgCompletion: Math.round(stats.reduce((sum, g) => sum + g.completionRate, 0) / count),
        avgDocScore: Math.round(stats.reduce((sum, g) => sum + g.docScore, 0) / count),
        avgDiagScore: Math.round(stats.reduce((sum, g) => sum + g.diagScore, 0) / count),
        avgSpeedScore: Math.round(stats.reduce((sum, g) => sum + g.speedScore, 0) / count),
        avgComplianceScore: Math.round(stats.reduce((sum, g) => sum + g.complianceScore, 0) / count),
        avgOverall: Math.round(stats.reduce((sum, g) => sum + g.overallScore, 0) / count),
      };
    };

    const national = compute(governorateStats);
    const filtered = compute(filteredStats.length > 0 ? filteredStats : governorateStats);

    return { national, filtered };
  }, [filteredStats, governorateStats]);

  // Radar chart data
  const radarData = useMemo(() => {
    const stats = filteredStats.length > 0 ? filteredStats : governorateStats;
    return GOVERNANCE_AXES.map((axis, index) => {
      const avgScore = Math.round(
        stats.reduce((sum, gov) => sum + gov.kpiScores[index].value, 0) / stats.length
      );
      return { name: axis, value: avgScore };
    });
  }, [filteredStats, governorateStats]);

  // Bar chart data (sorted by overall score)
  const barData = useMemo(() => {
    // IMPORTANT: This chart should NOT change with the filter (always show all governorates)
    return [...governorateStats]
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((gov) => ({
        name: gov.name,
        value: gov.overallScore,
      }));
  }, [governorateStats]);

  const columns = [
    { header: 'المحافظة', accessor: 'name' },
    { header: 'إجمالي الحالات', accessor: 'totalCases' },
    { header: 'الحالات المكتملة', accessor: 'completedCases' },
    {
      header: 'نسبة الإكمال',
      accessor: 'completionRate',
      render: (row) => (
        <Badge variant={row.completionRate >= 80 ? 'success' : row.completionRate >= 60 ? 'warning' : 'danger'}>
          {row.completionRate}%
        </Badge>
      ),
    },
    { header: 'الأخصائي', accessor: 'specialist' },
    { header: 'الأنشطة', accessor: 'activities' },
    {
      header: 'التقييم العام',
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
    ...GOVERNORATES.map(g => ({ value: g.id, label: g.name }))
  ];

  const csvHeader = ['المحافظة', 'إجمالي الحالات', 'الحالات المكتملة', 'نسبة الإكمال', 'الأخصائي', 'الأنشطة', 'التقييم العام'];
  const csvRows = useMemo(() => {
    return filteredStats.map((row) => ([
      row.name,
      row.totalCases,
      row.completedCases,
      `${row.completionRate}%`,
      row.specialist,
      row.activities,
      `${row.overallScore}%`,
    ]));
  }, [filteredStats]);

  // KPI Card Component
  const KPIBox = ({ title, value, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-[#211551] text-white',
      success: 'bg-emerald-500 text-white',
      warning: 'bg-amber-500 text-white',
      info: 'bg-blue-500 text-white',
      purple: 'bg-purple-600 text-white',
    };

    return (
      <div className={`${colorClasses[color]} rounded-lg p-4 text-center shadow-md`}>
        <p className="text-3xl font-bold mb-1">{value}%</p>
        <p className="text-sm opacity-90">{title}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl" ref={exportRef}>
      {/* Header with Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">لوحة تقييم الملاءة على مستوى المحافظات</h1>
          <p className="text-gray-600">مقارنة الأداء المؤسسي لفرق التشخيص اللامركزية عبر المحافظات</p>
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3 md:items-end">
          <div className="w-full md:w-64">
            <Select
              label="تصفية حسب المحافظة"
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              options={governorateOptions}
            />
          </div>
          <ExportPdfButton
            targetRef={exportRef}
            fileName={`لوحة-تقييم-الملاءة-على-مستوى-المحافظات${selectedGovernorate ? `-${GOVERNORATES.find(g=>g.id===selectedGovernorate)?.name || ''}` : ''}.pdf`}
            className="w-full md:w-auto"
          />
          <ExportCsvButton
            fileName={`لوحة-تقييم-الملاءة-على-مستوى-المحافظات${selectedGovernorate ? `-${GOVERNORATES.find(g=>g.id===selectedGovernorate)?.name || ''}` : ''}.csv`}
            header={csvHeader}
            rows={csvRows}
            className="w-full md:w-auto"
          />
        </div>
      </div>

      {/* KPI Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPIBox title="نسبة الإكمال" value={overallKPIs.filtered.avgCompletion} color="success" />
        <KPIBox title="اكتمال المستندات" value={overallKPIs.filtered.avgDocScore} color="info" />
        <KPIBox title="دقة التشخيص" value={overallKPIs.filtered.avgDiagScore} color="primary" />
        <KPIBox title="سرعة الإنجاز" value={overallKPIs.filtered.avgSpeedScore} color="warning" />
        <KPIBox title="الالتزام بالمعايير" value={overallKPIs.filtered.avgComplianceScore} color="purple" />
        {/* IMPORTANT: Match the bar chart metric (national comparison across all governorates) */}
        <KPIBox title="التقييم الكلي" value={overallKPIs.national.avgOverall} color="primary" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="مخطط الرادار - متوسط الدرجات الكلي للمنصة">
          <RadarChart data={radarData} height={400} />
        </Card>

        <Card title="مقارنة التقييم الكلي بين المحافظات">
          <BarChart
            data={barData}
            dataKey="value"
            nameKey="name"
            barColor={CHART_COLORS.orange}
            height={400}
            horizontal={true}
            maxValue={100}
          />
        </Card>
      </div>

      {/* Governorates Table */}
      <Card title="جدول المحافظات">
        <div className="max-h-[520px] overflow-auto">
          <Table columns={columns} data={filteredStats} />
        </div>
      </Card>
    </div>
  );
};

export default GovernoratesList;
