import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { activitiesStorage } from '../../data/storage';
import { GOVERNORATES } from '../../data/constants';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DatePicker from '../../components/ui/DatePicker';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { IoArrowBack } from 'react-icons/io5';

const NewActivity = () => {
  const { user, isSupervisor } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const existingActivity = useMemo(() => {
    if (!isEdit) return null;
    return activitiesStorage.getAll().find((a) => a.id === id) || null;
  }, [id, isEdit]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activityDate: new Date().toISOString().split('T')[0],
    governorateId: isSupervisor() ? '' : user?.governorateId || '',
  });

  useEffect(() => {
    if (!isEdit) return;
    if (!existingActivity) return;

    // Simple permission guard: specialist can only edit their governorate activities
    if (!isSupervisor() && existingActivity.governorateId !== user?.governorateId) return;

    setFormData({
      title: existingActivity.title || '',
      description: existingActivity.description || '',
      activityDate: existingActivity.activityDate || new Date().toISOString().split('T')[0],
      governorateId: existingActivity.governorateId || (isSupervisor() ? '' : user?.governorateId || ''),
    });
  }, [existingActivity, isEdit, isSupervisor, user?.governorateId]);

  if (isEdit && !existingActivity) {
    return (
      <div className="text-center py-12" dir="rtl">
        <p className="text-gray-600">النشاط غير موجود</p>
        <Link to={`${isSupervisor() ? '/portal/supervisor' : '/portal/specialist'}/activities`}>
          <Button variant="primary" className="mt-4">العودة إلى الأنشطة</Button>
        </Link>
      </div>
    );
  }

  if (isEdit && existingActivity && !isSupervisor() && existingActivity.governorateId !== user?.governorateId) {
    return (
      <div className="text-center py-12" dir="rtl">
        <p className="text-gray-600">غير مسموح بتعديل هذا النشاط</p>
        <Link to="/portal/specialist/activities">
          <Button variant="primary" className="mt-4">العودة إلى الأنشطة</Button>
        </Link>
      </div>
    );
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'العنوان مطلوب';
    if (!formData.description.trim()) newErrors.description = 'الوصف مطلوب';
    if (!formData.activityDate) newErrors.activityDate = 'تاريخ النشاط مطلوب';
    if (isSupervisor() && !formData.governorateId) {
      newErrors.governorateId = 'المنطقة مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    if (isEdit && existingActivity) {
      activitiesStorage.update(existingActivity.id, {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      activitiesStorage.create({
        ...formData,
        createdByUserId: user?.id,
        role: user?.role,
        updatedAt: new Date().toISOString(),
      });
    }

    setLoading(false);
    const basePath = isSupervisor() ? '/portal/supervisor' : '/portal/specialist';
    navigate(`${basePath}/activities`);
  };

  const basePath = isSupervisor() ? '/portal/supervisor' : '/portal/specialist';

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <Link to={`${basePath}/activities`}>
          <IoArrowBack size={24} className="text-[#211551]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">{isEdit ? 'تعديل نشاط' : 'إضافة نشاط'}</h1>
          <p className="text-gray-600">{isEdit ? 'تعديل بيانات نشاط موجود' : 'تسجيل نشاط جديد في النظام'}</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSupervisor() && (
            <Select
              label="المنطقة *"
              value={formData.governorateId}
              onChange={(e) => handleChange('governorateId', e.target.value)}
              error={errors.governorateId}
              options={GOVERNORATES.map((g) => ({ value: g.id, label: g.name }))}
            />
          )}

          <Input
            label="عنوان النشاط *"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            placeholder="أدخل عنوان النشاط"
          />

          <DatePicker
            label="تاريخ النشاط *"
            value={formData.activityDate}
            onChange={(e) => handleChange('activityDate', e.target.value)}
            error={errors.activityDate}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الوصف *</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="أدخل وصف النشاط..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="flex gap-4 justify-end">
            <Link to={`${basePath}/activities`}>
              <Button type="button" variant="outline">إلغاء</Button>
            </Link>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديل' : 'حفظ النشاط'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewActivity;
