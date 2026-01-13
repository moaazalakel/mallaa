import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { activitiesStorage } from '../../data/storage';
import { GOVERNORATES } from '../../data/constants';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import DatePicker from '../../components/ui/DatePicker';
import { IoAdd, IoCreateOutline, IoEye } from 'react-icons/io5';
import { format } from 'date-fns';

const ActivitiesList = () => {
  const { user, isSupervisor } = useAuth();
  const allActivities = activitiesStorage.getAll();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGovernorate, setFilterGovernorate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const basePath = isSupervisor() ? '/portal/supervisor' : '/portal/specialist';

  const activities = useMemo(() => {
    let filtered = isSupervisor()
      ? allActivities
      : allActivities.filter((a) => a.governorateId === user?.governorateId);

    if (isSupervisor() && filterGovernorate) {
      filtered = filtered.filter((a) => a.governorateId === filterGovernorate);
    }

    if (fromDate) {
      filtered = filtered.filter((a) => (a.activityDate || '') >= fromDate);
    }
    if (toDate) {
      filtered = filtered.filter((a) => (a.activityDate || '') <= toDate);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [allActivities, user?.governorateId, isSupervisor, searchTerm, filterGovernorate, fromDate, toDate]);

  const columns = [
    {
      header: 'العنوان',
      accessor: 'title',
    },
    {
      header: 'المنطقة',
      accessor: 'governorateId',
      render: (row) => {
        const gov = GOVERNORATES.find((g) => g.id === row.governorateId);
        return gov?.name || 'غير محدد';
      },
    },
    {
      header: 'تاريخ النشاط',
      accessor: 'activityDate',
      render: (row) => format(new Date(row.activityDate), 'yyyy-MM-dd'),
    },
    {
      header: 'الوصف',
      accessor: 'description',
      noWrap: false,
      cellClassName: 'max-w-lg',
      render: (row) => (
        <div
          className="max-w-lg text-gray-800"
          title={row.description}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {row.description}
        </div>
      ),
    },
    {
      header: 'إجراء',
      accessor: 'actions',
      cellClassName: 'min-w-[180px]',
      render: (row) => (
        <div className="flex gap-2">
          <Link to={`${basePath}/activities/${row.id}/view`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <IoEye size={16} />
              عرض
            </Button>
          </Link>
          <Link to={`${basePath}/activities/${row.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <IoCreateOutline size={16} />
              تعديل
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">الأنشطة</h1>
          <p className="text-gray-600">إدارة ومتابعة الأنشطة</p>
        </div>
        <Link to={`${basePath}/activities/new`}>
          <Button variant="primary" className="flex items-center gap-2">
            <IoAdd size={20} />
            إضافة نشاط
          </Button>
        </Link>
      </div>

      <Card>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2" dir="rtl">بحث</label>
            <input
              type="text"
              placeholder="بحث في الأنشطة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[44px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none"
              dir="rtl"
            />
          </div>

          {isSupervisor() ? (
            <Select
              label="المحافظة"
              value={filterGovernorate}
              onChange={(e) => setFilterGovernorate(e.target.value)}
              className="h-[44px]"
              options={[
                { value: '', label: 'جميع المحافظات' },
                ...GOVERNORATES.map((g) => ({ value: g.id, label: g.name })),
              ]}
            />
          ) : (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2" dir="rtl">المحافظة</label>
              <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 flex items-center min-h-[44px]">
                {GOVERNORATES.find((g) => g.id === user?.governorateId)?.name || '—'}
              </div>
            </div>
          )}

          <DatePicker
            label="من تاريخ"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-[44px]"
          />
          <DatePicker
            label="إلى تاريخ"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-[44px]"
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2" dir="rtl">إجراء</label>
            <Button
              type="button"
              variant="outline"
              className="w-full h-[44px] !border-gray-300 !text-gray-700 hover:!bg-[#211551] hover:!text-white hover:!border-[#211551]"
              onClick={() => {
                setSearchTerm('');
                setFilterGovernorate('');
                setFromDate('');
                setToDate('');
              }}
            >
              مسح الفلاتر
            </Button>
          </div>
        </div>

        <Table columns={columns} data={activities} />
        <div className="mt-4 text-sm text-gray-600">
          إجمالي الأنشطة: {activities.length}
        </div>
      </Card>
    </div>
  );
};

export default ActivitiesList;
