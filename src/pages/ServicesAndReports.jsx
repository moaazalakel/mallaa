import { useEffect, useState } from 'react';
import {
  FaChevronDown,
  FaBook,
  FaTools,
  FaQuestionCircle,
  FaChartBar,
  FaLayerGroup,
} from 'react-icons/fa';

const ServicesAndReports = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [openIndex, setOpenIndex] = useState(null);
  const [openReport, setOpenReport] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const toggleReportAccordion = (index) => {
    setOpenReport(openReport === index ? null : index);
  };

  return (
    <section dir="rtl" className="text-right">
      {/* Hero Section */}
      <div className="bg-[#211551] text-white py-28 px-6 md:px-20 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          الخدمات الإلكترونية ووحدة التقارير
        </h1>
        <p className="max-w-3xl mx-auto text-lg opacity-90 leading-8">
          اكتشف الأدوات والخدمات الرقمية، وتحليل البيانات لمتابعة التقدم ودعم
          اتخاذ القرار في منظومة ملاءة.
        </p>
      </div>

      {/* دليل الخدمات الإلكترونية */}
      <div className="bg-gray-50 py-16 px-6 md:px-20">
        <h2 className="text-2xl md:text-3xl font-bold text-[#211551] mb-10 text-center">
          📑 دليل الخدمات الإلكترونية
        </h2>
        <div className="max-w-5xl mx-auto space-y-4">
          {[
            {
              title: 'الإصدارات',
              icon: <FaBook className="text-[#211551] text-2xl" />,
              desc: 'جميع الإصدارات والمنشورات المرتبطة بمنظومة ملاءة متاحة هنا.',
            },
            {
              title: 'أدوات التشخيص المقننة',
              icon: <FaTools className="text-[#211551] text-2xl" />,
              desc: `- صعوبات التعلم 
- ⁠مقياس المعالجة الحسية 
- ⁠مقياس فاينلاند للسلوك التكيفي
- ⁠مقياس pep3 لتقييم التوحد 
- ⁠استمارات التشخيص`,
            },
            {
              title: 'الأسئلة الشائعة',
              icon: <FaQuestionCircle className="text-[#211551] text-2xl" />,
              desc: 'إجابات على أكثر الأسئلة شيوعًا حول المنظومة.',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-lg font-semibold text-[#211551]"
                onClick={() => toggleAccordion(index)}
              >
                <span className="flex items-center gap-3">
                  {item.icon} {item.title}
                </span>
                <FaChevronDown
                  className={`transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="p-6 text-gray-700 leading-7 whitespace-pre-line">
                  {item.desc}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* وحدة التحليل والتقارير */}
      <div className="bg-[#211551] py-16 px-6 md:px-20">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center">
          📊 وحدة التحليل والتقارير
        </h2>
        <div className="max-w-5xl mx-auto space-y-4">
          {[
            {
              title: 'تصنيف المديريات حسب درجة الملاءة',
              icon: <FaLayerGroup className="text-[#211551] text-2xl" />,
              desc: 'عرض تصنيف المديريات التعليمية وفقًا لمستوى النضج (درجة الملاءة).',
            },
            {
              title: 'تقارير المقارنة بين المحافظات',
              icon: <FaChartBar className="text-[#211551] text-2xl" />,
              desc: 'مقارنات تفاعلية بين المحافظات التعليمية بناءً على مؤشرات الأداء.',
            },
            {
              title: 'رسوم بيانية لعرض التقدم',
              icon: <FaChartBar className="text-[#211551] text-2xl" />,
              desc: 'رسوم بيانية تفاعلية لتوضيح مستوى التقدم والإنجازات.',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl shadow-md overflow-hidden"
            >
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-lg font-semibold text-[#211551]"
                onClick={() => toggleReportAccordion(index)}
              >
                <span className="flex items-center gap-3">
                  {item.icon} {item.title}
                </span>
                <FaChevronDown
                  className={`transition-transform ${
                    openReport === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openReport === index && (
                <div className="p-6 text-gray-700 leading-7">{item.desc}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesAndReports;
