import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { activitiesStorage } from '../../data/storage';
import { GOVERNORATES } from '../../data/constants';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { IoArrowBack } from 'react-icons/io5';

const ActivityView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSupervisor } = useAuth();
  const activity = useMemo(() => activitiesStorage.getAll().find((a) => a.id === id) || null, [id]);

  const basePath = isSupervisor() ? '/portal/supervisor' : '/portal/specialist';

  if (!activity) {
    return (
      <div className="text-center py-12" dir="rtl">
        <p className="text-gray-600">النشاط غير موجود</p>
        <Link to={`${basePath}/activities`}>
          <Button variant="primary" className="mt-4">العودة إلى الأنشطة</Button>
        </Link>
      </div>
    );
  }

  // Specialist can only view their governorate activities
  if (!isSupervisor() && activity.governorateId !== user?.governorateId) {
    return (
      <div className="text-center py-12" dir="rtl">
        <p className="text-gray-600">غير مسموح بعرض هذا النشاط</p>
        <Link to={`${basePath}/activities`}>
          <Button variant="primary" className="mt-4">العودة إلى الأنشطة</Button>
        </Link>
      </div>
    );
  }

  const govName = GOVERNORATES.find((g) => g.id === activity.governorateId)?.name || 'غير محدد';

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="cursor-pointer">
          <IoArrowBack size={24} className="text-[#211551]" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">عرض النشاط (قراءة فقط)</h1>
          <p className="text-gray-600">تفاصيل النشاط كما تم تسجيلها</p>
        </div>
      </div>

      <Card title="معلومات النشاط">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">العنوان</p>
            <p className="font-medium">{activity.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">المحافظة</p>
            <p className="font-medium">{govName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ النشاط</p>
            <p className="font-medium">{activity.activityDate || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الجهة/الدور المنشئ</p>
            <Badge variant="info">{activity.role || '—'}</Badge>
          </div>
        </div>
      </Card>

      <Card title="وصف النشاط">
        <p className="text-gray-700 whitespace-pre-line">{activity.description || '—'}</p>
      </Card>
    </div>
  );
};

export default ActivityView;

