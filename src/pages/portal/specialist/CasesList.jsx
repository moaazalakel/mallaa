import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { casesStorage } from '../../../data/storage';
import { CASE_STATUS } from '../../../data/constants';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import { IoAdd, IoSearch } from 'react-icons/io5';

const CasesList = () => {
  const { user } = useAuth();
  const allCases = casesStorage.getAll();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter cases for this specialist's governorate
  const cases = useMemo(() => {
    let filtered = allCases.filter((c) => c.governorateId === user?.governorateId);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.civilNumber.includes(searchTerm) ||
          c.school.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [allCases, user?.governorateId, searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
    const variants = {
      [CASE_STATUS.COMPLETED]: 'success',
      [CASE_STATUS.INCOMPLETE]: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const columns = [
    {
      header: 'اسم الطالب',
      accessor: 'studentName',
    },
    {
      header: 'العمر',
      accessor: 'age',
      render: (row) => `${row.age} سنة`,
    },
    {
      header: 'المدرسة',
      accessor: 'school',
    },
    {
      header: 'نوع الإعاقة',
      accessor: 'disabilityType',
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'الإجراءات',
      accessor: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          <Link to={`/portal/specialist/cases/${row.id}/edit`}>
            <Button size="sm" variant="outline">تعديل</Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">قائمة الحالات</h1>
          <p className="text-gray-600">إدارة ومتابعة حالات الطلاب</p>
        </div>
        <Link to="/portal/specialist/cases/new">
          <Button variant="primary" className="flex items-center gap-2">
            <IoAdd size={20} />
            تسجيل حالة جديدة
          </Button>
        </Link>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="بحث بالاسم، الرقم المدني، أو المدرسة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-2"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none"
          >
            <option value="all">جميع الحالات</option>
            <option value={CASE_STATUS.COMPLETED}>مكتمل</option>
            <option value={CASE_STATUS.INCOMPLETE}>ناقص</option>
          </select>
        </div>

        <Table columns={columns} data={cases} />
        <div className="mt-4 text-sm text-gray-600">
          إجمالي الحالات: {cases.length}
        </div>
      </Card>
    </div>
  );
};

export default CasesList;
