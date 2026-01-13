import { useEffect, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const FAQPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'ما هي درجة الملاءة؟',
      a: 'درجة الملاءة هي مؤشر رقمي يعكس مستوى نضج الأداء المهني لفرق التشخيص التربوي والنفسي في المديريات التعليمية، ويقيس جودة تطبيق الأدوات التشخيصية، كفاءة الإجراءات، دقة التحليل والتوصيات، جودة التقارير والتوثيق، التواصل المهني، التطوير المستمر، ورضا المستفيدين عن الخدمات المقدمة للطلبة ذوي الإعاقة.',
    },
    {
      q: 'ما هي مستويات درجة ملاءة؟',
      a: `تأسيسي (0-40): بداية اكتساب المهارات الأساسية، بعض المؤشرات غير مكتملة.\nنامٍ (50-69): تطبيق معظم المهارات بنضج مقبول، مع تطوير مستمر.\nمتقدم (70-89): جميع المحاور مطبقة بشكل فعال، جودة عالية في الأداء.\nرائد (90-100): مستوى متميز، استدامة في جميع المحاور، أفضل الممارسات المهنية مطبقة بالكامل.`,
    },
    {
      q: 'كيف يتم التحقق من دقة البيانات؟',
      a: 'إرفاق أدلة لكل تقييم، مراجعة من قبل دائرة التربية الخاصة والتعلم المستمر، وتقديم تغذية راجعة مباشرة للفريق.',
    },
    {
      q: 'هل سيتم تقييم مستوى ملاءة مرة واحدة فقط في العام؟',
      a: 'يُنفذ التقييم مرتين خلال العام وفق الخطة السنوية للدائرة، مع إمكانية إعادة التقييم للفرق التي نفذت خطة تحسين وطلبت إعادة التقييم رسميًا.',
    },
    {
      q: 'من الجهة التي تطلع على نتائج تقييم الفرق؟',
      a: `ترفع النتائج إلى:\n• دائرة التشخيص ورعاية الموهوبين.\n• المديريات التعليمية (نسخة من نتائج فرقهم فقط).\n• المديرية العامة للتربية الخاصة والتعلم المستمر / مكتب سعادة الوكيل.`,
    },
    {
      q: 'ما المطلوب من الفريق بعد استلام التقرير؟',
      a: `على الفريق:\n• مراجعة التقرير بدقة.\n• تنفيذ خطة التحسين إن وجدت.\n• توثيق الإجراءات المتخذة.`,
    },
    {
      q: 'ما أهمية قياس أداء الممارسين؟',
      a: `يساهم قياس أداء الممارسين في:\n• رفع جودة الخدمات التربوية المقدمة للطلبة ذوي الإعاقة.\n• دعم تطوير الكفاءات المهنية للفرق.\n• تعزيز الشفافية والمساءلة داخل منظومة التشخيص.\n• توجيه التحسين المستمر وضمان فعالية التوصيات والخدمات.`,
    },
  ];

  return (
    <section className="bg-gray-50 text-right" dir="rtl">
      {/* Hero Section */}
      <div className="bg-[#211551] text-white py-28 px-6 md:px-20 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">الأسئلة الشائعة</h1>
        <p className="max-w-3xl mx-auto text-lg opacity-90 leading-8">
          هنا ستجد إجابات على أبرز الأسئلة حول منظومة ملاءة وعمليات التقييم
          والتقارير.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-5xl mx-auto py-16 px-6 md:px-10 space-y-6">
        {faqs.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden"
          >
            <button
              className="w-full flex justify-between items-center px-6 py-5 text-lg font-semibold text-[#211551]"
              onClick={() => toggleAccordion(index)}
            >
              <span>{item.q}</span>
              <FaChevronDown
                className={`w-4 h-4 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="px-6 pb-6 text-gray-700 whitespace-pre-line leading-8 text-base border-t border-gray-100">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQPage;
