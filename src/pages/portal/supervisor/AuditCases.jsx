import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { casesStorage, auditsStorage } from '../../../data/storage';
import { GOVERNORATES, CASE_STATUS, AUDIT_DECISIONS } from '../../../data/constants';
import Card from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import ExportPdfButton from '../../../components/ui/ExportPdfButton';
import KPICard from '../../../components/charts/KPICard';
import DonutChart from '../../../components/charts/DonutChart';
import BarChart from '../../../components/charts/BarChart';
import { IoCheckmarkCircle, IoCloseCircle, IoTime, IoDocumentText, IoEye } from 'react-icons/io5';
import { CHART_COLORS } from '../../../data/constants';
import { format } from 'date-fns';

const AuditCases = () => {
  const exportRef = useRef(null);
  const allCases = casesStorage.getAll();
  const allAudits = auditsStorage.getAll();
  // const allUsers = usersStorage.getAll(); // For future use

  const [filterGovernorate, setFilterGovernorate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Cases that need auditing (evaluated but not yet audited or pending supervisor approval)
  const casesForAudit = useMemo(() => {
    let filtered = allCases.filter((c) => 
      c.status === CASE_STATUS.PENDING_APPROVAL || 
      c.status === CASE_STATUS.EVALUATED ||
      c.status === CASE_STATUS.COMPLETED
    );

    if (filterGovernorate) {
      filtered = filtered.filter((c) => c.governorateId === filterGovernorate);
    }

    if (filterStatus) {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    return filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [allCases, filterGovernorate, filterStatus]);

  // KPIs
  const totalPending = allCases.filter((c) => c.status === CASE_STATUS.PENDING_APPROVAL).length;
  const totalAudited = allAudits.length;
  const approvedCases = allAudits.filter((a) => a.finalDecision === AUDIT_DECISIONS.APPROVED).length;
  const rejectedCases = allAudits.filter((a) => a.finalDecision === AUDIT_DECISIONS.REJECTED).length;
  const needsRevision = allAudits.filter((a) => a.finalDecision === AUDIT_DECISIONS.NEEDS_REVISION).length;
  const approvalRate = totalAudited > 0 ? Math.round((approvedCases / totalAudited) * 100) : 0;

  // Audit decisions distribution
  const decisionData = [
    { name: 'معتمد', value: approvedCases },
    { name: 'مرفوض', value: rejectedCases },
    { name: 'يحتاج تعديل', value: needsRevision },
  ];

  // Cases per governorate
  const governorateData = useMemo(() => {
    const counts = {};
    casesForAudit.forEach((c) => {
      const gov = GOVERNORATES.find((g) => g.id === c.governorateId);
      if (gov) {
        counts[gov.name] = (counts[gov.name] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [casesForAudit]);

  // Get audit status for a case
  const getAuditStatus = (caseId) => {
    const audit = allAudits.find((a) => a.caseId === caseId);
    if (!audit) return { status: 'pending', label: 'بانتظار التدقيق', variant: 'warning' };
    
    switch (audit.finalDecision) {
      case AUDIT_DECISIONS.APPROVED:
        return { status: 'approved', label: 'معتمد', variant: 'success' };
      case AUDIT_DECISIONS.REJECTED:
        return { status: 'rejected', label: 'مرفوض', variant: 'danger' };
      case AUDIT_DECISIONS.NEEDS_REVISION:
        return { status: 'revision', label: 'يحتاج تعديل', variant: 'warning' };
      default:
        return { status: 'pending', label: 'بانتظار التدقيق', variant: 'info' };
    }
  };

  const columns = [
    { header: 'اسم الطالب', accessor: 'studentName' },
    {
      header: 'المحافظة',
      accessor: 'governorateId',
      render: (row) => {
        const gov = GOVERNORATES.find((g) => g.id === row.governorateId);
        return gov?.name || 'غير محدد';
      },
    },
    {
      header: 'تاريخ التشخيص',
      accessor: 'diagnosisDate',
      render: (row) => row.diagnosisDate ? format(new Date(row.diagnosisDate), 'yyyy-MM-dd') : '-',
    },
    {
      header: 'حالة الملف',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === CASE_STATUS.COMPLETED ? 'success' : 'warning'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'حالة التدقيق',
      accessor: 'id',
      render: (row) => {
        const auditStatus = getAuditStatus(row.id);
        return <Badge variant={auditStatus.variant}>{auditStatus.label}</Badge>;
      },
    },
    {
      header: 'إجراء',
      accessor: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          <Link to={`/portal/supervisor/cases/${row.id}/view`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <IoEye size={16} />
              عرض
            </Button>
          </Link>
          <Link to={`/portal/supervisor/cases/${row.id}/audit`}>
            <Button variant="primary" size="sm" className="flex items-center gap-1">
              <IoEye size={16} />
              تدقيق
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" dir="rtl" ref={exportRef}>
      <div>
        <h1 className="text-3xl font-bold text-[#211551] mb-2">لوحة تدقيق جودة أداء أخصائي التشخيص</h1>
        <p className="text-gray-600">مراجعة واعتماد حالات التشخيص المقدمة من الأخصائيين</p>
      </div>
      <div className="flex justify-start md:justify-end">
        <ExportPdfButton
          targetRef={exportRef}
          fileName="لوحة-تدقيق-جودة-أداء-أخصائي-التشخيص.pdf"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="بانتظار التدقيق" value={totalPending} icon={IoTime} color="warning" />
        <KPICard title="إجمالي المدققة" value={totalAudited} icon={IoDocumentText} color="info" />
        <KPICard title="الحالات المعتمدة" value={approvedCases} icon={IoCheckmarkCircle} color="success" />
        <KPICard title="الحالات المرفوضة" value={rejectedCases} icon={IoCloseCircle} color="danger" />
        <KPICard title="نسبة الاعتماد" value={`${approvalRate}%`} icon={IoCheckmarkCircle} color="success" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="توزيع قرارات التدقيق">
          <DonutChart data={decisionData} height={280} />
        </Card>

        <Card title="الحالات حسب المحافظة">
          <BarChart
            data={governorateData}
            dataKey="value"
            nameKey="name"
            barColor={CHART_COLORS.blue}
            height={280}
            horizontal={true}
          />
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="w-full md:w-48">
            <Select
              label="المحافظة"
              value={filterGovernorate}
              onChange={(e) => setFilterGovernorate(e.target.value)}
              options={[
                { value: '', label: 'جميع المحافظات' },
                ...GOVERNORATES.map((g) => ({ value: g.id, label: g.name })),
              ]}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              label="حالة الملف"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: '', label: 'جميع الحالات' },
                { value: CASE_STATUS.PENDING_APPROVAL, label: 'بانتظار الاعتماد' },
                { value: CASE_STATUS.EVALUATED, label: 'تم التقييم' },
                { value: CASE_STATUS.COMPLETED, label: 'مكتمل' },
              ]}
            />
          </div>
        </div>

        {/* Cases Table */}
        <Table columns={columns} data={casesForAudit} />
        <div className="mt-4 text-sm text-gray-600">
          إجمالي الحالات: {casesForAudit.length}
        </div>
      </Card>
    </div>
  );
};

export default AuditCases;
