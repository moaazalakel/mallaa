import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../data/constants';
import {
  IoHomeOutline,
  IoHome,
  IoDocumentTextOutline,
  IoDocumentText,
  IoAddCircleOutline,
  IoAddCircle,
  IoClipboardOutline,
  IoClipboard,
  IoPeopleOutline,
  IoPeople,
  IoBarChartOutline,
  IoBarChart,
  IoCalendarOutline,
  IoCalendar,
} from 'react-icons/io5';

const Sidebar = ({ isOpen, onClose }) => {
  const { isSpecialist, isSupervisorOrSectionHead } = useAuth();

  const specialistLinks = [
    { to: '/portal/specialist/dashboard', label: 'لوحة التحكم', icon: IoHomeOutline, activeIcon: IoHome },
    { to: '/portal/specialist/cases', label: 'قائمة الحالات', icon: IoDocumentTextOutline, activeIcon: IoDocumentText },
    { to: '/portal/specialist/cases/new', label: 'تسجيل حالة جديدة', icon: IoAddCircleOutline, activeIcon: IoAddCircle },
    { to: '/portal/specialist/audit', label: 'تقويم الكفاءة المهنية', icon: IoClipboardOutline, activeIcon: IoClipboard },
    { to: '/portal/specialist/activities', label: 'الأنشطة', icon: IoCalendarOutline, activeIcon: IoCalendar },
  ];

  const supervisorLinks = [
    { to: '/portal/supervisor/dashboard', label: 'لوحة التحكم', icon: IoHomeOutline, activeIcon: IoHome },
    { to: '/portal/supervisor/leadership', label: 'لوحة القيادة', icon: IoBarChartOutline, activeIcon: IoBarChart },
    { to: '/portal/supervisor/governorates', label: 'تقييم المحافظات', icon: IoBarChartOutline, activeIcon: IoBarChart },
    { to: '/portal/supervisor/specialists', label: 'تقييم الأخصائيين', icon: IoPeopleOutline, activeIcon: IoPeople },
    { to: '/portal/supervisor/audit', label: 'تقويم الكفاءة المهنية', icon: IoClipboardOutline, activeIcon: IoClipboard },
    { to: '/portal/supervisor/activities', label: 'الأنشطة', icon: IoCalendarOutline, activeIcon: IoCalendar },
  ];

  const links = isSpecialist() ? specialistLinks : isSupervisorOrSectionHead() ? supervisorLinks : [];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-0 h-full bg-[#211551] text-white w-64 z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
        dir="rtl"
      >
        <nav className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold">القائمة</h2>
          </div>

          <ul className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const ActiveIcon = link.activeIcon;
              return (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white text-[#211551]'
                          : 'text-white hover:bg-white/10'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive ? <ActiveIcon size={20} /> : <Icon size={20} />}
                        <span className="font-medium">{link.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
