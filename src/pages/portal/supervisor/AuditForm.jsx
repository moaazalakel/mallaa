import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { casesStorage, auditsStorage, usersStorage, notificationsStorage } from '../../../data/storage';
import { AUDIT_DECISIONS } from '../../../data/constants';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { IoArrowBack } from 'react-icons/io5';

const AuditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseItem = casesStorage.findById(id);
  const existingAudit = auditsStorage.findByCaseId(id);
  // const evaluation = evaluationsStorage.findByCaseId(id); // For future use
  const specialist = caseItem ? usersStorage.findById(caseItem.governorateId) : null;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    documentCompletenessScore: existingAudit?.documentCompletenessScore || 85,
    diagnosticQualityScore: existingAudit?.diagnosticQualityScore || 80,
    complianceScore: existingAudit?.complianceScore || 90,
    supervisorNotes: existingAudit?.supervisorNotes || '',
    finalDecision: existingAudit?.finalDecision || '',
    departmentHeadEvaluation: existingAudit?.departmentHeadEvaluation || '',
    departmentHeadNotes: existingAudit?.departmentHeadNotes || '',
    departmentHeadDecision: existingAudit?.departmentHeadDecision || '',
  });

  useEffect(() => {
    if (!caseItem) return;
    // Pre-fill some data based on case
    if (!existingAudit) {
      setFormData((prev) => ({
        ...prev,
        documentCompletenessScore: caseItem.attachments?.count >= 5 ? 90 : 70,
      }));
    }
  }, [caseItem, existingAudit]);

  if (!caseItem) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">الحالة غير موجودة</p>
        <Link to="/portal/supervisor/dashboard">
          <Button variant="primary" className="mt-4">العودة</Button>
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const auditData = {
      caseId: id,
      specialistId: caseItem.governorateId, // Simplified - should be actual specialist ID
      ...formData,
    };

    if (existingAudit) {
      auditsStorage.update(existingAudit.id, auditData);
    } else {
      auditsStorage.create(auditData);
    }

    // Update case status based on decision
    if (formData.departmentHeadDecision === AUDIT_DECISIONS.APPROVED) {
      casesStorage.update(id, { status: 'مكتمل' });
    } else if (formData.departmentHeadDecision === AUDIT_DECISIONS.NEEDS_REVISION) {
      casesStorage.update(id, { status: 'قيد التقييم' });
    }

    // Create notification
    notificationsStorage.create({
      message: `تم إكمال تدقيق حالة: ${caseItem.studentName}`,
      type: 'audit_completed',
      caseId: id,
      userId: specialist?.id,
    });

    setLoading(false);
    navigate('/portal/supervisor/dashboard');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <Link to="/portal/supervisor/dashboard">
          <IoArrowBack size={24} className="text-[#211551]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">لوحة تدقيق جودة أداء أخصائي التشخيص</h1>
          <p className="text-gray-600">
            مراجعة الإجراءات والوثائق للحالة: {caseItem.studentName}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            رقم الحالة: {caseItem.id} | تاريخ التشخيص: {caseItem.diagnosisDate}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Document Completeness */}
        <Card title="1. اكتمال وتوفر المستندات المطلوبة">
          <p className="text-sm text-gray-600 mb-4">
            التأكد من رفع الأخصائي جميع المستندات اللازمة لدراسة الحالة.
          </p>
          <div className="space-y-3">
            {[
              'تقرير التشخيص المكتمل',
              'التقرير الطبي الحديث (إن وجد)',
              'إقرار ولي الأمر (الموافقة على التشخيص)',
              'التقرير الأكاديمي (أداء الطالب في المدرسة)',
              'تقرير المدرسة/الإحالة الأولي',
            ].map((doc, index) => (
              <label key={index} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked={index < 3} />
                <span>{doc}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Section 2: Case Study */}
        <Card title="2. دراسة معطيات وسياق الحالة">
          <p className="text-sm text-gray-600 mb-4">
            التأكد من دراسة الأخصائي لسجل الطالب وسياقه التعليمي والصحي.
          </p>
          <div className="space-y-4">
            <Select
              label="هل تم دراسة جميع معطيات الطالب من قبل المدرسة؟"
              value="yes"
              options={[
                { value: 'yes', label: 'نعم تم الدراسة بالكامل' },
                { value: 'partial', label: 'جزئياً' },
                { value: 'no', label: 'لا' },
              ]}
            />
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span>تم التحقق من تقاريره الطبية الحديثة (خلال آخر 6 أشهر)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>تم أخذ تاريخ الحالة (History Taking) بشكل مفصل</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Section 3: Diagnostic Quality */}
        <Card title="3. جودة التشخيص ودقة التطبيق">
          <p className="text-sm text-gray-600 mb-4">
            تقييم مدى دقة الإجراءات الفنية المتبعة من قبل الأخصائي.
          </p>
          <div className="space-y-4">
            <Select
              label="درجة التقييم الفني:"
              value={formData.diagnosticQualityScore >= 90 ? 'excellent' : formData.diagnosticQualityScore >= 80 ? 'good' : 'acceptable'}
              onChange={(e) => {
                const scoreMap = { excellent: 95, good: 85, acceptable: 75 };
                handleChange('diagnosticQualityScore', scoreMap[e.target.value] || 85);
              }}
              options={[
                { value: 'excellent', label: 'ممتاز' },
                { value: 'good', label: 'دقة جيدة' },
                { value: 'acceptable', label: 'مقبول يحتاج تحسين' },
              ]}
            />
            <Select
              label="درجة دقة النتائج:"
              value={formData.complianceScore >= 90 ? 'good' : 'acceptable'}
              onChange={(e) => {
                const scoreMap = { good: 92, acceptable: 82 };
                handleChange('complianceScore', scoreMap[e.target.value] || 90);
              }}
              options={[
                { value: 'good', label: 'دقة جيدة' },
                { value: 'acceptable', label: 'مقبول يحتاج تحسين' },
              ]}
            />
          </div>
        </Card>

        {/* Section 4: Central Reviewer Feedback */}
        <Card title="4. تعليق وتغذية راجعة من المراجع (القسم المركزي)">
          <p className="text-sm text-gray-600 mb-4">
            هذا التعليق يظهر للأخصائي المسؤول لتصحيح الإجراءات أو لتوثيق الجودة.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">أدخل تعليقك هنا.</label>
              <textarea
                value={formData.supervisorNotes}
                onChange={(e) => handleChange('supervisorNotes', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none"
                placeholder="أدخل تعليقك هنا..."
              />
            </div>
            <Select
              label="قرار المراجع المركزي:"
              value={formData.finalDecision}
              onChange={(e) => handleChange('finalDecision', e.target.value)}
              showEmpty
              placeholder="اختر القرار..."
              options={[
                { value: AUDIT_DECISIONS.APPROVED, label: 'معتمد' },
                { value: AUDIT_DECISIONS.NEEDS_REVISION, label: 'يحتاج تعديل' },
                { value: AUDIT_DECISIONS.REJECTED, label: 'مرفوض' },
              ]}
            />
          </div>
        </Card>

        {/* Section 5: Department Head Evaluation */}
        <Card title="5. تقييم واعتماد رئيس القسم بالمحافظة">
          <p className="text-sm text-gray-600 mb-4">
            يقوم رئيس القسم بوضع تقييمه لعمل الأخصائي ومراجعة قرار المراجع المركزي.
          </p>
          <div className="space-y-4">
            <Select
              label="التقييم الكلي لأداء الأخصائي في هذه الحالة (من 5):"
              value={formData.departmentHeadEvaluation}
              onChange={(e) => handleChange('departmentHeadEvaluation', e.target.value)}
              showEmpty
              placeholder="اختر التقييم..."
              options={[
                { value: '5', label: '5 - ممتاز' },
                { value: '4', label: '4 - جيد جداً' },
                { value: '3', label: '3 - جيد' },
                { value: '2', label: '2 - مقبول' },
                { value: '1', label: '1 - ضعيف' },
              ]}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تعليق وتوجيهات رئيس القسم:
              </label>
              <textarea
                value={formData.departmentHeadNotes}
                onChange={(e) => handleChange('departmentHeadNotes', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none"
                placeholder="أدخل توجيهاتك..."
              />
            </div>
            <Select
              label="قرار الاعتماد النهائي:"
              value={formData.departmentHeadDecision}
              onChange={(e) => handleChange('departmentHeadDecision', e.target.value)}
              showEmpty
              placeholder="اختر القرار..."
              options={[
                { value: AUDIT_DECISIONS.APPROVED, label: 'اعتماد نهائي للحالة' },
                { value: AUDIT_DECISIONS.NEEDS_REVISION, label: 'يحتاج تعديل' },
                { value: AUDIT_DECISIONS.REJECTED, label: 'رفض' },
              ]}
            />
          </div>
        </Card>

        <div className="flex gap-4 justify-end">
          <Link to="/portal/supervisor/dashboard">
            <Button type="button" variant="outline">إلغاء</Button>
          </Link>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'جاري الحفظ...' : 'حفظ وإرسال قرار التدقيق'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuditForm;
