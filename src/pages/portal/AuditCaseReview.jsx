import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { IoArrowBack } from 'react-icons/io5';

import { useAuth } from '../../context/AuthContext';
import { casesStorage, auditsStorage, usersStorage } from '../../data/storage';
import { GOVERNORATES, CASE_STATUS } from '../../data/constants';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DatePicker from '../../components/ui/DatePicker';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ExportPdfButton from '../../components/ui/ExportPdfButton';

const professionalAxes = [
  { key: 'axis1', label: 'التحضير والاستعداد المهني' },
  { key: 'axis2', label: 'جودة أدوات القياس المستخدمة' },
  { key: 'axis3', label: 'دقة التحليل والتفسير' },
  { key: 'axis4', label: 'جودة التوصيات والتقارير' },
  { key: 'axis5', label: 'التوثيق والحوكمة' },
  { key: 'axis6', label: 'التواصل المهني مع الأطراف ذات الصلة' },
  { key: 'axis7', label: 'التطوير المستمر والتعلم الذاتي' },
];

const reviewStatusOptions = [
  { value: '', label: 'غير محددة' },
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

const todayISO = () => new Date().toISOString().split('T')[0];

const isCentralReviewComplete = (data) => {
  const axes = data?.professionalAxesNotes || {};
  const hasAllAxes = professionalAxes.every((a) => (axes[a.key] || '').trim().length > 0);
  const hasGeneral = (data?.generalNotes || '').trim().length > 0;
  const hasStart = Boolean(data?.reviewStartDate);
  return hasAllAxes && hasGeneral && hasStart;
};

const AuditCaseReview = () => {
  const exportRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isSupervisor, isSectionHead } = useAuth();

  const allUsers = usersStorage.getAll();
  const specialists = useMemo(() => allUsers.filter((u) => u.role === 'الأخصائي'), [allUsers]);

  const caseItem = casesStorage.findById(id);
  const governorateName = useMemo(() => {
    if (!caseItem?.governorateId) return 'غير محدد';
    return GOVERNORATES.find((g) => g.id === caseItem.governorateId)?.name || 'غير محدد';
  }, [caseItem?.governorateId]);

  const specialistForCase = useMemo(() => {
    if (!caseItem?.governorateId) return null;
    return specialists.find((s) => s.governorateId === caseItem.governorateId) || null;
  }, [caseItem?.governorateId, specialists]);

  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState('');
  const [review, setReview] = useState(null);

  // Central review form (Supervisor)
  const [reviewForm, setReviewForm] = useState({
    centralReviewerName: '',
    reviewStartDate: '',
    reviewCloseDate: '',
    reviewStatus: '',
    generalNotes: '',
    professionalAxesNotes: professionalAxes.reduce((acc, a) => ({ ...acc, [a.key]: '' }), {}),
  });

  // Reviewer performance form (Section head)
  const [reviewerPerfForm, setReviewerPerfForm] = useState({
    adherence: '',
    notesQuality: '',
    timeliness: '',
    professionalism: '',
    sectionHeadNotes: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const found = auditsStorage.findByCaseId(id) || null;
    setReview(found);

    setReviewForm({
      centralReviewerName: found?.centralReviewerName || user?.name || '',
      reviewStartDate: found?.reviewStartDate || '',
      reviewCloseDate: found?.reviewCloseDate || '',
      reviewStatus: found?.reviewStatus || '',
      generalNotes: found?.generalNotes || '',
      professionalAxesNotes: {
        axis1: found?.professionalAxesNotes?.axis1 || '',
        axis2: found?.professionalAxesNotes?.axis2 || '',
        axis3: found?.professionalAxesNotes?.axis3 || '',
        axis4: found?.professionalAxesNotes?.axis4 || '',
        axis5: found?.professionalAxesNotes?.axis5 || '',
        axis6: found?.professionalAxesNotes?.axis6 || '',
        axis7: found?.professionalAxesNotes?.axis7 || '',
      },
    });

    setReviewerPerfForm({
      adherence: found?.reviewerPerformance?.adherence || '',
      notesQuality: found?.reviewerPerformance?.notesQuality || '',
      timeliness: found?.reviewerPerformance?.timeliness || '',
      professionalism: found?.reviewerPerformance?.professionalism || '',
      sectionHeadNotes: found?.reviewerPerformance?.sectionHeadNotes || '',
    });
  }, [id, user?.name]);

  if (!caseItem) {
    return (
      <div className="text-center py-12" dir="rtl">
        <p className="text-gray-600">الحالة غير موجودة</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate(-1)}>
          العودة
        </Button>
      </div>
    );
  }

  const canEditCentralReview = isSupervisor();
  const canEditReviewerPerformance = isSectionHead();

  const upsertReview = (partial) => {
    const current = auditsStorage.findByCaseId(id);
    const base = {
      caseId: caseItem.id,
      governorateId: caseItem.governorateId,
      specialistUserId: specialistForCase?.id || null,
    };

    if (current) {
      auditsStorage.update(current.id, { ...base, ...partial });
      return current.id;
    }

    const created = auditsStorage.create({ ...base, ...partial });
    return created?.id || null;
  };

  const handleSaveCentralReview = async () => {
    setSaving(true);
    setSaveNote('');

    const startDate = reviewForm.reviewStartDate || todayISO();
    const requestedStatus = reviewForm.reviewStatus || '';

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
    let validationFailed = false;

    if (requestedStatus === 'مكتملة') {
      const ok = isCentralReviewComplete(baseDraft);
      if (!ok) {
        validationFailed = true;
        finalStatus = 'قيد المراجعة';
        closeDate = '';
        setSaveNote(
          'لا يمكن اعتماد حالة المراجعة كمكتملة إلا بعد استكمال جميع محاور التقويم وإضافة ملاحظات عامة وتسجيل تاريخ بدء المراجعة.'
        );
      } else {
        closeDate = closeDate || todayISO();
      }
    } else if (requestedStatus && requestedStatus !== 'مكتملة') {
      closeDate = '';
    }

    const payload = {
      ...baseDraft,
      reviewStartDate: startDate,
      reviewStatus: finalStatus,
      reviewCloseDate: closeDate,
    };

    upsertReview(payload);
    const updated = auditsStorage.findByCaseId(id) || null;
    setReview(updated);
    setSaving(false);

    if (!validationFailed) {
      navigate(-1);
    }
  };

  const handleSaveReviewerPerformance = async () => {
    setSaving(true);

    const payload = {
      reviewerPerformance: {
        ...reviewerPerfForm,
        evaluatedByUserId: user?.id || null,
        evaluatedByName: user?.name || '',
      },
    };

    upsertReview(payload);
    const updated = auditsStorage.findByCaseId(id) || null;
    setReview(updated);
    setSaving(false);
    navigate(-1);
  };

  const attachmentsCount = Number(caseItem?.attachments?.count ?? 0);
  const attachmentsRequired = Number(caseItem?.attachments?.required ?? 0);

  return (
    <div className="space-y-6" dir="rtl" ref={exportRef}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate(-1)} className="cursor-pointer mt-1">
            <IoArrowBack size={22} className="text-[#211551]" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#211551] mb-2">تفاصيل تقويم الحالة التشخيصية</h1>
            <p className="text-gray-600">
              رقم الحالة: <span className="font-semibold">{caseItem.id}</span> —{' '}
              <span className="font-medium">{caseItem.studentName}</span>
            </p>
          </div>
        </div>
        <ExportPdfButton
          targetRef={exportRef}
          fileName={`تقويم-الحالة-${caseItem.id}.pdf`}
          className="w-full md:w-auto"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card title="عرض ملخص الحالة (للقراءة فقط)">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">اسم الطالب</p>
                  <p className="font-medium">{caseItem.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">المحافظة</p>
                  <p className="font-medium">{governorateName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">نوع الإعاقة</p>
                  <p className="font-medium">{caseItem.disabilityType || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">الأخصائي المُسجِّل</p>
                  <p className="font-medium">{specialistForCase?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">تاريخ تسجيل الحالة</p>
                  <p className="font-medium">
                    {caseItem.createdAt ? format(new Date(caseItem.createdAt), 'yyyy-MM-dd') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">حالة الحالة التشخيصية</p>
                  <Badge variant={caseItem.status === CASE_STATUS.COMPLETED ? 'success' : 'warning'}>
                    {caseItem.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                  <p className="text-sm text-gray-600 mb-1">عدد المرفقات المرفوعة</p>
                  <p className="text-2xl font-bold text-[#211551]">{attachmentsCount}</p>
                </div>
                <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                  <p className="text-sm text-gray-600 mb-1">عدد المرفقات المطلوبة</p>
                  <p className="text-2xl font-bold text-[#211551]">{attachmentsRequired || '—'}</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">ملاحظات الأخصائي المُسجِّل</p>
                <p className="text-gray-800 whitespace-pre-line">{caseItem.caseDescription || '—'}</p>
              </div>
            </div>
          </Card>

          <Card title="تفاصيل الحالة">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">جهة الإحالة</p>
                <p className="font-medium">{caseItem.referralSource || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">تاريخ التشخيص</p>
                <p className="font-medium">{caseItem.diagnosisDate || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">نوع المدرسة</p>
                <p className="font-medium">{caseItem.schoolType || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">اسم المدرسة</p>
                <p className="font-medium">{caseItem.school || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">برنامج التعليم</p>
                <p className="font-medium">{caseItem.educationProgram || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">نوع الدمج</p>
                <p className="font-medium">{caseItem.inclusionType || '—'}</p>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 border border-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">التوصيات</p>
              <p className="text-gray-800 whitespace-pre-line">{caseItem.recommendations || '—'}</p>
            </div>
          </Card>

          {isSectionHead() ? (
            <Card title="تقويم أداء المراجع المركزي (لرئيس القسم فقط)">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    ملاحظات المسؤول المركزي المباشر على أداء المراجع المركزي
                  </p>
                  <textarea
                    value={reviewerPerfForm.sectionHeadNotes}
                    onChange={(e) => setReviewerPerfForm((p) => ({ ...p, sectionHeadNotes: e.target.value }))}
                    rows={4}
                    disabled={!canEditReviewerPerformance}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none disabled:bg-gray-50"
                    placeholder="أدخل ملاحظات إشرافية..."
                  />
                </div>

                {canEditReviewerPerformance ? (
                  <div className="flex justify-end">
                    <Button type="button" variant="primary" disabled={saving} onClick={handleSaveReviewerPerformance}>
                      {saving ? 'جاري الحفظ...' : 'حفظ تقويم المراجع المركزي'}
                    </Button>
                  </div>
                ) : null}
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card title="تقويم الحالة التشخيصية (وصفي)">
            <div className="space-y-4">
              {professionalAxes.map((axis) => (
                <div key={axis.key}>
                  <p className="text-sm font-medium text-gray-700 mb-2">{axis.label}</p>
                  <textarea
                    value={reviewForm.professionalAxesNotes[axis.key]}
                    onChange={(e) =>
                      setReviewForm((p) => ({
                        ...p,
                        professionalAxesNotes: { ...p.professionalAxesNotes, [axis.key]: e.target.value },
                      }))
                    }
                    rows={3}
                    disabled={!canEditCentralReview}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none disabled:bg-gray-50"
                    placeholder="أدخل ملاحظات وصفية..."
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card title="بيانات المراجعة المركزية للحالة">
            <div className="space-y-4">
              {saveNote ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg text-sm">
                  {saveNote}
                </div>
              ) : null}

              {review?.followUp?.reason ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
                  <p className="font-semibold mb-1">تنبيه: تم تعديل الحالة بعد المراجعة</p>
                  <p className="mb-1">{review.followUp.reason}</p>
                  <p className="text-xs text-blue-700">
                    آخر تعديل: {review.followUp.updatedByName || '—'} —{' '}
                    {review.followUp.updatedAt
                      ? format(new Date(review.followUp.updatedAt), 'yyyy-MM-dd HH:mm')
                      : '—'}
                  </p>
                </div>
              ) : null}

              {!isSupervisor() ? (
                <Input
                  label="اسم المراجع المركزي"
                  value={reviewForm.centralReviewerName}
                  onChange={(e) => setReviewForm((p) => ({ ...p, centralReviewerName: e.target.value }))}
                  disabled={!canEditCentralReview}
                />
              ) : null}

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

              {canEditCentralReview ? (
                <div className="flex justify-end">
                  <Button type="button" variant="primary" disabled={saving} onClick={handleSaveCentralReview}>
                    {saving ? 'جاري الحفظ...' : 'حفظ بيانات المراجعة'}
                  </Button>
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuditCaseReview;

