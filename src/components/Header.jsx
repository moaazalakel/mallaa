import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CiMenuBurger } from 'react-icons/ci';
import { IoCloseSharp } from 'react-icons/io5';
import { IoIosArrowDown } from 'react-icons/io';
import { IoIosArrowUp } from 'react-icons/io';

const Header = () => {
  const [showHead, setShowHead] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [subMenu, setSubMenu] = useState(false);
  const desktopSubMenuRef = useRef(null);
  const mobileSubMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 100) {
        setShowHead(true);
      } else {
        setShowHead(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDesktop = desktopSubMenuRef.current && !desktopSubMenuRef.current.contains(event.target);
      const isOutsideMobile = mobileSubMenuRef.current && !mobileSubMenuRef.current.contains(event.target);
      
      if (isOutsideDesktop && isOutsideMobile) {
        setSubMenu(false);
      }
    };

    if (subMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [subMenu]);

  return (
    <header
      className={`flex items-center justify-between ${
        showHead ? 'bg-[#211551] fixed' : 'bg-[#211551] md:bg-transparent'
      } flex-wrap px-14 py-5 z-50 text-white absolute top-0 left-0 w-full duration-200`}
    >
      <Link to="/" className="text-4xl">
        الملاءة
      </Link>
      <ul className="hidden md:flex items-center gap-10 flex-wrap ">
        <li>
          <Link to="/">الرئيسية</Link>
        </li>
        <li className="relative" ref={desktopSubMenuRef}>
          <span
            onClick={() => setSubMenu(!subMenu)}
            className="flex items-center gap-2 cursor-pointer"
          >
            عن المنصة {subMenu ? <IoIosArrowDown /> : <IoIosArrowUp />}
          </span>
          <div
            className={`bg-white ${
              subMenu ? '' : 'hidden'
            } absolute left-0 top-[30px] min-w-[250px] z-50 text-black p-4 rounded-2xl`}
          >
            <h5 className="text-[#211551] font-black text-xl mb-5">
              عن المنصة
            </h5>
            <ul className="space-y-2">
              <li>
                <Link
                  onClick={() => setSubMenu(false)}
                  to="/about"
                  className="hover:underline block"
                >
                  نظام ملاءة
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => setSubMenu(false)}
                  to="/what-system-offers"
                  className="hover:underline block"
                >
                  ما يقدمه النظام
                </Link>
              </li>
            </ul>
          </div>
        </li>
        <li>
          <Link to="/methodology">منهجيات القياس</Link>
        </li>
        <li>
          <Link to="/services">دليل الخدمات الالكترونية</Link>
        </li>
        <li>
          <Link to="/faq">الأٍسئلة الشائعة</Link>
        </li>
        <li>
          <Link 
            to="/login" 
            className="bg-white text-[#211551] px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition"
          >
            تسجيل الدخول
          </Link>
        </li>
      </ul>
      <div onClick={() => setToggle(!toggle)} className="md:hidden">
        {toggle ? (
          <IoCloseSharp size={25} className="cursor-pointer" />
        ) : (
          <CiMenuBurger size={25} className="cursor-pointer" />
        )}
      </div>
      <ul
        className={`flex items-center flex-col gap-10 absolute left-0 w-full ${
          !toggle ? 'top-[-1000px]' : 'top-[80px]'
        } py-5 md:hidden bg-[#211551] z-50`}
      >
        <li>
          <Link onClick={() => setToggle(false)} to="/">
            الرئيسية
          </Link>
        </li>
        <li className="relative" ref={mobileSubMenuRef}>
          <span
            onClick={() => setSubMenu(!subMenu)}
            className="flex items-center gap-2 cursor-pointer"
          >
            عن المنصة {subMenu ? <IoIosArrowDown /> : <IoIosArrowUp />}
          </span>
          <div
            className={`bg-white ${
              subMenu ? '' : 'hidden'
            } absolute top-[30px] w-[250px] z-50 text-black p-4 rounded-2xl`}
          >
            <h5 className="text-[#211551] font-black text-xl mb-5">
              عن المنصة
            </h5>
            <ul className="space-y-2">
              <li>
                <Link
                  onClick={() => setSubMenu(false)}
                  to="/about"
                  className="hover:underline block"
                >
                  نظام ملاءة
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => setSubMenu(false)}
                  to="/what-system-offers"
                  className="hover:underline block"
                >
                  ما يقدمه النظام
                </Link>
              </li>
            </ul>
          </div>
        </li>
        <li>
          <Link onClick={() => setToggle(false)} to="/methodology">
            منهجيات القياس
          </Link>
        </li>
        <li>
          <Link onClick={() => setToggle(false)} to="/services">
            دليل الخدمات الالكترونية
          </Link>
        </li>
        <li>
          <Link onClick={() => setToggle(false)} to="/faq">
            الأٍسئلة الشائعة
          </Link>
        </li>
        <li>
          <Link 
            onClick={() => setToggle(false)} 
            to="/login"
            className="bg-white text-[#211551] px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition"
          >
            تسجيل الدخول
          </Link>
        </li>
      </ul>
    </header>
  );
};

export default Header;
