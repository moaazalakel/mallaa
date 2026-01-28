import { useParams, Link, useNavigate } from 'react-router-dom';
import { casesStorage } from '../../../data/storage';
import { GOVERNORATES } from '../../../data/constants';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { IoArrowBack } from 'react-icons/io5';

const SupervisorCaseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseItem = casesStorage.findById(id);

  if (!caseItem) {
    return (
      <div className="text-center py-12" dir="rtl">
        <p className="text-gray-600">الحالة غير موجودة</p>
        <Link to="/portal/supervisor/audit">
          <Button variant="primary" className="mt-4">العودة إلى قائمة التدقيق</Button>
        </Link>
      </div>
    );
  }

  const governorate = GOVERNORATES.find((g) => g.id === caseItem.governorateId);
  const attachmentsCount = Number(caseItem?.attachments?.count ?? 0);
  const attachmentsRequired = Number(caseItem?.attachments?.required ?? 0);
  const attachmentsPct =
    attachmentsRequired > 0 ? Math.round((attachmentsCount / attachmentsRequired) * 100) : 0;

  // تم حذف نموذج تقييم الأخصائي بالكامل (لا يوجد عرض لمقاييس/نموذج تقييم هنا)

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="cursor-pointer">
          <IoArrowBack size={24} className="text-[#211551]" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">عرض تفاصيل الحالة (قراءة فقط)</h1>
          <p className="text-gray-600">عرض جميع البيانات المُدخلة من الأخصائي دون تعديل</p>
        </div>
      </div>

      <Card title="بيانات الحالة الأساسية">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">اسم الطالب</p>
            <p className="font-medium">{caseItem.studentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">المحافظة</p>
            <p className="font-medium">{governorate?.name || 'غير محدد'}</p>
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
            <p className="text-sm text-gray-600 mb-1">المدرسة</p>
            <p className="font-medium">{caseItem.school}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الرقم المدني</p>
            <p className="font-medium">{caseItem.civilNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">رقم المراسلة</p>
            <p className="font-medium">{caseItem.correspondenceNumber || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">حالة الملف</p>
            <Badge variant={caseItem.status === 'مكتمل' ? 'success' : 'warning'}>{caseItem.status}</Badge>
          </div>
        </div>
      </Card>

      <Card title="بيانات التشخيص">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ التشخيص</p>
            <p className="font-medium">{caseItem.diagnosisDate || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">جهة الإحالة</p>
            <p className="font-medium">{caseItem.referralSource || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">نوع المدرسة</p>
            <p className="font-medium">{caseItem.schoolType || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">نوع الإعاقة (المسجل)</p>
            <p className="font-medium">{caseItem.disabilityType || '—'}</p>
          </div>
        </div>
      </Card>

      <Card title="وصف الحالة (من نموذج تسجيل الحالة)">
        <p className="text-gray-700 whitespace-pre-line">{caseItem.caseDescription || '—'}</p>
      </Card>

      <Card title="التوصيات (من نموذج تسجيل الحالة)">
        <p className="text-gray-700 whitespace-pre-line">{caseItem.recommendations || '—'}</p>
      </Card>

      <Card title="المرفقات (نظام تجريبي)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
            <p className="text-sm text-gray-600 mb-1">عدد المرفقات المرفوعة</p>
            <p className="text-2xl font-bold text-[#211551]">{attachmentsCount}</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
            <p className="text-sm text-gray-600 mb-1">عدد المرفقات المطلوبة</p>
            <p className="text-2xl font-bold text-[#211551]">{attachmentsRequired || '—'}</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
            <p className="text-sm text-gray-600 mb-2">نسبة اكتمال المرفقات</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${Math.max(0, Math.min(100, attachmentsPct))}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-[#211551]">
                {attachmentsRequired > 0 ? `${attachmentsPct}%` : '—'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ملاحظة: رفع الملفات غير مدعوم في النسخة التجريبية.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SupervisorCaseView;

