import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#211551] text-white py-8 mt-12">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8 text-center md:text-right">
        {/* القسم الأول: عن المنظومة */}
        <div>
          <h3 className="text-lg font-semibold mb-3">منظومة الملاءة</h3>
          <p className="text-sm leading-6">
            منصة تربوية متكاملة لقياس مستوى نضج الخدمات التشخيص التربوي والنفسي
            للطلبة ذوي الإعاقة، بما يسهم في جودة التعليم الشامل وفق رؤية عمان
            2040.{' '}
          </p>
        </div>

        {/* القسم الثاني: روابط سريعة */}
        <div>
          <h3 className="text-lg font-semibold mb-3">روابط سريعة</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:underline">
                الرئيسية
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                عن المنصة
              </Link>
            </li>
            <li>
              <Link to="/what-system-offers" className="hover:underline">
                ما يقدمه النظام
              </Link>
            </li>
            <li>
              <Link to="/methodology" className="hover:underline">
                منهجيات القياس
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:underline">
                الخدمات والتقارير
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:underline">
                الأسئلة الشائعة
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:underline">
                تسجيل الدخول
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/20 mt-6 pt-4 text-center text-sm">
        © {new Date().getFullYear()} جميع الحقوق محفوظة - منظومة الملاءة
      </div>
    </footer>
  );
};

export default Footer;
