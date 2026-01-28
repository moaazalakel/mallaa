import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { casesStorage, auditsStorage, usersStorage } from '../../../data/storage';
import { GOVERNORATES, CASE_STATUS } from '../../../data/constants';
import Card from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import DatePicker from '../../../components/ui/DatePicker';
import Input from '../../../components/ui/Input';
import ExportPdfButton from '../../../components/ui/ExportPdfButton';
import { format } from 'date-fns';

const AuditCases = () => {
  const exportRef = useRef(null);
  const { user, isSpecialist, isSupervisor, isSectionHead } = useAuth();

  const allCases = casesStorage.getAll();
  const allAudits = auditsStorage.getAll();
  const allUsers = usersStorage.getAll();

  const [filterSpecialistId, setFilterSpecialistId] = useState('');
  const [filterGovernorateId, setFilterGovernorateId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterCentralReviewerId, setFilterCentralReviewerId] = useState('');

  const [selectedCaseId, setSelectedCaseId] = useState('');

  // Central review form (Supervisor)
  const [reviewForm, setReviewForm] = useState({
    centralReviewerName: '',
    reviewStartDate: '',
    reviewCloseDate: '',
    reviewStatus: '',
    generalNotes: '',
    professionalAxesNotes: {
      axis1: '',
      axis2: '',
      axis3: '',
      axis4: '',
      axis5: '',
      axis6: '',
      axis7: '',
    },
  });

  // Reviewer performance form (Section head)
  const [reviewerPerfForm, setReviewerPerfForm] = useState({
    adherence: '',
    notesQuality: '',
    timeliness: '',
    professionalism: '',
    sectionHeadNotes: '',
  });

  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const specialists = useMemo(() => {
    return allUsers
      .filter((u) => u.role === 'الأخصائي')
      .map((u) => {
        const gov = GOVERNORATES.find((g) => g.id === u.governorateId);
        return { ...u, governorateName: gov?.name || '—' };
      })
      .sort((a, b) => (a.governorateName || '').localeCompare(b.governorateName || ''));
  }, [allUsers]);

  const centralReviewers = useMemo(() => {
    // حالياً لدينا «المشرف» كمراجع مركزي، مع دعم الفلترة لرئيس القسم
    return allUsers.filter((u) => u.role === 'المشرف');
  }, [allUsers]);

  // Default reviewer filter: supervisor is fixed to self; section head can filter by supervisor
  useEffect(() => {
    if (isSupervisor() && user?.id) {
      setFilterCentralReviewerId(user.id);
    }
  }, [isSupervisor, user?.id]);

  const getGovernorateName = (governorateId) => {
    return GOVERNORATES.find((g) => g.id === governorateId)?.name || 'غير محدد';
  };

  const getSpecialistForCase = (caseItem) => {
    if (!caseItem?.governorateId) return null;
    return specialists.find((s) => s.governorateId === caseItem.governorateId) || null;
  };

  const parseISODate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  const isWithinRange = (dateValue, from, to) => {
    const d = parseISODate(dateValue);
    if (!d) return false;
    const fromD = parseISODate(from);
    const toD = parseISODate(to);
    if (fromD && d < fromD) return false;
    if (toD && d > toD) return false;
    return true;
  };

  // Filtered cases list (for table)
  const filteredCases = useMemo(() => {
    let filtered = [...allCases];

    if (filterGovernorateId) {
      filtered = filtered.filter((c) => c.governorateId === filterGovernorateId);
    }

    if (filterSpecialistId) {
      const spec = specialists.find((s) => s.id === filterSpecialistId);
      if (spec?.governorateId) {
        filtered = filtered.filter((c) => c.governorateId === spec.governorateId);
      } else {
        filtered = [];
      }
    }

    if (filterStatus) {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    if (filterFromDate || filterToDate) {
      filtered = filtered.filter((c) => isWithinRange(c.createdAt, filterFromDate, filterToDate));
    }

    // Filter by central reviewer (only meaningful if review record exists)
    if (filterCentralReviewerId && isSectionHead()) {
      filtered = filtered.filter((c) => {
        const audit = allAudits.find((a) => a.caseId === c.id);
        return audit?.centralReviewerUserId === filterCentralReviewerId;
      });
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [
    allCases,
    allAudits,
    filterCentralReviewerId,
    filterFromDate,
    filterGovernorateId,
    filterSpecialistId,
    filterStatus,
    filterToDate,
    isSectionHead,
    specialists,
  ]);

  const selectedCase = useMemo(() => {
    return selectedCaseId ? allCases.find((c) => c.id === selectedCaseId) : null;
  }, [allCases, selectedCaseId]);

  const selectedSpecialist = useMemo(() => {
    return selectedCase ? getSpecialistForCase(selectedCase) : null;
  }, [selectedCase, specialists]);

  const selectedReview = useMemo(() => {
    if (!selectedCaseId) return null;
    return allAudits.find((a) => a.caseId === selectedCaseId) || null;
  }, [allAudits, selectedCaseId]);

  const reviewStatusLabel = (audit) => {
    if (!audit) return 'غير مبدوءة';
    return audit.reviewStatus || 'غير محددة';
  };

  const reviewStatusVariant = (label) => {
    if (label === 'مكتملة') return 'success';
    if (label === 'تحتاج متابعة') return 'warning';
    if (label === 'قيد المراجعة') return 'info';
    if (label === 'غير محددة') return 'default';
    return 'default';
  };

  // Initialize forms when selecting a case
  useEffect(() => {
    if (!selectedCase) return;

    const audit = selectedReview;

    setReviewForm({
      centralReviewerName: audit?.centralReviewerName || (user?.name || ''),
      reviewStartDate: audit?.reviewStartDate || '',
      reviewCloseDate: audit?.reviewCloseDate || '',
      reviewStatus: audit?.reviewStatus || '',
      generalNotes: audit?.generalNotes || '',
      professionalAxesNotes: {
        axis1: audit?.professionalAxesNotes?.axis1 || '',
        axis2: audit?.professionalAxesNotes?.axis2 || '',
        axis3: audit?.professionalAxesNotes?.axis3 || '',
        axis4: audit?.professionalAxesNotes?.axis4 || '',
        axis5: audit?.professionalAxesNotes?.axis5 || '',
        axis6: audit?.professionalAxesNotes?.axis6 || '',
        axis7: audit?.professionalAxesNotes?.axis7 || '',
      },
    });

    setReviewerPerfForm({
      adherence: audit?.reviewerPerformance?.adherence || '',
      notesQuality: audit?.reviewerPerformance?.notesQuality || '',
      timeliness: audit?.reviewerPerformance?.timeliness || '',
      professionalism: audit?.reviewerPerformance?.professionalism || '',
      sectionHeadNotes: audit?.reviewerPerformance?.sectionHeadNotes || '',
    });
  }, [selectedCase, selectedReview, user?.name]);

  const canEditCentralReview = isSupervisor();
  const canEditReviewerPerformance = isSectionHead();

  const updateAxis = (axisKey, value) => {
    setReviewForm((prev) => ({
      ...prev,
      professionalAxesNotes: { ...prev.professionalAxesNotes, [axisKey]: value },
    }));
  };

  const upsertReview = (partial) => {
    if (!selectedCase) return null;
    const specialist = getSpecialistForCase(selectedCase);

    const current = selectedReview;
    const base = {
      caseId: selectedCase.id,
      governorateId: selectedCase.governorateId,
      specialistUserId: specialist?.id || null,
    };

    if (current) {
      auditsStorage.update(current.id, { ...base, ...partial });
      return current.id;
    }

    const created = auditsStorage.create({ ...base, ...partial });
    return created?.id || null;
  };

  const todayISO = () => new Date().toISOString().split('T')[0];

  const isCentralReviewComplete = (data) => {
    const axes = data?.professionalAxesNotes || {};
    const hasAllAxes = ['axis1','axis2','axis3','axis4','axis5','axis6','axis7'].every((k) => (axes[k] || '').trim().length > 0);
    const hasGeneral = (data?.generalNotes || '').trim().length > 0;
    const hasStart = Boolean(data?.reviewStartDate);
    return hasAllAxes && hasGeneral && hasStart;
  };

  const handleSaveCentralReview = async () => {
    if (!selectedCase) return;
    setSaving(true);
    setSaveNote('');

    const startDate = reviewForm.reviewStartDate || todayISO();
    const requestedStatus = reviewForm.reviewStatus || '';

    // If user tries to mark as completed, enforce completeness of descriptive fields
    const baseDraft = {
      centralReviewerUserId: user?.id || null,
      centralReviewerName: reviewForm.centralReviewerName || user?.name || '',
      reviewStartDate: startDate,
      reviewCloseDate: reviewForm.reviewCloseDate,
      reviewStatus: requestedStatus,
      generalNotes: reviewForm.generalNotes,
      professionalAxesNotes: reviewForm.professionalAxesNotes,
    };

    let finalStatus = requestedStatus;
    let closeDate = reviewForm.reviewCloseDate;

    if (requestedStatus === 'مكتملة') {
      const ok = isCentralReviewComplete(baseDraft);
      if (!ok) {
        finalStatus = 'قيد المراجعة';
        closeDate = '';
        setSaveNote('لا يمكن اعتماد حالة المراجعة كمكتملة إلا بعد استكمال جميع محاور التقويم وإضافة ملاحظات عامة وتسجيل تاريخ بدء المراجعة.');
      } else {
        closeDate = closeDate || todayISO();
      }
    } else if (requestedStatus && requestedStatus !== 'مكتملة') {
      // If moved away from completed, clear close date
      closeDate = '';
    }

    const payload = {
      ...baseDraft,
      reviewStartDate: startDate,
      reviewStatus: finalStatus,
      reviewCloseDate: closeDate,
    };

    upsertReview(payload);
    setSaving(false);
  };

  const handleSaveReviewerPerformance = async () => {
    if (!selectedCase) return;
    setSaving(true);

    const payload = {
      reviewerPerformance: {
        ...reviewerPerfForm,
        evaluatedByUserId: user?.id || null,
        evaluatedByName: user?.name || '',
      },
    };

    upsertReview(payload);
    setSaving(false);
  };

  const columns = [
    { header: 'رقم الحالة', accessor: 'id' },
    { header: 'اسم الطالب', accessor: 'studentName' },
    { header: 'نوع الإعاقة', accessor: 'disabilityType' },
    {
      header: 'الأخصائي المُسجِّل',
      accessor: 'specialistName',
      render: (row) => {
        const specialist = getSpecialistForCase(row);
        return specialist?.name || '—';
      },
    },
    {
      header: 'المحافظة',
      accessor: 'governorateId',
      render: (row) => getGovernorateName(row.governorateId),
    },
    {
      header: 'تاريخ تسجيل الحالة',
      accessor: 'createdAt',
      render: (row) => (row.createdAt ? format(new Date(row.createdAt), 'yyyy-MM-dd') : '—'),
    },
    {
      header: 'حالة الحالة التشخيصية',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === CASE_STATUS.COMPLETED ? 'success' : 'danger'}>{row.status}</Badge>
      ),
    },
    {
      header: 'حالة المراجعة',
      accessor: 'reviewStatus',
      render: (row) => {
        const audit = allAudits.find((a) => a.caseId === row.id);
        const label = reviewStatusLabel(audit);
        return <Badge variant={reviewStatusVariant(label)}>{label}</Badge>;
      },
    },
  ];

  const specialistOptions = [
    { value: '', label: 'جميع الأخصائيين' },
    ...specialists.map((s) => ({ value: s.id, label: `${s.name} - ${s.governorateName}` })),
  ];

  const governorateOptions = [
    { value: '', label: 'جميع المحافظات' },
    ...GOVERNORATES.map((g) => ({ value: g.id, label: g.name })),
  ];

  const statusOptions = [
    { value: '', label: 'جميع الحالات' },
    { value: CASE_STATUS.COMPLETED, label: CASE_STATUS.COMPLETED },
    { value: CASE_STATUS.INCOMPLETE, label: CASE_STATUS.INCOMPLETE },
  ];

  const reviewerOptions = [
    { value: '', label: 'جميع المراجعين' },
    ...centralReviewers.map((r) => ({ value: r.id, label: r.name || r.username })),
  ];

  const reviewStatusOptions = [
    { value: '', label: 'اختر...' },
    { value: 'قيد المراجعة', label: 'قيد المراجعة' },
    { value: 'مكتملة', label: 'مكتملة' },
    { value: 'تحتاج متابعة', label: 'تحتاج متابعة' },
  ];

  const ratingOptions = [
    { value: '', label: 'اختر...' },
    { value: 'ممتاز', label: 'ممتاز' },
    { value: 'جيد', label: 'جيد' },
    { value: 'مقبول', label: 'مقبول' },
    { value: 'يحتاج تحسين', label: 'يحتاج تحسين' },
  ];

  const specialistPerfRows = useMemo(() => {
    return specialists.map((s) => {
      const govName = s.governorateName || getGovernorateName(s.governorateId);
      const casesCount = allCases.filter((c) => c.governorateId === s.governorateId).length;
      const reviewedCount = allAudits.filter((a) => a.specialistUserId === s.id).length;
      const closedCount = allAudits.filter((a) => a.specialistUserId === s.id && a.reviewStatus === 'مكتملة').length;
      return {
        id: s.id,
        specialistName: s.name,
        governorateName: govName,
        casesCount,
        reviewedCount,
        closedCount,
      };
    });
  }, [allAudits, allCases, specialists]);

  const specialistPerfColumns = [
    { header: 'اسم الأخصائي', accessor: 'specialistName' },
    { header: 'المحافظة', accessor: 'governorateName' },
    { header: 'عدد الحالات المسجلة', accessor: 'casesCount' },
    { header: 'عدد الحالات التي تمت مراجعتها مركزيًا', accessor: 'reviewedCount' },
    { header: 'عدد الحالات المغلقة', accessor: 'closedCount' },
  ];

  return (
    <div className="space-y-6" dir="rtl" ref={exportRef}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">لوحة المؤشرات الثانية: تقويم الكفاءة المهنية لأخصائيين التشخيص</h1>
          <p className="text-gray-600">
            {isSpecialist()
              ? 'عرض مؤشرات وتقويمات الحالات (قراءة فقط)'
              : isSupervisor()
              ? 'إدخال تقويم الحالة التشخيصية وبيانات المراجعة المركزية'
              : 'تقويم أداء المراجع المركزي وإضافة ملاحظات إشرافية'}
          </p>
        </div>
        <ExportPdfButton
          targetRef={exportRef}
          fileName="لوحة-المؤشرات-الثانية-تقويم-الكفاءة-المهنية.pdf"
          className="w-full md:w-auto"
        />
      </div>

      {/* Filter Bar */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Select
            label="الأخصائي"
            value={filterSpecialistId}
            onChange={(e) => setFilterSpecialistId(e.target.value)}
            options={specialistOptions}
          />
          <Select
            label="المحافظة"
            value={filterGovernorateId}
            onChange={(e) => setFilterGovernorateId(e.target.value)}
            options={governorateOptions}
          />
          <DatePicker
            label="الفترة الزمنية (من)"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
          />
          <DatePicker
            label="الفترة الزمنية (إلى)"
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
          />
          <Select
            label="حالة الحالة التشخيصية"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={statusOptions}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Select
            label="اسم المراجع المركزي"
            value={filterCentralReviewerId}
            onChange={(e) => setFilterCentralReviewerId(e.target.value)}
            options={reviewerOptions}
            disabled={isSupervisor()}
          />
          {isSectionHead() ? (
            <Select
              label="المشرف (فلتر إضافي لرئيس القسم)"
              value={filterCentralReviewerId}
              onChange={(e) => setFilterCentralReviewerId(e.target.value)}
              options={reviewerOptions}
            />
          ) : (
            <div />
          )}
          <div className="flex items-end justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFilterSpecialistId('');
                setFilterGovernorateId('');
                setFilterFromDate('');
                setFilterToDate('');
                setFilterStatus('');
                setFilterCentralReviewerId(isSupervisor() ? user?.id || '' : '');
              }}
            >
              مسح التصفية
            </Button>
          </div>
        </div>
      </Card>

      {/* Cases Table */}
      <Card title="قائمة الحالات التشخيصية">
        <Table
          columns={columns}
          data={filteredCases}
          onRowClick={(row) => setSelectedCaseId(row.id)}
        />
        <div className="mt-4 text-sm text-gray-600">إجمالي الحالات: {filteredCases.length}</div>
      </Card>

      {/* Detail + Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card title="عرض ملخص الحالة (للقراءة فقط)">
            {selectedCase ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">رقم الحالة</p>
                    <p className="font-semibold text-[#211551]">{selectedCase.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">اسم الطالب</p>
                    <p className="font-medium">{selectedCase.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">نوع الإعاقة</p>
                    <p className="font-medium">{selectedCase.disabilityType || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">المحافظة</p>
                    <p className="font-medium">{getGovernorateName(selectedCase.governorateId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الأخصائي المُسجِّل</p>
                    <p className="font-medium">{selectedSpecialist?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">تاريخ تسجيل الحالة</p>
                    <p className="font-medium">
                      {selectedCase.createdAt ? format(new Date(selectedCase.createdAt), 'yyyy-MM-dd') : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">حالة الحالة التشخيصية</p>
                    <Badge variant={selectedCase.status === CASE_STATUS.COMPLETED ? 'success' : 'danger'}>
                      {selectedCase.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">التقارير/المستندات المرفقة (تجريبي)</p>
                    <p className="font-medium">
                      {Number(selectedCase.attachments?.count ?? 0)} / {Number(selectedCase.attachments?.required ?? 0)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">الملاحظات المسجلة من الأخصائي المُسجِّل</p>
                  <p className="text-gray-700 whitespace-pre-line">{selectedCase.caseDescription || '—'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">اختر حالة من الجدول لعرض التفاصيل.</p>
            )}
          </Card>

          <Card title="جدول عرض أداء الأخصائيين (وصفي تجميعي)">
            <Table columns={specialistPerfColumns} data={specialistPerfRows} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="تقويم الحالة التشخيصية (وصفي)">
            {!selectedCase ? (
              <p className="text-gray-600">اختر حالة من الجدول أولاً.</p>
            ) : (
              <div className="space-y-4">
                {[
                  { key: 'axis1', label: 'التحضير والاستعداد المهني' },
                  { key: 'axis2', label: 'جودة أدوات القياس المستخدمة' },
                  { key: 'axis3', label: 'دقة التحليل والتفسير' },
                  { key: 'axis4', label: 'جودة التوصيات والتقارير' },
                  { key: 'axis5', label: 'التوثيق والحوكمة' },
                  { key: 'axis6', label: 'التواصل المهني مع الأطراف ذات الصلة' },
                  { key: 'axis7', label: 'التطوير المستمر والتعلم الذاتي' },
                ].map((axis) => (
                  <div key={axis.key}>
                    <p className="text-sm font-medium text-gray-700 mb-2">{axis.label}</p>
                    <textarea
                      value={reviewForm.professionalAxesNotes[axis.key]}
                      onChange={(e) => updateAxis(axis.key, e.target.value)}
                      rows={3}
                      disabled={!canEditCentralReview}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none disabled:bg-gray-50"
                      placeholder="أدخل ملاحظات وصفية..."
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="بيانات المراجعة المركزية للحالة">
            {!selectedCase ? (
              <p className="text-gray-600">اختر حالة من الجدول أولاً.</p>
            ) : (
              <div className="space-y-4">
                {saveNote ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
                    {saveNote}
                  </div>
                ) : null}
                <Input
                  label="اسم المراجع المركزي"
                  value={reviewForm.centralReviewerName}
                  onChange={(e) => setReviewForm((p) => ({ ...p, centralReviewerName: e.target.value }))}
                  disabled={!canEditCentralReview}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DatePicker
                    label="تاريخ بدء المراجعة"
                    value={reviewForm.reviewStartDate}
                    onChange={(e) => setReviewForm((p) => ({ ...p, reviewStartDate: e.target.value }))}
                    disabled={!canEditCentralReview}
                  />
                  <DatePicker
                    label="تاريخ إغلاق المراجعة"
                    value={reviewForm.reviewCloseDate}
                    onChange={(e) => setReviewForm((p) => ({ ...p, reviewCloseDate: e.target.value }))}
                    disabled={!canEditCentralReview}
                  />
                </div>
                <Select
                  label="حالة المراجعة"
                  value={reviewForm.reviewStatus}
                  onChange={(e) => setReviewForm((p) => ({ ...p, reviewStatus: e.target.value }))}
                  options={reviewStatusOptions}
                  disabled={!canEditCentralReview}
                />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">ملاحظات عامة على الحالة</p>
                  <textarea
                    value={reviewForm.generalNotes}
                    onChange={(e) => setReviewForm((p) => ({ ...p, generalNotes: e.target.value }))}
                    rows={4}
                    disabled={!canEditCentralReview}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none disabled:bg-gray-50"
                    placeholder="أدخل ملاحظات عامة..."
                  />
                </div>

                {canEditCentralReview && (
                  <div className="flex justify-end">
                    <Button type="button" variant="primary" disabled={saving} onClick={handleSaveCentralReview}>
                      {saving ? 'جاري الحفظ...' : 'حفظ بيانات المراجعة'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card title="تقويم أداء المراجع المركزي (لرئيس القسم فقط)">
            {!selectedCase ? (
              <p className="text-gray-600">اختر حالة من الجدول أولاً.</p>
            ) : (
              <div className="space-y-4">
                <Select
                  label="الالتزام بتطبيق محاور التقويم المهني"
                  value={reviewerPerfForm.adherence}
                  onChange={(e) => setReviewerPerfForm((p) => ({ ...p, adherence: e.target.value }))}
                  options={ratingOptions}
                  disabled={!canEditReviewerPerformance}
                />
                <Select
                  label="جودة الملاحظات المهنية"
                  value={reviewerPerfForm.notesQuality}
                  onChange={(e) => setReviewerPerfForm((p) => ({ ...p, notesQuality: e.target.value }))}
                  options={ratingOptions}
                  disabled={!canEditReviewerPerformance}
                />
                <Select
                  label="الالتزام الزمني بالمراجعة"
                  value={reviewerPerfForm.timeliness}
                  onChange={(e) => setReviewerPerfForm((p) => ({ ...p, timeliness: e.target.value }))}
                  options={ratingOptions}
                  disabled={!canEditReviewerPerformance}
                />
                <Select
                  label="المهنية في اتخاذ الحكم"
                  value={reviewerPerfForm.professionalism}
                  onChange={(e) => setReviewerPerfForm((p) => ({ ...p, professionalism: e.target.value }))}
                  options={ratingOptions}
                  disabled={!canEditReviewerPerformance}
                />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">ملاحظات المسؤول المركزي المباشر على أداء المراجع المركزي</p>
                  <textarea
                    value={reviewerPerfForm.sectionHeadNotes}
                    onChange={(e) => setReviewerPerfForm((p) => ({ ...p, sectionHeadNotes: e.target.value }))}
                    rows={4}
                    disabled={!canEditReviewerPerformance}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none disabled:bg-gray-50"
                    placeholder="أدخل ملاحظات إشرافية..."
                  />
                </div>

                {canEditReviewerPerformance && (
                  <div className="flex justify-end">
                    <Button type="button" variant="primary" disabled={saving} onClick={handleSaveReviewerPerformance}>
                      {saving ? 'جاري الحفظ...' : 'حفظ تقويم المراجع المركزي'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuditCases;
