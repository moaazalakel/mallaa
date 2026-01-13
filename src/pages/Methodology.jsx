import { useEffect } from 'react';
import {
  FaBullseye,
  FaBalanceScale,
  FaChartLine,
  FaClipboardList,
  FaDatabase,
  FaSearch,
  FaFileAlt,
  FaLightbulb,
  FaHandsHelping,
  FaInfinity,
  FaUserCheck,
  FaTools,
  FaShieldAlt,
  FaComments,
  FaGraduationCap,
} from 'react-icons/fa';

const Methodology = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <section dir="rtl" className="text-right">
      {/* Hero Section */}
      <div className="bg-[#211551] text-white py-28 px-6 md:px-20 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">منهجيات القياس</h1>
        <p className="max-w-3xl mx-auto text-lg opacity-90 leading-8">
          حجر الزاوية في تحقيق التميز المؤسسي بمجال التشخيص، عبر أدوات معيارية
          موحدة تعزز الكفاءة والجودة لدعم رؤية عُمان 2040.
        </p>
      </div>

      {/* Intro Section */}
      <div className="bg-gray-50 py-12 px-6 md:px-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <p className="text-lg text-gray-700 leading-8">
            تمثل منهجيات القياس الإطار المهني الذي تعتمد عليه منصة الملاءة في تقويم أداء فرق التشخيص اللامركزية، من خلال محاور معيارية وأدوات قياس موحدة، تضمن موضوعية التقييم ودقة النتائج.
          </p>
          <FaChartLine className="text-[#211551] text-7xl mx-auto" />
        </div>
      </div>

      {/* Goals Section */}
      <div className="py-16 px-6 md:px-20 bg-white">
        <h2 className="text-2xl md:text-3xl font-bold text-[#211551] mb-10 text-center">
          الأهداف
        </h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-lg transition">
            <FaBullseye className="mx-auto text-4xl text-[#211551] mb-4" />
            <h3 className="text-xl font-semibold mb-2">رفع جودة التشخيص</h3>
            <p className="text-gray-600 leading-7">
              تحسين التشخيص التربوي والنفسي للطلبة ذوي الإعاقة عبر معايير دقيقة
              وموحدة.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-lg transition">
            <FaClipboardList className="mx-auto text-4xl text-[#211551] mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              تعزيز كفاءة فرق التشخيص
            </h3>
            <p className="text-gray-600 leading-7">
              متابعة الأداء وتحليل مؤشرات الإنجاز لرفع مستوى فرق العمل.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-lg transition">
            <FaChartLine className="mx-auto text-4xl text-[#211551] mb-4" />
            <h3 className="text-xl font-semibold mb-2">تحقيق التميز المؤسسي</h3>
            <p className="text-gray-600 leading-7">
              توثيق الإجراءات وتحسين جودة الخدمات المتخصصة باستمرار.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-lg transition">
            <FaBalanceScale className="mx-auto text-4xl text-[#211551] mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              ضمان العدالة والشمولية
            </h3>
            <p className="text-gray-600 leading-7">
              توفير فرص متساوية للوصول إلى الخدمات التربوية لجميع الطلبة ذوي
              الإعاقة.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-lg transition">
            <FaFileAlt className="mx-auto text-4xl text-[#211551] mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              تعزيز الشفافية والمساءلة
            </h3>
            <p className="text-gray-600 leading-7">
              تطوير عمليات التشخيص وضمان وضوح القرارات التربوية أمام أصحاب
              المصلحة.
            </p>
          </div>
        </div>
      </div>

      {/* New Value Section */}
      <div className="bg-[#211551] py-16 px-6 md:px-20">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center">
          القيمة المضافة لمنهجيات القياس
        </h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <FaLightbulb className="mx-auto text-4xl text-[#211551] mb-4" />
            <h3 className="text-xl font-semibold mb-2">تحسين الجودة</h3>
            <p className="text-gray-600 leading-7">
              تطوير الخدمات التربوية بشكل مستمر وفق بيانات دقيقة وتحليلات علمية.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <FaHandsHelping className="mx-auto text-4xl text-[#211551] mb-4" />
            <h3 className="text-xl font-semibold mb-2">دعم اتخاذ القرار</h3>
            <p className="text-gray-600 leading-7">
              تزويد صناع القرار بتقارير دقيقة تساعد على وضع خطط تربوية فعّالة.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <FaInfinity className="mx-auto text-4xl text-[#211551] mb-4" />
            <h3 className="text-xl font-semibold mb-2">استدامة التطوير</h3>
            <p className="text-gray-600 leading-7">
              ضمان استمرارية التحسين من خلال آليات متابعة ومراجعة دورية.
            </p>
          </div>
        </div>
      </div>

      {/* Criteria Section */}
      <div className="bg-gray-50 py-16 px-6 md:px-20">
        <h2 className="text-2xl md:text-3xl font-bold text-[#211551] mb-10 text-center">
          محاور ومعايير القياس الرئيسية
        </h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <FaUserCheck className="text-3xl text-[#211551] mt-1 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">
                التحضير والاستعداد المهني
              </h3>
              <p className="text-gray-600 leading-7">
                جاهزية الممارس مهنيًا لتطبيق عمليات التشخيص وفق الضوابط والإجراءات المعتمدة.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <FaTools className="text-3xl text-[#211551] mt-1 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">
                جودة أدوات القياس المستخدمة
              </h3>
              <p className="text-gray-600 leading-7">
                مدى الالتزام باستخدام الأدوات التشخيصية المعتمدة وتطبيقها بطريقة صحيحة وموثوقة.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <FaSearch className="text-3xl text-[#211551] mt-1 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">
                دقة التحليل والتفسير
              </h3>
              <p className="text-gray-600 leading-7">
                القدرة على تحليل نتائج التقييم وربطها بالأدلة ومعايير اتخاذ القرار الموضوعية.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <FaFileAlt className="text-3xl text-[#211551] mt-1 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">
                جودة التوصيات والتقارير
              </h3>
              <p className="text-gray-600 leading-7">
                ملاءمة التوصيات لمسارات الطلبة، وضمان وضوح ودقة التقارير التشخيصية.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <FaShieldAlt className="text-3xl text-[#211551] mt-1 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">
                التوثيق والحوكمة
              </h3>
              <p className="text-gray-600 leading-7">
                توثيق الإجراءات، وضمان الامتثال للمعايير والسياسات المعتمدة.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <FaComments className="text-3xl text-[#211551] mt-1 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">
                التواصل المهني مع الأطراف ذات الصلة
              </h3>
              <p className="text-gray-600 leading-7">
                وضوح التواصل مع الأطراف المعنية لضمان فهم النتائج واتخاذ القرار المناسب.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition md:col-span-2">
            <FaGraduationCap className="text-3xl text-[#211551] mt-1 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">
                التطوير المستمر والتعلم الذاتي
              </h3>
              <p className="text-gray-600 leading-7">
                متابعة التعلم الذاتي، وتطوير المهارات والخبرات المهنية بشكل مستمر.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Methodology;
