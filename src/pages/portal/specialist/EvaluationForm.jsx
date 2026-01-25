import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { casesStorage, evaluationsStorage, notificationsStorage } from '../../../data/storage';
import Input from '../../../components/ui/Input';
import DatePicker from '../../../components/ui/DatePicker';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { IoArrowBack } from 'react-icons/io5';

const EvaluationForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const caseItem = casesStorage.findById(id);

  const existingEvaluation = useMemo(() => {
    return evaluationsStorage.findByCaseId(id);
  }, [id]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    evaluatorName: user?.name || '',
    evaluationDate: new Date().toISOString().split('T')[0],
    learningDifficultiesAnswers: {
      reading1: '',
      reading2: '',
      writing1: '',
      writing2: '',
      attention1: '',
      attention2: '',
      attention3: '',
    },
    sensoryProcessingAnswers: {
      texture: '',
      sounds: '',
      lights: '',
      movement: '',
      activities: '',
      smells: '',
    },
    adaptiveBehaviorAnswers: {
      phone: '',
      selfCare: '',
      social: '',
      imitation: '',
    },
    autismScaleAnswers: {
      eyeContact: '',
      isolation: '',
      observation: '',
    },
    finalDiagnosis: '',
    needsIndividualSessions: '',
    diagnosisNotes: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (existingEvaluation) {
      // Pre-fill form with existing evaluation data
      setFormData({
        evaluatorName: existingEvaluation.evaluatorName || user?.name || '',
        evaluationDate: existingEvaluation.evaluationDate || new Date().toISOString().split('T')[0],
        learningDifficultiesAnswers: existingEvaluation.learningDifficultiesAnswers || {
          reading1: '',
          reading2: '',
          writing1: '',
          writing2: '',
          attention1: '',
          attention2: '',
          attention3: '',
        },
        sensoryProcessingAnswers: existingEvaluation.sensoryProcessingAnswers || {
          texture: '',
          sounds: '',
          lights: '',
          movement: '',
          activities: '',
          smells: '',
        },
        adaptiveBehaviorAnswers: existingEvaluation.adaptiveBehaviorAnswers || {
          phone: '',
          selfCare: '',
          social: '',
          imitation: '',
        },
        autismScaleAnswers: existingEvaluation.autismScaleAnswers || {
          eyeContact: '',
          isolation: '',
          observation: '',
        },
        finalDiagnosis: existingEvaluation.finalDiagnosis || '',
        needsIndividualSessions: existingEvaluation.needsIndividualSessions || '',
        diagnosisNotes: existingEvaluation.diagnosisNotes || '',
      });
    }
  }, [existingEvaluation, user?.name]);

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

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.evaluatorName.trim()) newErrors.evaluatorName = 'اسم الأخصائي مطلوب';
    if (!formData.evaluationDate) newErrors.evaluationDate = 'تاريخ التقييم مطلوب';
    if (!formData.finalDiagnosis.trim()) newErrors.finalDiagnosis = 'التشخيص النهائي مطلوب';
    if (!formData.needsIndividualSessions) newErrors.needsIndividualSessions = 'هذا الحقل مطلوب';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    if (existingEvaluation) {
      // Update existing evaluation
      evaluationsStorage.update(existingEvaluation.id, {
        ...formData,
      });

      // Create notification for supervisor
      notificationsStorage.create({
        message: `تم تحديث تقييم حالة: ${caseItem.studentName} - يحتاج إلى مراجعة`,
        type: 'evaluation_updated',
        caseId: id,
        userId: 'user_supervisor',
      });
    } else {
      // Create new evaluation
      evaluationsStorage.create({
        caseId: id,
        ...formData,
      });

      // Update case status
      casesStorage.update(id, {
        status: 'بانتظار اعتماد المشرف',
        disabilityType: formData.finalDiagnosis.includes('توحد') ? 'اضطراب التوحد' :
                       caseItem.disabilityType,
      });

      // Create notification for supervisor
      notificationsStorage.create({
        message: `تم إكمال تقييم حالة: ${caseItem.studentName} - يحتاج إلى مراجعة`,
        type: 'evaluation_completed',
        caseId: id,
        userId: 'user_supervisor',
      });
    }

    setLoading(false);
    navigate(`/portal/specialist/cases/${id}`);
  };

  const RadioGroup = ({ section, field, label, options }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label} *</label>
      <div className="flex gap-4">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2">
            <input
              type="radio"
              name={`${section}_${field}`}
              value={option}
              checked={formData[section]?.[field] === option}
              onChange={(e) => handleChange(section, field, e.target.value)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="cursor-pointer">
          <IoArrowBack size={24} className="text-[#211551]" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#211551] mb-2">
            {existingEvaluation ? 'تعديل تقييم الأخصائي - المقاييس التشخيصية' : 'نموذج تقييم الأخصائي - المقاييس التشخيصية'}
          </h1>
          <p className="text-gray-600">
            {existingEvaluation ? 'تعديل بيانات التقييم الموجود' : 'هذا النموذج مخصص لتقييم الطلاب باستخدام المقاييس التشخيصية المختلفة'}
          </p>
        </div>
      </div>

      <Card title="قسم بيانات الحالة">
        <p className="text-sm text-gray-600 mb-4">
          هذا الجزء مخصص لعرض المعلومات الأساسية الخاصة بالطالب والتي تم إدخالها مسبقاً بواسطة ولي الأمر
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">اسم الطالب</p>
            <p className="font-medium">{caseItem.studentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">العمر</p>
            <p className="font-medium">{caseItem.age} سنة</p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="قسم المقاييس التشخيصية">
          <p className="text-sm text-gray-600 mb-6">
            هذا الجزء مخصص لإدخال نتائج التقييمات والمقاييس التي يقوم بها الأخصائي مع الطالب
          </p>

          {/* Learning Difficulties Scale */}
          <div className="mb-8">
            <div className="h-1 bg-green-500 mb-4"></div>
            <h3 className="text-xl font-bold text-[#211551] mb-4">مقياس صعوبات التعلم</h3>

            <div className="mb-6">
              <h4 className="font-semibold mb-3">صعوبات القراءة</h4>
              <RadioGroup
                section="learningDifficultiesAnswers"
                field="reading1"
                label="4. هل تجد صعوبة في قراءة بعض الكلمات؟"
                options={['نعم', 'لا']}
              />
              <RadioGroup
                section="learningDifficultiesAnswers"
                field="reading2"
                label="5. هل تشعر أن القراءة تحتاج وقت طويل بالنسبة لك؟"
                options={['نعم', 'لا']}
              />
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-3">صعوبات الكتابة</h4>
              <RadioGroup
                section="learningDifficultiesAnswers"
                field="writing1"
                label="6. هل تجد صعوبة في كتابة الكلمات بشكل صحيح؟"
                options={['نعم', 'لا']}
              />
              <RadioGroup
                section="learningDifficultiesAnswers"
                field="writing2"
                label="7. هل تجد صعوبة في كتابة أفكارك على الورق؟"
                options={['نعم', 'لا']}
              />
            </div>

            <div>
              <h4 className="font-semibold mb-3">الانتباه والتركيز والفهم</h4>
              <RadioGroup
                section="learningDifficultiesAnswers"
                field="attention1"
                label="8. هل تجد صعوبة في التركيز أثناء الدرس؟"
                options={['نعم', 'لا']}
              />
              <RadioGroup
                section="learningDifficultiesAnswers"
                field="attention2"
                label="9. هل تنسى التعليمات بسرعة؟"
                options={['نعم', 'لا']}
              />
              <RadioGroup
                section="learningDifficultiesAnswers"
                field="attention3"
                label="10. هل تجد صعوبة في فهم ما يقوله المعلم؟"
                options={['نعم', 'لا']}
              />
            </div>
          </div>

          {/* Sensory Processing Scale */}
          <div className="mb-8">
            <div className="h-1 bg-green-500 mb-4"></div>
            <h3 className="text-xl font-bold text-[#211551] mb-4">مقياس المعالجة الحسية</h3>
            <RadioGroup
              section="sensoryProcessingAnswers"
              field="texture"
              label="11. هل تجد صعوبة في التعامل مع الملمس الناعم للملابس؟"
              options={['نعم', 'لا']}
            />
            <RadioGroup
              section="sensoryProcessingAnswers"
              field="sounds"
              label="12. هل تزعجك الأصوات العالية أو المفاجئة؟"
              options={['نعم', 'لا']}
            />
            <RadioGroup
              section="sensoryProcessingAnswers"
              field="lights"
              label="13. هل تشتت انتباهك الأضواء الساطعة أو المتلألئة بسهولة؟"
              options={['نعم', 'لا']}
            />
            <RadioGroup
              section="sensoryProcessingAnswers"
              field="movement"
              label="14. هل تشعر بالدوار أو عدم الاستقرار عند القيام بحركات معينة؟"
              options={['نعم', 'لا']}
            />
            <RadioGroup
              section="sensoryProcessingAnswers"
              field="activities"
              label="15. هل تتجنب الأنشطة التي تتضمن الحركة أو القفزة؟"
              options={['نعم', 'لا']}
            />
            <RadioGroup
              section="sensoryProcessingAnswers"
              field="smells"
              label="16. هل تجد صعوبة في التمييز بين الروائح المختلفة أو تفضل أنواعاً معينة من الأطعمة؟"
              options={['نعم', 'لا']}
            />
          </div>

          {/* Vineland Adaptive Behavior Scale */}
          <div className="mb-8">
            <div className="h-1 bg-orange-500 mb-4"></div>
            <h3 className="text-xl font-bold text-[#211551] mb-4">مقياس فاينلاند للسلوك التكيفي</h3>
            <RadioGroup
              section="adaptiveBehaviorAnswers"
              field="phone"
              label="17. هل تستطيع استخدام الهاتف للتواصل مع الآخرين؟"
              options={['نعم', 'لا']}
            />
            <RadioGroup
              section="adaptiveBehaviorAnswers"
              field="selfCare"
              label="18. هل تستطيع ارتداء ملابسك وغسل يديك بشكل مستقل؟"
              options={['نعم', 'لا']}
            />
            <RadioGroup
              section="adaptiveBehaviorAnswers"
              field="social"
              label="19. هل تستطيع التفاعل مع الأطفال الآخرين في الملعب؟"
              options={['نعم', 'لا']}
            />
            <RadioGroup
              section="adaptiveBehaviorAnswers"
              field="imitation"
              label="20. هل تستطيع تقليد الأصوات أو الحركات؟"
              options={['نعم', 'لا']}
            />
          </div>

          {/* Autism Assessment Scale */}
          <div className="mb-8">
            <div className="h-1 bg-red-500 mb-4"></div>
            <h3 className="text-xl font-bold text-[#211551] mb-4">مقياس تقييم التوحد</h3>
            <RadioGroup
              section="autismScaleAnswers"
              field="eyeContact"
              label="21. هل تتجنب النظر إلى المتحدث حتى وعند نطق اسمك؟"
              options={['ولا مرة', 'نادراً', 'أحياناً', 'غالباً', 'دائماً']}
            />
            <RadioGroup
              section="autismScaleAnswers"
              field="isolation"
              label="22. هل تحب الجلوس لوحدك كثيراً؟"
              options={['ولا مرة', 'نادراً', 'أحياناً', 'غالباً', 'دائماً']}
            />
            <RadioGroup
              section="autismScaleAnswers"
              field="observation"
              label="23. هل تتأمل كثيراً في الأشياء الموجودة حولك وتلتف كثيراً؟"
              options={['ولا مرة', 'نادراً', 'أحياناً', 'غالباً', 'دائماً']}
            />
          </div>
        </Card>

        <Card title="استمارات التشخيص">
          <p className="text-sm text-gray-600 mb-6">
            هذا القسم يملئه الأخصائي بعد مراجعة إجابات الطالب على جميع المقاييس
          </p>

          <div className="space-y-6">
            <Input
              label="اسم الأخصائي *"
              value={formData.evaluatorName}
              onChange={(e) => handleChange(null, 'evaluatorName', e.target.value)}
              error={errors.evaluatorName}
            />

            <DatePicker
              label="تاريخ التقييم *"
              value={formData.evaluationDate}
              onChange={(e) => handleChange(null, 'evaluationDate', e.target.value)}
              error={errors.evaluationDate}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                24. ما هو التشخيص النهائي لحالة الطالب بناءً على نتائج المقاييس؟ *
              </label>
              <textarea
                value={formData.finalDiagnosis}
                onChange={(e) => handleChange(null, 'finalDiagnosis', e.target.value)}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none ${
                  errors.finalDiagnosis ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="أدخل التشخيص النهائي..."
              />
              {errors.finalDiagnosis && <p className="mt-1 text-sm text-red-600">{errors.finalDiagnosis}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                25. هل يحتاج الطالب خطة تدخل؟ *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="needsIndividualSessions"
                    value="نعم"
                    checked={formData.needsIndividualSessions === 'نعم'}
                    onChange={(e) => handleChange(null, 'needsIndividualSessions', e.target.value)}
                  />
                  نعم
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="needsIndividualSessions"
                    value="لا"
                    checked={formData.needsIndividualSessions === 'لا'}
                    onChange={(e) => handleChange(null, 'needsIndividualSessions', e.target.value)}
                  />
                  لا
                </label>
              </div>
              {errors.needsIndividualSessions && (
                <p className="mt-1 text-sm text-red-600">{errors.needsIndividualSessions}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">26. ملاحظات التشخيص</label>
              <textarea
                value={formData.diagnosisNotes}
                onChange={(e) => handleChange(null, 'diagnosisNotes', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none"
                placeholder="أدخل أي ملاحظات إضافية."
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>إلغاء</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'جاري الحفظ...' : (existingEvaluation ? 'حفظ التعديلات' : 'إرسال النموذج')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EvaluationForm;
