import { useParams, Link, useNavigate } from 'react-router-dom';
import { casesStorage, evaluationsStorage } from '../../../data/storage';
import { GOVERNORATES } from '../../../data/constants';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { IoArrowBack } from 'react-icons/io5';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseItem = casesStorage.findById(id);
  const evaluation = evaluationsStorage.findByCaseId(id);

  if (!caseItem) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">الحالة غير موجودة</p>
        <Link to="/portal/specialist/cases">
          <Button variant="primary" className="mt-4">العودة إلى القائمة</Button>
        </Link>
      </div>
    );
  }

  const governorate = GOVERNORATES.find((g) => g.id === caseItem.governorateId);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="cursor-pointer">
          <IoArrowBack size={24} className="text-[#211551]" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">تفاصيل الحالة</h1>
          <p className="text-gray-600">معلومات الحالة والتقييمات</p>
        </div>
      </div>

      <Card title="معلومات الطالب">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">اسم الطالب</p>
            <p className="font-medium">{caseItem.studentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الجنس</p>
            <p className="font-medium">{caseItem.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ الميلاد</p>
            <p className="font-medium">{caseItem.birthDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">العمر</p>
            <p className="font-medium">{caseItem.age} سنة</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">المنطقة</p>
            <p className="font-medium">{governorate?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">المدرسة</p>
            <p className="font-medium">{caseItem.school}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الرقم المدني</p>
            <p className="font-medium">{caseItem.civilNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الحالة</p>
            <Badge variant={caseItem.status === 'مكتمل' ? 'success' : 'warning'}>
              {caseItem.status}
            </Badge>
          </div>
        </div>
      </Card>

      <Card title="معلومات التشخيص">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ التشخيص</p>
            <p className="font-medium">{caseItem.diagnosisDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">نوع الإعاقة</p>
            <p className="font-medium">{caseItem.disabilityType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">جهة الإحالة</p>
            <p className="font-medium">{caseItem.referralSource}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">نوع المدرسة</p>
            <p className="font-medium">{caseItem.schoolType}</p>
          </div>
        </div>
      </Card>

      <Card title="وصف الحالة">
        <p className="text-gray-700 whitespace-pre-line">{caseItem.caseDescription}</p>
      </Card>

      <Card title="التوصيات">
        <p className="text-gray-700 whitespace-pre-line">{caseItem.recommendations}</p>
      </Card>

      {evaluation && (
        <Card title="نتائج التقييم">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">اسم الأخصائي</p>
              <p className="font-medium">{evaluation.evaluatorName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ التقييم</p>
              <p className="font-medium">{evaluation.evaluationDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">التشخيص النهائي</p>
              <p className="font-medium">{evaluation.finalDiagnosis}</p>
            </div>
            {evaluation.diagnosisNotes && (
              <div>
                <p className="text-sm text-gray-600 mb-1">ملاحظات</p>
                <p className="font-medium">{evaluation.diagnosisNotes}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {caseItem.status === 'قيد التقييم' && (
        <div className="flex justify-end">
          <Link to={`/portal/specialist/cases/${id}/evaluate`}>
            <Button variant="primary">بدء التقييم</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CaseDetails;
