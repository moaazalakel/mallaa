import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { reportsStorage } from '../../../data/storage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import { format } from 'date-fns';

const ReportsList = () => {
  const navigate = useNavigate();

  const readReports = () => {
    const all = reportsStorage.getAll();
    return all
      .filter((r) => r.type === 'periodic_malaa')
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  };

  const [reports, setReports] = useState(() => readReports());

  const columns = [
    {
      header: 'عنوان التقرير',
      accessor: 'title',
      render: (row) => row.title || '—',
      noWrap: false,
      headerClassName: 'w-[44%]',
      cellClassName: 'align-top break-words',
    },
    {
      header: 'الفترة',
      accessor: 'periodLabel',
      render: (row) => row.periodLabel || '—',
      noWrap: false,
      headerClassName: 'w-[20%]',
      cellClassName: 'align-top break-words',
    },
    {
      header: 'آخر تعديل',
      accessor: 'updatedAt',
      render: (row) => (row.updatedAt ? format(new Date(row.updatedAt), 'yyyy-MM-dd') : '—'),
      headerClassName: 'w-[14%]',
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'final' ? 'success' : 'info'}>
          {row.status === 'final' ? 'نهائي' : 'مسودة'}
        </Badge>
      ),
      headerClassName: 'w-[10%]',
    },
    {
      header: 'إجراء',
      accessor: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-rose-700"
            onClick={(e) => {
              e.stopPropagation();
              const ok = window.confirm('هل تريد حذف هذا التقرير؟');
              if (!ok) return;
              reportsStorage.delete(row.id);
              setReports(readReports());
            }}
          >
            حذف
          </Button>
        </div>
      ),
      headerClassName: 'w-[12%]',
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">التقارير الدورية</h1>
          <p className="text-gray-600">إنشاء وإدارة التقارير الدورية وتصديرها</p>
        </div>
        <Link to="/portal/supervisor/reports/periodic/new">
          <Button variant="primary" className="w-full md:w-auto">
            إنشاء تقرير دوري
          </Button>
        </Link>
      </div>

      <Card>
        <div className="max-h-[520px] overflow-auto">
          <Table
            columns={columns}
            data={reports}
            onRowClick={(row) => navigate(`/portal/supervisor/reports/periodic/${row.id}`)}
            fit
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">إجمالي التقارير: {reports.length}</div>
      </Card>
    </div>
  );
};

export default ReportsList;

