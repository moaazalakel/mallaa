import { useEffect, useState } from 'react';
import { FaChevronDown, FaUsers, FaTools, FaChartLine } from 'react-icons/fa';

const WhatSystemOffers = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const items = [
    {
      title: '📊 قياس تجربة المستفيد',
      content:
        'قياس رضا أولياء الأمور والمعلمين عن جودة وكفاءة الخدمات التربوية المتخصصة المقدمة من فرق التشخيص اللامركزية.',
    },
    {
      title: '🚀 التمكين',
      content: `تقديم برامج تدريبية وأدلة إجرائية لبناء وتطوير القدرات الفنية والممارسات التخصصية. إكساب الفرق المهارات اللازمة في إدارة وقياس الأداء في مجال التشخيص للطلبة ذوي الإعاقة. دعم تحليل الأداء ورفع جودة تجربة المستفيد من الخدمات التربوية.`,
    },
    {
      title: '📈 قياس الأداء',
      content: `قياس أداء فرق التشخيص اللامركزية في مجال التشخيص التربوي والنفسي للطلبة ذوي الإعاقة من خلال أدوات ومعايير موحدة، مستندة إلى أفضل الممارسات المهنية، وإصدار تقارير دورية داعمة للتحسين المستمر.`,
    },
  ];

  return (
    <section dir="rtl" className="text-right">
      {/* Hero Section */}
      <div className="bg-[#211551] text-white py-28 px-6 md:px-20 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">ما يقدمه النظام</h1>
        <p className="max-w-3xl mx-auto text-lg opacity-90 leading-8">
          اكتشف كيف تسهم منظومة ملاءة في رفع كفاءة التعليم، تعزيز جودة الخدمات
          التربوية، ودعم صناعة القرار لتحقيق رؤية عُمان 2040.
        </p>
      </div>

      {/* Intro Section */}
      <div className="bg-gray-50 py-12 px-6 md:px-20">
        <div className="max-w-4xl mx-auto text-lg text-gray-700 leading-8">
          <p>
            تقدم منظومة الملاءة مجموعة من الأدوات والخدمات التي تهدف إلى تمكين
            الفرق التربوية ورفع مستوى النضج المؤسسي في مجالات الكشف والتشخيص. كل
            خدمة صُممت لتعزيز الجودة، الكفاءة، والأثر الإيجابي على الطلبة
            وأولياء الأمور.
          </p>
        </div>
      </div>

      {/* Accordion Section */}
      <div className="py-12 px-6 md:px-20 bg-white">
        <div className="max-w-5xl mx-auto space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl shadow hover:shadow-lg transition"
            >
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-lg font-semibold text-[#211551]"
                onClick={() => toggleAccordion(index)}
              >
                {item.title}
                <FaChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-700 leading-8 text-base">
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Highlights Section */}
      <div className="py-16 px-6 md:px-20 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <FaUsers className="mx-auto text-4xl text-[#211551] mb-4" />
            <h3 className="text-xl font-semibold text-[#211551] mb-2">
              تعزيز رضا المستفيد
            </h3>
            <p className="text-gray-600 leading-7">
              التركيز على تجربة أولياء الأمور والطلاب لضمان جودة الخدمات
              التعليمية المقدمة.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <FaTools className="mx-auto text-4xl text-[#211551] mb-4" />
            <h3 className="text-xl font-semibold text-[#211551] mb-2">
              التمكين وبناء القدرات
            </h3>
            <p className="text-gray-600 leading-7">
              توفير الأدوات والبرامج التدريبية التي تعزز كفاءة الفرق اللامركزية
              في الكشف والتشخيص.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <FaChartLine className="mx-auto text-4xl text-[#211551] mb-4" />
            <h3 className="text-xl font-semibold text-[#211551] mb-2">
              تقارير قياس الأداء
            </h3>
            <p className="text-gray-600 leading-7">
              إعداد تقارير دورية مبنية على أفضل الممارسات العالمية لمتابعة
              التقدم وتحسين الأداء.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatSystemOffers;
