import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { casesStorage, auditsStorage, usersStorage } from '../../../data/storage';
import { GOVERNORATES, CASE_STATUS } from '../../../data/constants';
import Card from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import DatePicker from '../../../components/ui/DatePicker';
import ExportPdfButton from '../../../components/ui/ExportPdfButton';
import ExportCsvButton from '../../../components/ui/ExportCsvButton';
import SpecialistsList from './SpecialistsList';
import { format } from 'date-fns';

const AuditCases = () => {
  const exportRef = useRef(null);
  const navigate = useNavigate();
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
  const [filterReviewerEvalStatus, setFilterReviewerEvalStatus] = useState('');

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

  const getGovernorateName = useCallback((governorateId) => {
    return GOVERNORATES.find((g) => g.id === governorateId)?.name || 'غير محدد';
  }, []);

  const getSpecialistForCase = useCallback((caseItem) => {
    if (!caseItem?.governorateId) return null;
    return specialists.find((s) => s.governorateId === caseItem.governorateId) || null;
  }, [specialists]);

  const parseISODate = useCallback((value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }, []);

  const isWithinRange = useCallback((dateValue, from, to) => {
    const d = parseISODate(dateValue);
    if (!d) return false;
    const fromD = parseISODate(from);
    const toD = parseISODate(to);
    if (fromD && d < fromD) return false;
    if (toD && d > toD) return false;
    return true;
  }, [parseISODate]);

  const reviewStatusOrder = (label) => {
    const order = ['غير محددة', 'تحتاج متابعة', 'قيد المراجعة', 'مكتملة'];
    const idx = order.indexOf(label);
    return idx === -1 ? order.length : idx;
  };

  // For section head: غير محددة last (higher = later)
  const reviewStatusOrderSectionHead = (label) => {
    const order = ['مكتملة', 'تحتاج متابعة', 'قيد المراجعة', 'غير محددة'];
    const idx = order.indexOf(label);
    return idx === -1 ? -1 : idx;
  };

  const reviewerEvalOrder = (label) => {
    const order = ['غير مقيم', 'قيد التقييم', 'مكتمل'];
    const idx = order.indexOf(label);
    return idx === -1 ? order.length : idx;
  };

  const reviewerEvalStatusLabel = (audit) => {
    if (!audit || !audit.reviewerPerformance) return 'غير مقيم';
    const rp = audit.reviewerPerformance || {};
    const hasAllRatings = Boolean(rp.adherence && rp.notesQuality && rp.timeliness && rp.professionalism);
    return hasAllRatings ? 'مكتمل' : 'قيد التقييم';
  };

  const reviewerEvalVariant = (label) => {
    if (label === 'مكتمل') return 'success';
    if (label === 'قيد التقييم') return 'info';
    return 'default';
  };

  // Filtered cases list (for table)
  const filteredCases = useMemo(() => {
    let filtered = [...allCases];
    const auditByCaseId = new Map(allAudits.map((a) => [a.caseId, a]));

    // Specialist: show only own governorate cases (no cross-governorate access)
    if (isSpecialist() && user?.governorateId) {
      filtered = filtered.filter((c) => c.governorateId === user.governorateId);
    }

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
        const audit = auditByCaseId.get(c.id);
        return audit?.centralReviewerUserId === filterCentralReviewerId;
      });
    }

    // Filter by section-head evaluation status (only for section head)
    if (isSectionHead() && filterReviewerEvalStatus) {
      filtered = filtered.filter((c) => {
        const audit = auditByCaseId.get(c.id);
        return reviewerEvalStatusLabel(audit) === filterReviewerEvalStatus;
      });
    }

    return filtered.sort((a, b) => {
      const aAudit = auditByCaseId.get(a.id);
      const bAudit = auditByCaseId.get(b.id);

      if (isSectionHead()) {
        const aEvalLabel = reviewerEvalStatusLabel(aAudit);
        const bEvalLabel = reviewerEvalStatusLabel(bAudit);
        const byEval = reviewerEvalOrder(aEvalLabel) - reviewerEvalOrder(bEvalLabel);
        if (byEval !== 0) return byEval;

        const aReviewLabel = aAudit?.reviewStatus || 'غير محددة';
        const bReviewLabel = bAudit?.reviewStatus || 'غير محددة';
        const byReview = reviewStatusOrderSectionHead(aReviewLabel) - reviewStatusOrderSectionHead(bReviewLabel);
        if (byReview !== 0) return byReview;

        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      }

      const aReviewLabel = aAudit?.reviewStatus || 'غير محددة';
      const bReviewLabel = bAudit?.reviewStatus || 'غير محددة';
      const byReview = reviewStatusOrder(aReviewLabel) - reviewStatusOrder(bReviewLabel);
      if (byReview !== 0) return byReview;

      const aCaseRank = a.status === CASE_STATUS.COMPLETED ? 0 : 1;
      const bCaseRank = b.status === CASE_STATUS.COMPLETED ? 0 : 1;
      const byCaseStatus = aCaseRank - bCaseRank;
      if (byCaseStatus !== 0) return byCaseStatus;

      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [
    allCases,
    allAudits,
    isSpecialist,
    user?.governorateId,
    filterCentralReviewerId,
    filterReviewerEvalStatus,
    filterFromDate,
    filterGovernorateId,
    filterSpecialistId,
    filterStatus,
    filterToDate,
    isWithinRange,
    isSectionHead,
    specialists,
  ]);

  const reviewStatusLabel = (audit) => {
    return audit?.reviewStatus || 'غير محددة';
  };

  const reviewStatusVariant = (label) => {
    if (label === 'مكتملة') return 'success';
    if (label === 'تحتاج متابعة') return 'warning';
    if (label === 'قيد المراجعة') return 'info';
    if (label === 'غير محددة') return 'default';
    return 'default';
  };

  const columns = useMemo(() => {
    const auditByCaseId = new Map(allAudits.map((a) => [a.caseId, a]));
    const userById = new Map(allUsers.map((u) => [u.id, u]));

    const centralReviewerCol = {
      header: 'المراجع المركزي',
      accessor: 'centralReviewerName',
      render: (row) => {
        const audit = auditByCaseId.get(row.id);
        if (!audit) return '—';
        if (audit.centralReviewerName) return audit.centralReviewerName;
        const u = audit.centralReviewerUserId ? userById.get(audit.centralReviewerUserId) : null;
        return u?.name || u?.username || '—';
      },
    };

    const reviewerEvalCol = {
      header: 'حالة تقييم رئيس القسم للمراجع العام',
      accessor: 'reviewerEvalStatus',
      render: (row) => {
        const audit = auditByCaseId.get(row.id);
        const label = reviewerEvalStatusLabel(audit);
        return <Badge variant={reviewerEvalVariant(label)}>{label}</Badge>;
      },
    };

    return [
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
      ...(isSectionHead() ? [centralReviewerCol, reviewerEvalCol] : []),
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
          const audit = auditByCaseId.get(row.id);
          const label = reviewStatusLabel(audit);
          return <Badge variant={reviewStatusVariant(label)}>{label}</Badge>;
        },
      },
      ...(isSupervisor() && !isSectionHead() ? [reviewerEvalCol] : []),
    ];
  }, [allAudits, allUsers, getGovernorateName, getSpecialistForCase, isSectionHead, isSupervisor]);

  const reviewerEvalStatusOptions = [
    { value: '', label: 'جميع الحالات' },
    { value: 'غير مقيم', label: 'غير مقيم' },
    { value: 'قيد التقييم', label: 'قيد التقييم' },
    { value: 'مكتمل', label: 'مكتمل' },
  ];

  const governorateOptions = [
    { value: '', label: 'جميع المحافظات' },
    ...GOVERNORATES.map((g) => ({ value: g.id, label: g.name })),
  ];

  // Specialists: narrow by selected governorate; for section head also by selected central reviewer
  const specialistOptionsFiltered = useMemo(() => {
    let list = specialists;
    if (filterGovernorateId) {
      list = list.filter((s) => s.governorateId === filterGovernorateId);
    }
    if (isSectionHead() && filterCentralReviewerId) {
      const caseIdsReviewedByReviewer = new Set(
        allAudits
          .filter((a) => a.centralReviewerUserId === filterCentralReviewerId)
          .map((a) => a.caseId)
      );
      const governorateIdsWithReviewer = new Set(
        allCases
          .filter((c) => caseIdsReviewedByReviewer.has(c.id))
          .map((c) => c.governorateId)
          .filter(Boolean)
      );
      list = list.filter((s) => governorateIdsWithReviewer.has(s.governorateId));
    }
    return list;
  }, [
    specialists,
    filterGovernorateId,
    filterCentralReviewerId,
    isSectionHead,
    allCases,
    allAudits,
  ]);

  const specialistOptions = [
    { value: '', label: 'جميع الأخصائيين' },
    ...specialistOptionsFiltered.map((s) => ({ value: s.id, label: `${s.name} - ${s.governorateName}` })),
  ];

  const statusOptions = [
    { value: '', label: 'جميع الحالات' },
    { value: CASE_STATUS.COMPLETED, label: CASE_STATUS.COMPLETED },
    { value: CASE_STATUS.INCOMPLETE, label: CASE_STATUS.INCOMPLETE },
  ];

  // Reviewers: for section head, narrow by selected specialist (reviewers who reviewed that specialist's cases)
  const reviewerOptionsFiltered = useMemo(() => {
    if (!isSectionHead()) return centralReviewers;
    if (!filterSpecialistId) return centralReviewers;
    const spec = specialists.find((s) => s.id === filterSpecialistId);
    if (!spec?.governorateId) return centralReviewers;
    const caseIdsInGov = allCases.filter((c) => c.governorateId === spec.governorateId).map((c) => c.id);
    const reviewerIds = new Set(
      allAudits.filter((a) => caseIdsInGov.includes(a.caseId)).map((a) => a.centralReviewerUserId)
    );
    return centralReviewers.filter((r) => reviewerIds.has(r.id));
  }, [
    centralReviewers,
    isSectionHead,
    filterSpecialistId,
    specialists,
    allCases,
    allAudits,
  ]);

  const reviewerOptions = [
    { value: '', label: 'جميع المراجعين' },
    ...reviewerOptionsFiltered.map((r) => ({ value: r.id, label: r.name || r.username })),
  ];

  // Keep filter combinations valid: clear specialist/reviewer when options narrow and selection is no longer valid
  useEffect(() => {
    if (!filterGovernorateId || !filterSpecialistId) return;
    const spec = specialists.find((s) => s.id === filterSpecialistId);
    if (spec && spec.governorateId !== filterGovernorateId) setFilterSpecialistId('');
  }, [filterGovernorateId, filterSpecialistId, specialists]);

  useEffect(() => {
    if (!isSectionHead() || !filterSpecialistId || !filterCentralReviewerId) return;
    const validReviewerIds = new Set(reviewerOptionsFiltered.map((r) => r.id));
    if (!validReviewerIds.has(filterCentralReviewerId)) setFilterCentralReviewerId('');
  }, [isSectionHead, filterSpecialistId, filterCentralReviewerId, reviewerOptionsFiltered]);

  useEffect(() => {
    if (!isSectionHead() || !filterCentralReviewerId || !filterSpecialistId) return;
    const validSpecialistIds = new Set(specialistOptionsFiltered.map((s) => s.id));
    if (!validSpecialistIds.has(filterSpecialistId)) setFilterSpecialistId('');
  }, [isSectionHead, filterCentralReviewerId, filterSpecialistId, specialistOptionsFiltered]);

  const csvHeader = useMemo(() => {
    return [
      'رقم الحالة',
      'اسم الطالب',
      'نوع الإعاقة',
      'الأخصائي المُسجِّل',
      'المحافظة',
      ...(isSectionHead() ? ['المراجع المركزي', 'حالة تقييم رئيس القسم للمراجع العام'] : []),
      'تاريخ تسجيل الحالة',
      'حالة الحالة التشخيصية',
      'حالة المراجعة',
      ...(isSupervisor() && !isSectionHead() ? ['حالة تقييم رئيس القسم للمراجع العام'] : []),
    ];
  }, [isSectionHead, isSupervisor]);

  const csvRows = useMemo(() => {
    const auditByCaseId = new Map(allAudits.map((a) => [a.caseId, a]));
    const userById = new Map(allUsers.map((u) => [u.id, u]));

    const getCentralReviewerName = (caseId) => {
      const audit = auditByCaseId.get(caseId);
      if (!audit) return '—';
      if (audit.centralReviewerName) return audit.centralReviewerName;
      const u = audit.centralReviewerUserId ? userById.get(audit.centralReviewerUserId) : null;
      return u?.name || u?.username || '—';
    };

    return filteredCases.map((row) => {
      const specialist = getSpecialistForCase(row);
      const audit = auditByCaseId.get(row.id);
      const reviewLabel = reviewStatusLabel(audit);
      const reviewerEvalLabel = reviewerEvalStatusLabel(audit);

      return [
        row.id,
        row.studentName,
        row.disabilityType,
        specialist?.name || '—',
        getGovernorateName(row.governorateId),
        ...(isSectionHead() ? [getCentralReviewerName(row.id), reviewerEvalLabel] : []),
        row.createdAt ? format(new Date(row.createdAt), 'yyyy-MM-dd') : '—',
        row.status,
        reviewLabel,
        ...(isSupervisor() && !isSectionHead() ? [reviewerEvalLabel] : []),
      ];
    });
  }, [
    allAudits,
    allUsers,
    filteredCases,
    getGovernorateName,
    getSpecialistForCase,
    isSectionHead,
    isSupervisor,
  ]);

  const casesEvaluationContent = (
    <div className="space-y-6">
      {/* Filter Bar */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {isSpecialist() ? null : (
            <Select
              label="المحافظة"
              value={filterGovernorateId}
              onChange={(e) => setFilterGovernorateId(e.target.value)}
              options={governorateOptions}
            />
          )}
          {isSpecialist() ? null : (
            <Select
              label="الأخصائي"
              value={filterSpecialistId}
              onChange={(e) => setFilterSpecialistId(e.target.value)}
              options={specialistOptions}
            />
          )}
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

        <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
          {isSectionHead() ? (
            <div className="grid grid-cols-2 gap-4 items-end min-w-[56rem]">
              <div className="min-w-[27rem]">
                <Select
                  label="اسم المراجع المركزي"
                  value={filterCentralReviewerId}
                  onChange={(e) => setFilterCentralReviewerId(e.target.value)}
                  options={reviewerOptions}
                />
              </div>
              <div className="min-w-[27rem]">
                <Select
                  label="حالة تقييم رئيس القسم للمراجع العام"
                  value={filterReviewerEvalStatus}
                  onChange={(e) => setFilterReviewerEvalStatus(e.target.value)}
                  options={reviewerEvalStatusOptions}
                />
              </div>
            </div>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFilterSpecialistId('');
              setFilterGovernorateId('');
              setFilterFromDate('');
              setFilterToDate('');
              setFilterStatus('');
              setFilterCentralReviewerId('');
              setFilterReviewerEvalStatus('');
            }}
          >
            مسح التصفية
          </Button>
        </div>
      </Card>

      {/* Cases Table */}
      <Card title="قائمة الحالات التشخيصية">
        <div className="max-h-[520px] overflow-auto">
          <Table
            columns={columns}
            data={filteredCases}
            fit
            onRowClick={(row) => {
              const targetPath = isSpecialist()
                ? `/portal/specialist/audit/${row.id}`
                : `/portal/supervisor/audit/${row.id}`;
              navigate(targetPath);
            }}
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">إجمالي الحالات: {filteredCases.length}</div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl" ref={exportRef}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">
            {isSupervisor() || isSectionHead()
              ? 'تقويم الكفاءة المهنية للأخصائيين'
              : 'تقويم الكفاءة المهنية لأخصائيين التشخيص'}
          </h1>
          <p className="text-gray-600">
            {isSpecialist()
              ? 'عرض مؤشرات وتقويمات الحالات (قراءة فقط)'
              : 'متابعة تقويم الحالات وتقييم أداء الأخصائيين من شاشة واحدة'}
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3 md:items-end">
          <ExportPdfButton
            targetRef={exportRef}
            fileName="لوحة-المؤشرات-الثانية-تقويم-الكفاءة-المهنية.pdf"
            className="w-full md:w-auto"
          />
          <ExportCsvButton
            fileName="تقويم-الكفاءة-المهنية-قائمة-الحالات.csv"
            header={csvHeader}
            rows={csvRows}
            className="w-full md:w-auto"
          />
        </div>
      </div>

      {casesEvaluationContent}

      {isSpecialist() ? null : (
        <div className="pt-2">
          <SpecialistsList />
        </div>
      )}
    </div>
  );
};

export default AuditCases;
