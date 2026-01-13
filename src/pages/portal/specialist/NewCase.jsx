import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { casesStorage, notificationsStorage } from '../../../data/storage';
import { GOVERNORATES, GENDER, REFERRAL_SOURCES } from '../../../data/constants';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import DatePicker from '../../../components/ui/DatePicker';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { IoArrowBack } from 'react-icons/io5';

const NewCase = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    studentName: '',
    gender: '',
    birthDate: '',
    governorateId: user?.governorateId || '',
    diagnosisDate: '',
    civilNumber: '',
    correspondenceNumber: '',
    school: '',
    caseDescription: '',
    referralSource: '',
    recommendations: '',
  });

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.studentName.trim()) newErrors.studentName = 'اسم الطالب مطلوب';
    if (!formData.gender) newErrors.gender = 'الجنس مطلوب';
    if (!formData.birthDate) newErrors.birthDate = 'تاريخ الميلاد مطلوب';
    if (!formData.governorateId) newErrors.governorateId = 'المنطقة مطلوبة';
    if (!formData.diagnosisDate) newErrors.diagnosisDate = 'تاريخ التشخيص مطلوب';
    if (!formData.civilNumber.trim()) newErrors.civilNumber = 'الرقم المدني مطلوب';
    if (!formData.school.trim()) newErrors.school = 'المدرسة مطلوبة';
    if (!formData.caseDescription.trim()) newErrors.caseDescription = 'وصف الحالة مطلوب';
    if (!formData.referralSource.trim()) newErrors.referralSource = 'جهة الإحالة مطلوبة';
    if (!formData.recommendations.trim()) newErrors.recommendations = 'التوصيات مطلوبة';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const age = calculateAge(formData.birthDate);
    const newCase = casesStorage.create({
      ...formData,
      age,
      status: 'قيد التقييم',
      disabilityType: 'غير مصنف', // Will be updated after evaluation
      schoolType: 'مدارس حكومية', // Default
      attachments: { count: 0, required: 7 },
    });

    // Create notification for supervisor
    notificationsStorage.create({
      message: `تم تسجيل حالة جديدة: ${formData.studentName} في ${GOVERNORATES.find((g) => g.id === formData.governorateId)?.name}`,
      type: 'new_case',
      caseId: newCase.id,
      userId: 'user_supervisor', // Supervisor user ID
    });

    setLoading(false);
    navigate('/portal/specialist/cases');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="cursor-pointer">
          <IoArrowBack size={24} className="text-[#211551]" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">تسجيل حالة جديدة</h1>
          <p className="text-gray-600">نموذج تسجيل حالة طالب جديدة في منظومة ملاءة</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="اسم الطالب *"
              value={formData.studentName}
              onChange={(e) => handleChange('studentName', e.target.value)}
              error={errors.studentName}
              placeholder="أدخل اسم الطالب"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الجنس *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value={GENDER.MALE}
                    checked={formData.gender === GENDER.MALE}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  />
                  ذكر
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value={GENDER.FEMALE}
                    checked={formData.gender === GENDER.FEMALE}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  />
                  أنثى
                </label>
              </div>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
            </div>

            <DatePicker
              label="تاريخ الميلاد *"
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              error={errors.birthDate}
            />

            <Select
              label="المنطقة *"
              value={formData.governorateId}
              onChange={(e) => handleChange('governorateId', e.target.value)}
              error={errors.governorateId}
              options={GOVERNORATES.map((g) => ({ value: g.id, label: g.name }))}
            />

            <DatePicker
              label="تاريخ التشخيص *"
              value={formData.diagnosisDate}
              onChange={(e) => handleChange('diagnosisDate', e.target.value)}
              error={errors.diagnosisDate}
            />

            <Input
              label="الرقم المدني *"
              value={formData.civilNumber}
              onChange={(e) => handleChange('civilNumber', e.target.value)}
              error={errors.civilNumber}
              placeholder="أدخل الرقم المدني"
            />

            <Input
              label="رقم المراسلة"
              value={formData.correspondenceNumber}
              onChange={(e) => handleChange('correspondenceNumber', e.target.value)}
              placeholder="أدخل رقم المراسلة"
            />

            <Input
              label="المدرسة *"
              value={formData.school}
              onChange={(e) => handleChange('school', e.target.value)}
              error={errors.school}
              placeholder="أدخل اسم المدرسة"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة *</label>
            <textarea
              value={formData.caseDescription}
              onChange={(e) => handleChange('caseDescription', e.target.value)}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none ${
                errors.caseDescription ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="أدخل وصف الحالة"
            />
            {errors.caseDescription && <p className="mt-1 text-sm text-red-600">{errors.caseDescription}</p>}
          </div>

          <Input
            label="جهة الإحالة *"
            value={formData.referralSource}
            onChange={(e) => handleChange('referralSource', e.target.value)}
            error={errors.referralSource}
            placeholder="أدخل جهة الإحالة"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">التوصيات *</label>
            <textarea
              value={formData.recommendations}
              onChange={(e) => handleChange('recommendations', e.target.value)}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none ${
                errors.recommendations ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="أدخل التوصيات...."
            />
            {errors.recommendations && <p className="mt-1 text-sm text-red-600">{errors.recommendations}</p>}
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-sm text-gray-600 mb-2">المرفقات</p>
            <p className="text-xs text-gray-500 mb-4">
              (تقرير التشخيص - التقرير الطبي - التقرير الأكاديمي - إقرار ولي الأمر - تقرير المدرسة)
            </p>
            <p className="text-sm text-gray-500">الحد الأقصى: 6 ملفات | حجم الملف: 100MB</p>
            <p className="text-xs text-gray-400 mt-2">(نظام تجريبي - المرفقات غير مدعومة)</p>
          </div>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>إلغاء</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'تسجيل الحالة'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewCase;
