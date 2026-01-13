import { useParams, Link, useNavigate } from 'react-router-dom';
import { casesStorage, evaluationsStorage } from '../../../data/storage';
import { GOVERNORATES } from '../../../data/constants';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { IoArrowBack } from 'react-icons/io5';

const QASection = ({ title, items = [] }) => {
  return (
    <Card title={title}>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.key} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
            <p className="text-sm text-gray-700 font-medium mb-1">{it.label}</p>
            <p className="text-sm text-gray-600">
              {it.value ? <span className="font-semibold text-[#211551]">{it.value}</span> : <span className="text-gray-400">غير مُدخل</span>}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

const SupervisorCaseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseItem = casesStorage.findById(id);
  const evaluation = evaluationsStorage.findByCaseId(id);

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

  const learningItems = [
    { key: 'reading1', label: '4. هل تجد صعوبة في قراءة بعض الكلمات؟', value: evaluation?.learningDifficultiesAnswers?.reading1 },
    { key: 'reading2', label: '5. هل تشعر أن القراءة تحتاج وقت طويل بالنسبة لك؟', value: evaluation?.learningDifficultiesAnswers?.reading2 },
    { key: 'writing1', label: '6. هل تجد صعوبة في كتابة الكلمات بشكل صحيح؟', value: evaluation?.learningDifficultiesAnswers?.writing1 },
    { key: 'writing2', label: '7. هل تجد صعوبة في كتابة أفكارك على الورق؟', value: evaluation?.learningDifficultiesAnswers?.writing2 },
    { key: 'attention1', label: '8. هل تجد صعوبة في التركيز أثناء الدرس؟', value: evaluation?.learningDifficultiesAnswers?.attention1 },
    { key: 'attention2', label: '9. هل تنسى التعليمات بسرعة؟', value: evaluation?.learningDifficultiesAnswers?.attention2 },
    { key: 'attention3', label: '10. هل تجد صعوبة في فهم ما يقوله المعلم؟', value: evaluation?.learningDifficultiesAnswers?.attention3 },
  ];

  const sensoryItems = [
    { key: 'texture', label: '11. هل تجد صعوبة في التعامل مع الملمس الناعم للملابس؟', value: evaluation?.sensoryProcessingAnswers?.texture },
    { key: 'sounds', label: '12. هل تزعجك الأصوات العالية أو المفاجئة؟', value: evaluation?.sensoryProcessingAnswers?.sounds },
    { key: 'lights', label: '13. هل تشتت انتباهك الأضواء الساطعة أو المتلألئة بسهولة؟', value: evaluation?.sensoryProcessingAnswers?.lights },
    { key: 'movement', label: '14. هل تشعر بالدوار أو عدم الاستقرار عند القيام بحركات معينة؟', value: evaluation?.sensoryProcessingAnswers?.movement },
    { key: 'activities', label: '15. هل تتجنب الأنشطة التي تتضمن الحركة أو القفزة؟', value: evaluation?.sensoryProcessingAnswers?.activities },
    { key: 'smells', label: '16. هل تجد صعوبة في التمييز بين الروائح المختلفة أو تفضل أنواعاً معينة من الأطعمة؟', value: evaluation?.sensoryProcessingAnswers?.smells },
  ];

  const adaptiveItems = [
    { key: 'phone', label: '17. هل تستطيع استخدام الهاتف للتواصل مع الآخرين؟', value: evaluation?.adaptiveBehaviorAnswers?.phone },
    { key: 'selfCare', label: '18. هل تستطيع ارتداء ملابسك وغسل يديك بشكل مستقل؟', value: evaluation?.adaptiveBehaviorAnswers?.selfCare },
    { key: 'social', label: '19. هل تستطيع التفاعل مع الأطفال الآخرين في الملعب؟', value: evaluation?.adaptiveBehaviorAnswers?.social },
    { key: 'imitation', label: '20. هل تستطيع تقليد الأصوات أو الحركات؟', value: evaluation?.adaptiveBehaviorAnswers?.imitation },
  ];

  const autismItems = [
    { key: 'eyeContact', label: '21. هل تتجنب النظر إلى المتحدث حتى وعند نطق اسمك؟', value: evaluation?.autismScaleAnswers?.eyeContact },
    { key: 'isolation', label: '22. هل تحب الجلوس لوحدك كثيراً؟', value: evaluation?.autismScaleAnswers?.isolation },
    { key: 'observation', label: '23. هل تتأمل كثيراً في الأشياء الموجودة حولك وتلتف كثيراً؟', value: evaluation?.autismScaleAnswers?.observation },
  ];

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

      {!evaluation ? (
        <Card title="نموذج التقييم التشخيصي">
          <p className="text-gray-600">لا يوجد تقييم مسجل لهذه الحالة بعد.</p>
        </Card>
      ) : (
        <>
          <Card title="بيانات نموذج التقييم">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">اسم الأخصائي</p>
                <p className="font-medium">{evaluation.evaluatorName || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">تاريخ التقييم</p>
                <p className="font-medium">{evaluation.evaluationDate || '—'}</p>
              </div>
            </div>
          </Card>

          <QASection title="مقياس صعوبات التعلم" items={learningItems} />
          <QASection title="مقياس المعالجة الحسية" items={sensoryItems} />
          <QASection title="مقياس فاينلاند للسلوك التكيفي" items={adaptiveItems} />
          <QASection title="مقياس تقييم التوحد" items={autismItems} />

          <Card title="استمارات التشخيص (القرار النهائي)">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">24. التشخيص النهائي</p>
                <p className="font-medium whitespace-pre-line">{evaluation.finalDiagnosis || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">25. هل يحتاج الطالب خطة تدخل؟</p>
                <p className="font-medium">{evaluation.needsIndividualSessions || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">26. ملاحظات التشخيص</p>
                <p className="font-medium whitespace-pre-line">{evaluation.diagnosisNotes || '—'}</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default SupervisorCaseView;

