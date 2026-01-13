import videoBg from '../assets/heroBg.mp4';
import { TfiStatsUp } from 'react-icons/tfi';
import { RiTeamFill } from 'react-icons/ri';
import { MdGppGood } from 'react-icons/md';
import { MdOutlineVisibility } from 'react-icons/md';
import { LuBoxes } from 'react-icons/lu';
import { useEffect, useState } from 'react';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [showMore, setShowMore] = useState(false);

  const fullText = `منصة الملاءة منظومة إلكترونية لقياس مستوى نضج وجودة خدمات التشخيص التربوي والنفسي المقدمة للطلبة ذوي الإعاقة، من خلال تقويم الأداء المؤسسي لفرق التشخيص اللامركزية، وقياس الكفاءة المهنية للممارسين وفق معايير مهنية وأطر قياس معتمدة، بما يدعم جودة التشخيص، وفعالية التوصيات، وعدالة الوصول إلى الخدمة، وصناعة القرار التربوي.`;

  const shortText = `منصة الملاءة منظومة إلكترونية لقياس مستوى نضج وجودة خدمات التشخيص التربوي والنفسي المقدمة للطلبة ذوي الإعاقة...`;
  return (
    <>
      <main className="relative w-full h-full">
        <div className="relative w-full h-screen overflow-hidden bg-[#211551]">
          <video
            className="absolute top-0 left-0 w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            loop
            id="myVideo"
          >
            <source src={videoBg} type="video/mp4" />
          </video>
          <div className="absolute top-0 left-0 w-full h-full bg-black/40"></div>

          <div className="relative z-20 text-white flex items-center md:items-start flex-col justify-center p-6 px-14 h-full">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              منصة الملاءة
            </h2>
            <p className="text-[14px] md:text-2xl mb-6 max-w-[700px] text-center md:text-start">
              {showMore ? fullText : shortText}
            </p>
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-6 cursor-pointer py-3 bg-[#211551] rounded-full text-lg font-semibold hover:opacity-65 transition"
            >
              {showMore ? 'عرض أقل' : 'للمزيد'}
            </button>
          </div>
        </div>
      </main>
      <section className="z-20 relative px-14 bg-[#211551] text-white py-10 md:py-20">
        <div>
          <h4 className="text-4xl mb-5">النطق السامي</h4>
          <p className="text-2xl md:text-3xl leading-[150%] text-center md:text-start">
            {' '}
            إن الاهتمام بقطاع التعليم بمختلف أنواعه ومستوياته وتوفير البيئة
            الداعمة والمحفزة للبحث العلمي والابتكار سوف يكون في سلم أولوياتنا
            الوطنية، وسنمده بكافة أسباب التمكين باعتباره الأساس الذي من خلاله
            سيتمكن أبناؤنا من الإسهام في بناء متطلبات المرحلة المقبلة.
          </p>
          <span className="text-2xl font-black my-5 block">
            {' '}
            جلالة السلطان هيثم بن طارق
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-10 mt-10">
          <div className="bg-white text-[#211551] p-5 rounded-2xl flex gap-3 flex-col items-center justify-center hover:-translate-y-3.5 duration-300">
            <TfiStatsUp size={50} />
            <span className="text-2xl font-black">اثر الاداء </span>
          </div>
          <div className="bg-white text-[#211551] p-5 rounded-2xl flex gap-3 flex-col items-center justify-center hover:-translate-y-3.5 duration-300">
            <RiTeamFill size={50} />
            <span className="text-2xl font-black">كفاءة الفريق</span>
          </div>
          <div className="bg-white text-[#211551] p-5 rounded-2xl flex gap-3 flex-col items-center justify-center hover:-translate-y-3.5 duration-300">
            <MdGppGood size={50} />
            <span className="text-2xl font-black"> جوده الخدمات</span>
          </div>
        </div>
      </section>
      <section className="px-14 py-10 md:py-20 bg-[#211551] text-white">
        <div className="flex flex-col gap-3">
          <div className="bg-[#3b2e79] p-5 rounded-lg flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-5">
              <MdOutlineVisibility size={30} />
              <h4 className="text-3xl">رؤية عمان 2040</h4>
            </div>
            <p className="text-xl">
              منظومة تربوية متكاملة تضمن الكشف المبكر والدعم الفاعل وفق رؤية عمان 2040.
            </p>
            <p className="text-xl">
              مجتمع إنسانه مبدع، معتز بهويته، مبتكر ومنافس عالميًا، ينعم بحياة
              كريمة ورفاه مستدام.
            </p>
          </div>
          <div className="bg-[#3b2e79] p-5 rounded-lg flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-5">
              <LuBoxes size={30} />
              <h4 className="text-3xl">الرسالة</h4>
            </div>
            <p className="text-xl">
              قياس مستوى النضج التربوي للفرق التشخيص اللامركزية بما يعزز جودة
              التعليم الشامل.{' '}
            </p>
          </div>{' '}
        </div>
      </section>
      <section className="px-14 py-10 md:py-20">
        <div className="text-center md:text-start">
          <h4 className="text-3xl font-black mb-5"> ملاءة بالأرقام</h4>
          <span>
            تعرف على أبرز مؤشرات منظومة الملاءة وكيف تسهم في تحقيق رؤية عمان
            2040{' '}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 my-5">
          <div className="bg-[#211551] px-3 py-8 text-white text-center flex flex-col gap-3 rounded">
            <span className="text-4xl font-black">+173</span>
            <p className="text-3xl">عدد الحالات التشخيصية المشمولة بالتقييم</p>
          </div>
          <div className="bg-[#211551] px-3 py-8 text-white text-center flex flex-col gap-3 rounded">
            <span className="text-4xl font-black">80%</span>
            <p className="text-3xl">نسبة الالتزام بتطبيق أدوات التشخيص المعتمدة</p>
          </div>
          <div className="bg-[#211551] px-3 py-8 text-white text-center flex flex-col gap-3 rounded">
            <span className="text-4xl font-black">+150</span>
            <p className="text-3xl">متوسط زمن إنجاز التقرير التشخيصي لكل حالة (بالدقائق)</p>
          </div>
          <div className="bg-[#211551] px-3 py-8 text-white text-center flex flex-col gap-3 rounded">
            <span className="text-4xl font-black">95%</span>
            <p className="text-3xl">نسبة الحالات المعتمدة دون ملاحظات جوهرية</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
