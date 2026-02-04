import { useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { casesStorage, auditsStorage, activitiesStorage } from '../../../data/storage';
import { CHART_COLORS, MEASUREMENT_AXES, GOVERNORATES, AUDIT_DECISIONS, CASE_STATUS } from '../../../data/constants';
import Card from '../../../components/ui/Card';
import BarChart from '../../../components/charts/BarChart';
import RadarChart from '../../../components/charts/RadarChart';
import ExportPdfButton from '../../../components/ui/ExportPdfButton';

const MiniKPI = ({ title, value, tone = 'primary' }) => {
  const toneMap = {
    primary: { bg: 'bg-[#eef2ff]', dot: 'bg-[#211551]', text: 'text-[#211551]' },
    success: { bg: 'bg-[#ecfdf5]', dot: 'bg-emerald-500', text: 'text-emerald-700' },
    warning: { bg: 'bg-[#fffbeb]', dot: 'bg-amber-500', text: 'text-amber-700' },
    info: { bg: 'bg-[#eff6ff]', dot: 'bg-blue-500', text: 'text-blue-700' },
  };
  const t = toneMap[tone] || toneMap.primary;

  return (
    <div className={`${t.bg} border border-gray-100 rounded-lg p-4 flex items-center justify-between`}>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className={`text-xl font-bold ${t.text}`}>{value}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, tone = 'success', suffix = '' }) => {
  const toneMap = {
    success: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '✅' },
    info: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'ℹ️' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', icon: '⚠️' },
    danger: { bg: 'bg-rose-50', text: 'text-rose-700', icon: '❌' },
  };
  const t = toneMap[tone] || toneMap.success;
  return (
    <div className={`${t.bg} border border-gray-100 rounded-lg p-3 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <span className="text-sm" aria-hidden="true">{t.icon}</span>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <div className={`text-sm font-bold ${t.text}`}>
        {value}{suffix}
      </div>
    </div>
  );
};

const ComboTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const services = payload.find((p) => p.dataKey === 'services')?.value;
  const maturity = payload.find((p) => p.dataKey === 'maturity')?.value;
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200" dir="rtl">
      <p className="font-bold text-[#211551] mb-1">{label}</p>
      <p className="text-gray-600">عدد المبادرات: <span className="font-bold text-[#211551]">{services}</span></p>
      <p className="text-gray-600">مؤشر النضج: <span className="font-bold text-[#211551]">{maturity}%</span></p>
    </div>
  );
};

const LeadershipDashboard = () => {
  const exportRef = useRef(null);
  const allCases = casesStorage.getAll();
  const allAudits = auditsStorage.getAll();
  const allActivities = activitiesStorage.getAll();

  const kpis = useMemo(() => {
    const audited = allAudits.length;
    const approved = allAudits.filter((a) => a.finalDecision === AUDIT_DECISIONS.APPROVED).length;
    const approvalRate = audited > 0 ? Math.round((approved / audited) * 100) : 91;

    // بعد إزالة «اعتماد المشرف»: نستخدم "ناقص" كمؤشر متابعة بديل داخل لوحة القيادة
    const pending = allCases.filter((c) => c.status === CASE_STATUS.INCOMPLETE).length;
    const completed = allCases.filter((c) => c.status === CASE_STATUS.COMPLETED).length;
    const completionRate = allCases.length > 0 ? Math.round((completed / allCases.length) * 100) : 78;

    const avgCycleDays = 20; // demo target-style KPI (no reliable timestamps for full workflow)

    const activitySignal = Math.min(100, 70 + allActivities.length * 2);
    const teamEfficiency = Math.round((Math.min(100, approvalRate) + Math.min(100, completionRate) + activitySignal) / 3);

    const maturity = Math.round((completionRate + approvalRate + teamEfficiency) / 3);

    return {
      maturity,
      approvalRate,
      avgCycleDays,
      teamEfficiency,
      completionRate,
      pending,
      activities: allActivities.length,
    };
  }, [allAudits, allCases, allActivities]);

  const comboData = useMemo(() => {
    // Stable demo series for the executive view (2022–2024)
    const base = Math.max(2, Math.min(5, Math.round((kpis.activities + 6) / 6)));
    return [
      { year: '2022', services: Math.max(2, base - 1), maturity: Math.max(60, kpis.maturity - 8) },
      { year: '2023', services: Math.max(3, base), maturity: Math.max(65, kpis.maturity - 3) },
      { year: '2024', services: Math.max(4, base + 1), maturity: Math.min(98, kpis.maturity + 4) },
    ];
  }, [kpis.activities, kpis.maturity]);

  const directoratesComparison = useMemo(() => {
    // 0–5 scale (benchmark-style)
    const base = 3.2 + Math.min(1.2, kpis.maturity / 100);
    const values = [
      { name: 'مسقط', value: Math.min(5, base + 0.6) },
      { name: 'شمال الباطنة', value: Math.min(5, base + 0.3) },
      { name: 'جنوب الباطنة', value: Math.min(5, base + 0.1) },
      { name: 'الداخلية', value: Math.min(5, base - 0.1) },
      { name: 'ظفار', value: Math.min(5, base - 0.2) },
    ];
    return values.map((v) => ({ ...v, value: Number(v.value.toFixed(1)) }));
  }, [kpis.maturity]);

  // محاور ومعايير القياس الرئيسية (منهجيات القياس) – 7 محاور
  const axesMaturity = useMemo(() => {
    const base = 3.0 + Math.min(1.4, kpis.maturity / 100);
    return MEASUREMENT_AXES.map((axis, idx) => {
      const drift = (idx % 3 === 0 ? 0.4 : idx % 3 === 1 ? 0.15 : -0.05);
      const v = Math.min(5, Math.max(2.2, base + drift));
      return { name: axis, value: Number(v.toFixed(1)) };
    });
  }, [kpis.maturity]);

  const topTeamsRadar = useMemo(() => {
    // نفس المحاور السبعة – ترتيب مختلف للرادار فقط (تبديل الموضعين 0 و 5 لتقليل تداخل التسميات)
    const base = Math.min(96, kpis.maturity + 4);
    const data = MEASUREMENT_AXES.map((axis, idx) => {
      const drift = (idx % 3 === 0 ? 6 : idx % 3 === 1 ? 2 : -2);
      return { name: axis, value: Math.min(98, Math.max(70, base + drift)) };
    });
    [data[0], data[5]] = [data[5], data[0]];
    return data;
  }, [kpis.maturity]);

  const governorateChip = useMemo(() => {
    // Mini label list similar to the screenshot context
    const totalGov = GOVERNORATES.length;
    return `${totalGov} محافظات`;
  }, []);

  return (
    <div className="space-y-6" dir="rtl" ref={exportRef}>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#211551]">لوحة قيادة نظام «الملاءة» - متابعة نضج الخدمات اللامركزية</h1>
        <p className="text-gray-600">
          تحليل الأداء المؤسسي والتشغيلي لخدمات التشخيص والملاءة التربوية
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-[#211551] font-semibold">{governorateChip}</span>
        </p>
      </div>
      <div className="flex justify-start md:justify-end">
        <ExportPdfButton targetRef={exportRef} fileName="لوحة-القيادة-نظام-الملاءة.pdf" />
      </div>

      <div className="border border-sky-200 bg-sky-50 rounded-lg p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-sky-800 mb-2">الهدف العام والأهداف الاستراتيجية للوحة</p>
            <ol className="text-sm text-sky-900 space-y-1 list-decimal pr-5">
              <li>تقديم ملخص تنفيذي لمستوى نضج جودة خدمات التشخيص اللامركزية.</li>
              <li>متابعة المؤشرات الرئيسية ودعم القرار على مستوى الوزارة/الدائرة.</li>
              <li>تحديد أولويات التحسين والتدخلات التدريبية عبر المحافظات.</li>
            </ol>
          </div>
          <div className="text-xs text-sky-700 whitespace-nowrap">آخر تحديث: تجريبي</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#211551]">1. لوحة القيادة الاستراتيجية (الوزارة/الدائرة)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniKPI title="مستوى النضج التشخيصي" value={`${kpis.maturity}%`} tone="primary" />
        <MiniKPI title="متوسط زمن إعداد التقرير" value={`${kpis.avgCycleDays} يوم`} tone="warning" />
        <MiniKPI title="معدل الاعتماد" value={`${kpis.approvalRate}%`} tone="info" />
        <MiniKPI title="مستوى كفاءة الفريق" value={`${kpis.teamEfficiency}%`} tone="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="بطاقة ملخص القسم (5 مؤشرات رئيسية)">
          <div className="space-y-3">
            <SummaryRow label="نوافذ التدقيق المعتمدة" value={kpis.approvalRate} suffix="%" tone="success" />
            <SummaryRow label="متوسط زمن الإنجاز" value={kpis.avgCycleDays} suffix=" يوم" tone="info" />
            <SummaryRow label="دقة استخدام الأدوات" value={88} suffix="%" tone="warning" />
            <SummaryRow label="جودة التقارير النهائية" value={75} suffix="%" tone="danger" />
            <SummaryRow label="ورش التدريب المنفذة" value={Math.min(99, Math.max(3, Math.round(kpis.activities / 2)))} suffix=" ورشة" tone="success" />
          </div>
        </Card>

        <Card title="اتجاه نمو عدد المبادرات وتأثير الخدمات">
          <div className="h-[320px]" dir="rtl">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={comboData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: '#374151', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 5]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip content={<ComboTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="services" name="عدد المبادرات" fill={CHART_COLORS.teal} radius={[6, 6, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="maturity"
                  name="مؤشر النضج (%)"
                  stroke={CHART_COLORS.orange}
                  strokeWidth={3}
                  dot={{ r: 4, fill: CHART_COLORS.orange, stroke: '#fff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <h2 className="text-xl font-bold text-[#211551]">2. لوحة الأداء التشغيلي (مقارنة المديريات)</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="توزيع قسم النضج حسب المديرية (خريطة شبيهة)">
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
            <p className="font-semibold mb-2">عرض تجريبي</p>
            <p className="text-sm">
              يمكن لاحقاً استبدال هذا الصندوق بخريطة/تصور جغرافي حسب المتطلبات.
            </p>
          </div>
        </Card>

        <Card title="الفروقات المعيارية بين المديريات التعليمية (مؤشر مركب)">
          <BarChart
            data={directoratesComparison}
            dataKey="value"
            nameKey="name"
            barColor={CHART_COLORS.purple}
            height={320}
            horizontal
            maxValue={5}
          />
        </Card>
      </div>

      <h2 className="text-xl font-bold text-[#211551]">3. لوحة الأداء التفصيلي (محاور الجودة والنضج)</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="مستوى النضج حسب محاور الملاءة السبعة">
          <BarChart
            data={axesMaturity}
            dataKey="value"
            nameKey="name"
            barColor={CHART_COLORS.yellow}
            height={340}
            horizontal
            maxValue={5}
          />
        </Card>

        <Card title="أداء الفرق المتصدرة (قياس مؤشرات فنية وتشغيلية)">
          <RadarChart
            data={topTeamsRadar}
            height={340}
            color={CHART_COLORS.blue}
            domain={[0, 100]}
          />
        </Card>
      </div>
    </div>
  );
};

export default LeadershipDashboard;

