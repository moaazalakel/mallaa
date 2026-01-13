import { useState } from 'react';
import PortalHeader from './PortalHeader';
import Sidebar from './Sidebar';

const PortalLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <PortalHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="lg:mr-64 p-6">
        {children}
      </main>
    </div>
  );
};

export default PortalLayout;
