import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { auditsStorage, casesStorage, reportsStorage, usersStorage } from '../../../data/storage';
import { DISABILITY_TYPES, GOVERNORATES } from '../../../data/constants';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import DatePicker from '../../../components/ui/DatePicker';
import Input from '../../../components/ui/Input';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import ExportPdfButton from '../../../components/ui/ExportPdfButton';
import { IoArrowBack } from 'react-icons/io5';
import { buildPeriodicMalaaReportData } from '../../../utils/report/periodicMalaaReport';
import { generatePeriodicMalaaDocx } from '../../../utils/docx/generatePeriodicMalaaDocx';

const PeriodicReportBuilder = ({ mode = 'new' }) => {
  const exportRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const { isSectionHead } = useAuth();

  const allCases = casesStorage.getAll();
  const allAudits = auditsStorage.getAll();
  const allUsers = usersStorage.getAll();

  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const quarterOptions = [
    { value: 'الأول', label: 'الربع الأول' },
    { value: 'الثاني', label: 'الربع الثاني' },
    { value: 'الثالث', label: 'الربع الثالث' },
    { value: 'الرابع', label: 'الربع الرابع' },
  ];

  const todayISO = () => new Date().toISOString().split('T')[0];

  const [meta, setMeta] = useState({
    title: 'التقرير الإحصائي الدوري لأداء الملاءة والخدمات التعليمية',
    periodType: 'month', // month | quarter
    periodValue: months[new Date().getMonth()],
    year: new Date().getFullYear(),
    preparedDate: todayISO(),
    fromDate: '',
    toDate: '',
    selectedGovernorateId: '',
    selectedDisabilityType: '',
    status: 'draft', // draft | final
  });

  const [sections, setSections] = useState({
    executiveSummary: '',
    methodology: '',
    infrastructureNotes: '',
    educationNotes: '',
    performanceNotes: '',
    referralNotes: '',
    recommendations: '',
  });

  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState('');

  useEffect(() => {
    if (mode !== 'edit') return;
    if (!id) return;
    const existing = reportsStorage.findById(id);
    if (!existing) return;

    setMeta((prev) => ({
      ...prev,
      ...existing.meta,
      title: existing.title || prev.title,
      status: existing.status || prev.status,
    }));
    setSections((prev) => ({ ...prev, ...(existing.sections || {}) }));
  }, [id, mode]);

  const periodLabel = useMemo(() => {
    const year = meta.year || new Date().getFullYear();
    if (meta.periodType === 'quarter') return `الربع ${meta.periodValue}، ${year}`;
    return `${meta.periodValue}، ${year}`;
  }, [meta.periodType, meta.periodValue, meta.year]);

  const filters = useMemo(() => {
    return {
      selectedGovernorateId: meta.selectedGovernorateId,
      selectedDisabilityType: meta.selectedDisabilityType,
      fromDate: meta.fromDate,
      toDate: meta.toDate,
    };
  }, [meta.fromDate, meta.selectedDisabilityType, meta.selectedGovernorateId, meta.toDate]);

  const reportData = useMemo(() => {
    return buildPeriodicMalaaReportData({
      allCases,
      allAudits,
      allUsers,
      filters,
    });
  }, [allAudits, allCases, allUsers, filters]);

  const selectedGovName = meta.selectedGovernorateId
    ? GOVERNORATES.find((g) => g.id === meta.selectedGovernorateId)?.name
    : '';

  const defaults = useMemo(() => {
    const best = reportData.bestGovernorate;
    const worst = reportData.worstGovernorate;
    const axis = reportData.problematicAxis;
    const trends = reportData.inclusionTrends || [];
    const last = trends[trends.length - 1];
    const prev = trends[trends.length - 2];

    const pctChange = (a, b) => {
      const denom = Math.max(1, b || 0);
      return Math.round(((a - b) / denom) * 1000) / 10;
    };

    const fullChange = last && prev ? pctChange(last.full, prev.full) : 0;
    const partialChange = last && prev ? pctChange(last.partial, prev.partial) : 0;

    const dateRangeText = meta.fromDate || meta.toDate
      ? `الفترة من ${meta.fromDate || '—'} إلى ${meta.toDate || '—'}`
      : 'الفترة حسب البيانات المتاحة في النظام';

    const exec = [
      `ملخص موجز لأهم النتائج والمؤشرات الرئيسية التي تم رصدها خلال الفترة.`,
      ``,
      `- أفضل أداء في الملاءة: ${best ? `${best.governorateName} بمتوسط ${best.overall}%` : '—'}.`,
      `- أقل أداء في الملاءة: ${worst ? `${worst.governorateName} بمتوسط ${worst.overall}%` : '—'}.`,
      `- اتجاه الحالات الجديدة (آخر 6 أشهر):`,
      `  - الدمج الكلي: ${fullChange > 0 ? 'نمو' : fullChange < 0 ? 'انخفاض' : 'استقرار'} بنسبة ${Math.abs(fullChange)}% مقارنة بالشهر السابق.`,
      `  - الدمج الجزئي: ${partialChange > 0 ? 'نمو' : partialChange < 0 ? 'انخفاض' : 'استقرار'} بنسبة ${Math.abs(partialChange)}% مقارنة بالشهر السابق.`,
      `- أكثر المعايير إشكالية: ${axis ? `${axis.name} بمتوسط ${axis.value}%` : '—'}.`,
    ].join('\n');

    const methodology = [
      `الهدف: توفير تحليل كمي ونوعي للمؤشرات الرئيسية المتعلقة بالبنية التحتية، الموارد البشرية، وكفاءة أداء المحافظات في تطبيق معايير الملاءة.`,
      `مصدر البيانات: لوحة المتابعة الإحصائية اللامركزية.`,
      `نطاق البيانات: ${dateRangeText}${selectedGovName ? `، محافظة: ${selectedGovName}` : ''}${meta.selectedDisabilityType ? `، نوع الإعاقة: ${meta.selectedDisabilityType}` : ''}.`,
      `التحليل: مقارنة بين المحافظات وتحليل الاتجاهات الزمنية الشهرية.`,
    ].join('\n');

    const infra = [
      `إجمالي الحالات المسجلة: ${reportData.totals.totalCases}.`,
      `نسبة الإناث من الطلبة: ${reportData.gender.female} (${reportData.gender.femalePercent}%).`,
      `إجمالي المدارس الحكومية: ${reportData.educationStructure.publicCount}.`,
      `إجمالي المدارس الخاصة: ${reportData.educationStructure.privateCount}.`,
      `ملاحظة: يمكن استخدام جدول تغطية الأخصائيين (1:${50}) لتحديد الفجوات التوزيعية.`,
    ].join('\n');

    const edu = [
      `توزيع الحالات حسب برنامج التعليم (من إجمالي ${reportData.totals.totalCases}):`,
      ...reportData.educationPrograms.map((x) => `- ${x.name}: ${x.value} (${x.percent}%)`),
      ``,
      `الرؤية: متابعة تغير برامج التربية الخاصة كنسبة من الإجمالي لقياس أثر سياسات الدمج.`,
    ].join('\n');

    const perf = [
      `الترتيب العام للمحافظات (المتوسط الكلي):`,
      `- المحافظات الأعلى: ${reportData.governorateRanking.slice(0, 3).map((g) => `${g.governorateName} (${g.overall}%)`).join('، ') || '—'}.`,
      `- المحافظات الأدنى: ${reportData.governorateRanking.slice(-2).map((g) => `${g.governorateName} (${g.overall}%)`).join('، ') || '—'}.`,
      ``,
      `نقطة ضعف مشتركة محتملة: ${axis ? `${axis.name}` : '—'} (متوسط ${axis ? axis.value : '—'}%).`,
    ].join('\n');

    const referrals = [
      `تحليل مصادر الإحالة:`,
      ...reportData.referralSources.map((x) => `- ${x.name}: ${x.value} (${x.percent}%)`),
    ].join('\n');

    const rec = [
      `- دعم الأداء الضعيف: تطوير خطة دعم للمحافظات ذات الأداء الأدنى (مثل ${worst?.governorateName || '—'}) مع التركيز على المعيار الأقل أداءً (${axis?.name || '—'}).`,
      `- برنامج تدريب متخصص: تدريب مكثف للأخصائيين في المحافظات منخفضة الأداء لضمان الاتساق في تطبيق أدوات التشخيص.`,
      `- تحليل توزيع الأخصائيين: مراجعة تغطية (1:50) وإعادة التوزيع حسب الفجوات.`,
      `- تعزيز الإحالة المبكرة: زيادة التنسيق مع الجهات ذات الإحالة المنخفضة.`,
    ].join('\n');

    return {
      executiveSummary: exec,
      methodology,
      infrastructureNotes: infra,
      educationNotes: edu,
      performanceNotes: perf,
      referralNotes: referrals,
      recommendations: rec,
    };
  }, [meta.fromDate, meta.selectedDisabilityType, meta.toDate, reportData, selectedGovName]);

  const resolvedSections = useMemo(() => {
    return {
      executiveSummary: sections.executiveSummary || defaults.executiveSummary,
      methodology: sections.methodology || defaults.methodology,
      infrastructureNotes: sections.infrastructureNotes || defaults.infrastructureNotes,
      educationNotes: sections.educationNotes || defaults.educationNotes,
      performanceNotes: sections.performanceNotes || defaults.performanceNotes,
      referralNotes: sections.referralNotes || defaults.referralNotes,
      recommendations: sections.recommendations || defaults.recommendations,
    };
  }, [defaults, sections]);

  const saveDraft = () => {
    setSaveNote('');
    setSaving(true);
    try {
      const payload = {
        type: 'periodic_malaa',
        title: meta.title,
        periodLabel,
        status: meta.status,
        meta,
        sections,
      };

      const saved = mode === 'edit' && id
        ? reportsStorage.update(id, payload)
        : reportsStorage.create(payload);

      setSaveNote('تم الحفظ بنجاح');
      if (mode !== 'edit' && saved?.id) {
        navigate(`/portal/supervisor/reports/periodic/${saved.id}`, { replace: true });
      }
    } finally {
      setSaving(false);
      setTimeout(() => setSaveNote(''), 2500);
    }
  };

  const governorateRankingColumns = [
    { header: 'الترتيب', accessor: 'rank', render: (row) => row.rank },
    { header: 'المحافظة', accessor: 'governorateName' },
    { header: 'المتوسط الكلي', accessor: 'overall', render: (row) => `${row.overall}%` },
  ];

  const governorateRankingRows = useMemo(() => {
    return reportData.governorateRanking.map((g, idx) => ({
      rank: idx + 1,
      governorateName: g.governorateName,
      overall: g.overall,
    }));
  }, [reportData.governorateRanking]);

  const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const exportWord = async () => {
    try {
      const blob = await generatePeriodicMalaaDocx({
        meta,
        periodLabel,
        reportData,
        sections: resolvedSections,
        selectedGovName: selectedGovName || 'جميع المحافظات',
      });
      downloadBlob(blob, `التقرير-الدوري-${periodLabel}.docx`);
    } catch (err) {
      window.alert(err?.message || 'فشل إنشاء ملف Word');
    }
  };

  const specialistsCoverageColumns = [
    { header: 'المحافظة', accessor: 'governorateName' },
    { header: 'عدد الأخصائيين', accessor: 'specialistsCount' },
    { header: 'عدد الحالات', accessor: 'casesCount' },
    { header: 'التغطية (1:50)', accessor: 'coveragePercent', render: (row) => `${row.coveragePercent}%` },
  ];

  return (
    <div className="space-y-6" dir="rtl" ref={exportRef}>
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="cursor-pointer">
          <IoArrowBack size={24} className="text-[#211551]" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">
            {mode === 'edit' ? 'تعديل التقرير الدوري' : 'إنشاء تقرير دوري'}
          </h1>
          <p className="text-gray-600">
            {periodLabel}
            {meta.selectedGovernorateId ? <span className="text-[#211551] font-bold"> - {selectedGovName}</span> : null}
            {isSectionHead() ? <span className="mx-2 text-gray-300">|</span> : null}
            {isSectionHead() ? <span className="text-gray-500">صلاحية: رئيس القسم</span> : null}
          </p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <Input
              label="عنوان التقرير"
              value={meta.title}
              onChange={(e) => setMeta((p) => ({ ...p, title: e.target.value }))}
              placeholder="أدخل عنوان التقرير"
            />
            <Select
              label="نوع الفترة"
              value={meta.periodType}
              onChange={(e) => {
                const nextType = e.target.value;
                setMeta((p) => ({
                  ...p,
                  periodType: nextType,
                  periodValue: nextType === 'quarter' ? 'الأول' : months[new Date().getMonth()],
                }));
              }}
              options={[
                { value: 'month', label: 'شهري' },
                { value: 'quarter', label: 'ربع سنوي' },
              ]}
            />
            <Select
              label={meta.periodType === 'quarter' ? 'الربع' : 'الشهر'}
              value={meta.periodValue}
              onChange={(e) => setMeta((p) => ({ ...p, periodValue: e.target.value }))}
              options={
                meta.periodType === 'quarter'
                  ? quarterOptions
                  : months.map((m) => ({ value: m, label: m }))
              }
            />
            <Input
              label="السنة"
              value={String(meta.year || '')}
              onChange={(e) => setMeta((p) => ({ ...p, year: Number(e.target.value || 0) }))}
              placeholder="2024"
            />
          </div>

          <div className="w-full md:w-auto flex flex-col md:flex-row gap-3 md:items-end">
            <ExportPdfButton
              targetRef={exportRef}
              fileName={`التقرير-الدوري-${periodLabel}.pdf`}
              className="w-full md:w-auto"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full md:w-auto"
              onClick={exportWord}
              title="تصدير التقرير إلى ملف Word"
            >
              تنزيل Word
            </Button>
            <Button
              type="button"
              variant="primary"
              className="w-full md:w-auto"
              onClick={saveDraft}
              disabled={saving}
            >
              {saving ? 'جاري الحفظ...' : 'حفظ كمسودة'}
            </Button>
          </div>
        </div>

        {saveNote ? <p className="mt-4 text-sm text-emerald-700">{saveNote}</p> : null}
      </Card>

      <Card title="نطاق البيانات والفلاتر">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DatePicker
            label="من تاريخ"
            value={meta.fromDate}
            onChange={(e) => setMeta((p) => ({ ...p, fromDate: e.target.value }))}
          />
          <DatePicker
            label="إلى تاريخ"
            value={meta.toDate}
            onChange={(e) => setMeta((p) => ({ ...p, toDate: e.target.value }))}
          />
          <Select
            label="المحافظة"
            value={meta.selectedGovernorateId}
            onChange={(e) => setMeta((p) => ({ ...p, selectedGovernorateId: e.target.value }))}
            options={[
              { value: '', label: 'جميع المحافظات' },
              ...GOVERNORATES.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />
          <Select
            label="نوع الإعاقة"
            value={meta.selectedDisabilityType}
            onChange={(e) => setMeta((p) => ({ ...p, selectedDisabilityType: e.target.value }))}
            options={[
              { value: '', label: 'جميع أنواع الإعاقة' },
              ...DISABILITY_TYPES.map((d) => ({ value: d, label: d })),
            ]}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DatePicker
            label="تاريخ الإعداد"
            value={meta.preparedDate}
            onChange={(e) => setMeta((p) => ({ ...p, preparedDate: e.target.value }))}
          />
          <Select
            label="حالة التقرير"
            value={meta.status}
            onChange={(e) => setMeta((p) => ({ ...p, status: e.target.value }))}
            options={[
              { value: 'draft', label: 'مسودة' },
              { value: 'final', label: 'نهائي' },
            ]}
          />
          <div className="md:col-span-2 flex items-end justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => {
                setMeta((p) => ({
                  ...p,
                  fromDate: '',
                  toDate: '',
                  selectedGovernorateId: '',
                  selectedDisabilityType: '',
                }));
              }}
            >
              مسح الفلاتر
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="مؤشرات سريعة">
          <div className="space-y-3">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">إجمالي الحالات</span>
              <span className="font-bold text-[#211551]">{reportData.totals.totalCases}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">نسبة الإناث</span>
              <span className="font-bold text-[#211551]">{reportData.gender.femalePercent}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">المدارس الحكومية</span>
              <span className="font-bold text-[#211551]">{reportData.educationStructure.publicCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">المدارس الخاصة</span>
              <span className="font-bold text-[#211551]">{reportData.educationStructure.privateCount}</span>
            </div>
          </div>
        </Card>

        <Card title="أفضل/أقل أداء">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">أفضل أداء</span>
              <Badge variant="success">
                {reportData.bestGovernorate ? `${reportData.bestGovernorate.governorateName} (${reportData.bestGovernorate.overall}%)` : '—'}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">أقل أداء</span>
              <Badge variant="danger">
                {reportData.worstGovernorate ? `${reportData.worstGovernorate.governorateName} (${reportData.worstGovernorate.overall}%)` : '—'}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">أكثر معيار إشكالية</span>
              <Badge variant="warning">
                {reportData.problematicAxis ? `${reportData.problematicAxis.name} (${reportData.problematicAxis.value}%)` : '—'}
              </Badge>
            </div>
          </div>
        </Card>

        <Card title="اتجاه الحالات الجديدة (آخر 6 أشهر)">
          <div className="max-h-[220px] overflow-auto">
            <Table
              columns={[
                { header: 'الشهر', accessor: 'name' },
                { header: 'الإجمالي', accessor: 'total' },
                { header: 'الدمج الكلي', accessor: 'full' },
                { header: 'الدمج الجزئي', accessor: 'partial' },
              ]}
              data={reportData.inclusionTrends.map((m) => ({
                name: m.name,
                total: m.total,
                full: m.full,
                partial: m.partial,
              }))}
              fit
            />
          </div>
        </Card>
      </div>

      <Card title="1. الملخص التنفيذي (قابل للتعديل)">
        <textarea
          value={resolvedSections.executiveSummary}
          onChange={(e) => setSections((p) => ({ ...p, executiveSummary: e.target.value }))}
          rows={10}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none whitespace-pre-line"
        />
      </Card>

      <Card title="2. منهجية التقرير ونطاق البيانات (قابل للتعديل)">
        <textarea
          value={resolvedSections.methodology}
          onChange={(e) => setSections((p) => ({ ...p, methodology: e.target.value }))}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none whitespace-pre-line"
        />
      </Card>

      <Card title="3. تحليل البنية التحتية والموارد البشرية">
        <textarea
          value={resolvedSections.infrastructureNotes}
          onChange={(e) => setSections((p) => ({ ...p, infrastructureNotes: e.target.value }))}
          rows={7}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none whitespace-pre-line mb-4"
        />
        <div className="max-h-[420px] overflow-auto">
          <Table columns={specialistsCoverageColumns} data={reportData.specialistsCoverage} fit />
        </div>
      </Card>

      <Card title="4. تحليل برامج التعليم ونوع الدمج">
        <textarea
          value={resolvedSections.educationNotes}
          onChange={(e) => setSections((p) => ({ ...p, educationNotes: e.target.value }))}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none whitespace-pre-line mb-4"
        />
        <div className="max-h-[320px] overflow-auto">
          <Table
            columns={[
              { header: 'برنامج التعليم', accessor: 'name' },
              { header: 'العدد', accessor: 'value' },
              { header: 'النسبة', accessor: 'percent', render: (row) => `${row.percent}%` },
            ]}
            data={reportData.educationPrograms}
            fit
          />
        </div>
      </Card>

      <Card title="5. تحليل أداء الملاءة للمحافظات">
        <textarea
          value={resolvedSections.performanceNotes}
          onChange={(e) => setSections((p) => ({ ...p, performanceNotes: e.target.value }))}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none whitespace-pre-line mb-4"
        />
        <div className="max-h-[420px] overflow-auto">
          <Table columns={governorateRankingColumns} data={governorateRankingRows} fit />
        </div>
      </Card>

      <Card title="6. تحليل مصادر الإحالة">
        <textarea
          value={resolvedSections.referralNotes}
          onChange={(e) => setSections((p) => ({ ...p, referralNotes: e.target.value }))}
          rows={7}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none whitespace-pre-line mb-4"
        />
        <div className="max-h-[320px] overflow-auto">
          <Table
            columns={[
              { header: 'مصدر الإحالة', accessor: 'name' },
              { header: 'العدد', accessor: 'value' },
              { header: 'النسبة', accessor: 'percent', render: (row) => `${row.percent}%` },
            ]}
            data={reportData.referralSources}
            fit
          />
        </div>
      </Card>

      <Card title="7. التوصيات المقترحة (قابل للتعديل)">
        <textarea
          value={resolvedSections.recommendations}
          onChange={(e) => setSections((p) => ({ ...p, recommendations: e.target.value }))}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none whitespace-pre-line"
        />
      </Card>

      <Card>
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/portal/supervisor/reports')} className="w-full md:w-auto">
            العودة إلى قائمة التقارير
          </Button>
          <Button type="button" variant="primary" onClick={saveDraft} disabled={saving} className="w-full md:w-auto">
            {saving ? 'جاري الحفظ...' : 'حفظ كمسودة'}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          ملاحظة: تصدير Word يستخدم قالباً افتراضياً مدمجاً داخل النظام.
        </p>
      </Card>
    </div>
  );
};

export default PeriodicReportBuilder;

