import { useMemo, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { casesStorage } from '../../../data/storage';
import { EDUCATION_PROGRAMS, GENDER, REFERRAL_SOURCES } from '../../../data/constants';
import KPICard from '../../../components/charts/KPICard';
import DonutChart from '../../../components/charts/DonutChart';
import BarChart from '../../../components/charts/BarChart';
import Card from '../../../components/ui/Card';
import ExportPdfButton from '../../../components/ui/ExportPdfButton';
import { IoPeople, IoCheckmarkCircle, IoMale, IoFemale, IoCalendar } from 'react-icons/io5';
import { CHART_COLORS } from '../../../data/constants';

const Dashboard = () => {
  const exportRef = useRef(null);
  const { user } = useAuth();
  const allCases = casesStorage.getAll();
  // const allActivities = activitiesStorage.getAll(); // For future use

  // Filter cases for this specialist's governorate
  const cases = useMemo(() => {
    return allCases.filter((c) => c.governorateId === user?.governorateId);
  }, [allCases, user?.governorateId]);

  // Activities filtered by governorate (for future use)
  // const activities = useMemo(() => {
  //   return allActivities.filter((a) => a.governorateId === user?.governorateId);
  // }, [allActivities, user?.governorateId]);

  // Calculate KPIs
  const totalCases = cases.length;
  const completedCases = cases.filter((c) => c.status === 'مكتمل').length;
  const completionRate = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;
  const maleCases = cases.filter((c) => c.gender === GENDER.MALE).length;
  const femaleCases = cases.filter((c) => c.gender === GENDER.FEMALE).length;
  const malePercentage = totalCases > 0 ? Math.round((maleCases / totalCases) * 100) : 0;
  const femalePercentage = totalCases > 0 ? Math.round((femaleCases / totalCases) * 100) : 0;

  // Gender distribution for donut chart
  const genderData = [
    { name: 'ذكر', value: maleCases },
    { name: 'أنثى', value: femaleCases },
  ];

  // Disability types distribution
  const disabilityCounts = {};
  cases.forEach((c) => {
    disabilityCounts[c.disabilityType] = (disabilityCounts[c.disabilityType] || 0) + 1;
  });
  const disabilityData = Object.entries(disabilityCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  // Referral sources distribution (نسبة التوزيع حسب مصدر الإحالة)
  const referralData = useMemo(() => {
    const allowedSources = REFERRAL_SOURCES;
    const referralCounts = {};
    cases.forEach((c) => {
      if (c.referralSource && allowedSources.includes(c.referralSource)) {
        referralCounts[c.referralSource] = (referralCounts[c.referralSource] || 0) + 1;
      }
    });
    return Object.entries(referralCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [cases]);

  // School types distribution
  const schoolTypeCounts = {};
  cases.forEach((c) => {
    schoolTypeCounts[c.schoolType] = (schoolTypeCounts[c.schoolType] || 0) + 1;
  });
  const schoolTypeData = Object.entries(schoolTypeCounts).map(([name, value]) => ({ name, value }));

  // Education program distribution (4 categories)
  const educationProgramData = useMemo(() => {
    const counts = Object.fromEntries(EDUCATION_PROGRAMS.map((p) => [p, 0]));
    cases.forEach((c) => {
      if (c.educationProgram && counts[c.educationProgram] !== undefined) counts[c.educationProgram] += 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [cases]);

  // Education stages (based on age) - remove (13-18) to match requested view
  const stageCounts = { '(1-4)': 0, '(5-9)': 0, '(10-12)': 0 };
  cases.forEach((c) => {
    if (c.age >= 1 && c.age <= 4) stageCounts['(1-4)']++;
    else if (c.age >= 5 && c.age <= 9) stageCounts['(5-9)']++;
    else if (c.age >= 10 && c.age <= 12) stageCounts['(10-12)']++;
  });
  const stageData = Object.entries(stageCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6" dir="rtl" ref={exportRef}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">لوحة متابعة توزيع حالات ذوي الإعاقة</h1>
          <p className="text-gray-600">تحليل ديموغرافي وتوزيع الحالات حسب الجنس ومصدر الإحالة والمراحل التعليمية</p>
        </div>
        <ExportPdfButton
          targetRef={exportRef}
          fileName="لوحة-متابعة-توزيع-حالات-ذوي-الإعاقة.pdf"
          className="w-full md:w-auto"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="إجمالي الحالات المسجلة"
          value={totalCases}
          icon={IoPeople}
          color="primary"
        />
        <KPICard
          title="نسبة الإكمال"
          value={`${completionRate}%`}
          subtitle={`${completedCases} من ${totalCases}`}
          icon={IoCheckmarkCircle}
          color="success"
        />
        <KPICard
          title="نسبة الذكور"
          value={`${malePercentage}%`}
          icon={IoMale}
          color="info"
        />
        <KPICard
          title="نسبة الإناث"
          value={`${femalePercentage}%`}
          icon={IoFemale}
          color="pink"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="التوزيع حسب النوع الاجتماعي">
          <DonutChart data={genderData} height={250} />
        </Card>

        <Card title="نسبة التوزيع حسب مصدر الإحالة">
          <DonutChart
            data={
              referralData.length > 0
                ? referralData
                : [
                    { name: 'المدارس', value: Math.floor(totalCases * 0.4) || 1 },
                    { name: 'خدمة المراجعين', value: Math.floor(totalCases * 0.22) || 1 },
                    { name: 'دائرة الإشراف التربوي', value: Math.floor(totalCases * 0.18) || 1 },
                    { name: 'دائرة التوجيه والإرشاد الطلابي', value: Math.floor(totalCases * 0.12) || 1 },
                    { name: 'مراكز التأهيل', value: Math.floor(totalCases * 0.08) || 1 },
                  ]
            }
            height={250}
          />
        </Card>

        <Card title="توزيع حسب نوع الإعاقة">
          <DonutChart data={disabilityData} height={250} />
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="توزيع حسب برنامج التعليم">
          <DonutChart
            data={
              educationProgramData.some((d) => d.value > 0)
                ? educationProgramData
                : [
                    { name: 'البرنامج السمعي', value: 1 },
                    { name: 'البرنامج الفكري', value: 1 },
                    { name: 'التربية الخاصة', value: 1 },
                    { name: 'التعليم الأساسي', value: 1 },
                  ]
            }
            height={250}
            innerRadius={55}
            outerRadius={85}
          />
        </Card>

        <Card title="توزيع حسب المرحلة الدراسية">
          <BarChart
            data={stageData}
            dataKey="value"
            nameKey="name"
            barColor={CHART_COLORS.green}
            height={250}
            xAxisAngle={0}
            xAxisHeight={32}
          />
        </Card>

        <Card title="التوزيع حسب نوع المدرسة">
          <DonutChart data={schoolTypeData} height={250} />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
