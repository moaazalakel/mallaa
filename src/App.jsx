import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { seedData } from './data/seedData';
import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import About from './pages/About';
import WhatSystemOffers from './pages/WhatSystemOffers';
import Methodology from './pages/Methodology';
import ServicesAndReports from './pages/ServicesAndReports';
import FAQPage from './pages/FAQPage';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PortalLayout from './components/layout/PortalLayout';
import Placeholder from './pages/portal/Placeholder';
import SpecialistDashboard from './pages/portal/specialist/Dashboard';
import CasesList from './pages/portal/specialist/CasesList';
import NewCase from './pages/portal/specialist/NewCase';
import CaseDetails from './pages/portal/specialist/CaseDetails';
import AuditCaseReview from './pages/portal/AuditCaseReview';
import SupervisorDashboard from './pages/portal/supervisor/Dashboard';
import AuditForm from './pages/portal/supervisor/AuditForm';
import AuditCases from './pages/portal/supervisor/AuditCases';
import GovernoratesList from './pages/portal/supervisor/GovernoratesList';
import SpecialistsList from './pages/portal/supervisor/SpecialistsList';
import SupervisorCaseView from './pages/portal/supervisor/CaseView';
import LeadershipDashboard from './pages/portal/supervisor/LeadershipDashboard';
import ActivitiesList from './pages/portal/ActivitiesList';
import NewActivity from './pages/portal/NewActivity';
import ActivityView from './pages/portal/ActivityView';
import ReportsList from './pages/portal/supervisor/ReportsList';
import PeriodicReportBuilder from './pages/portal/supervisor/PeriodicReportBuilder';
import { ROLES } from './data/constants';

// Initialize seed data on app load
try {
  seedData();
} catch (error) {
  console.error('Error seeding data:', error);
}

// Public Layout Wrapper
const PublicLayout = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Login route (no header/footer) */}
        <Route path="/login" element={<Login />} />

        {/* Specialist Portal */}
        <Route
          path="/portal/specialist/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SPECIALIST]}>
              <PortalLayout>
                <Routes>
                  <Route path="dashboard" element={<SpecialistDashboard />} />
                  <Route path="cases" element={<CasesList />} />
                  <Route path="cases/new" element={<NewCase />} />
                  <Route path="cases/:id" element={<CaseDetails />} />
                  <Route path="cases/:id/edit" element={<NewCase />} />
                  <Route path="audit" element={<AuditCases />} />
                  <Route path="audit/:id" element={<AuditCaseReview />} />
                  <Route path="activities" element={<ActivitiesList />} />
                  <Route path="activities/new" element={<NewActivity />} />
                  <Route path="activities/:id/view" element={<ActivityView />} />
                  <Route path="activities/:id/edit" element={<NewActivity />} />
                </Routes>
              </PortalLayout>
            </ProtectedRoute>
          }
        />

        {/* Supervisor Portal */}
        <Route
          path="/portal/supervisor/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPERVISOR, ROLES.SECTION_HEAD]}>
              <PortalLayout>
                <Routes>
                  <Route path="dashboard" element={<SupervisorDashboard />} />
                  <Route path="leadership" element={<LeadershipDashboard />} />
                  <Route path="governorates" element={<GovernoratesList />} />
                  <Route path="governorates/:id" element={<Placeholder title="تفاصيل المحافظة" />} />
                  <Route path="specialists" element={<SpecialistsList />} />
                  <Route path="specialists/:id" element={<Placeholder title="تفاصيل الأخصائي" />} />
                  <Route path="audit" element={<AuditCases />} />
                  <Route path="audit/:id" element={<AuditCaseReview />} />
                  <Route path="cases/:id/view" element={<SupervisorCaseView />} />
                  <Route path="cases/:id/audit" element={<AuditForm />} />
                  <Route path="activities" element={<ActivitiesList />} />
                  <Route path="activities/new" element={<NewActivity />} />
                  <Route path="activities/:id/view" element={<ActivityView />} />
                  <Route path="activities/:id/edit" element={<NewActivity />} />
                  <Route path="reports" element={<ReportsList />} />
                  <Route path="reports/periodic/new" element={<PeriodicReportBuilder mode="new" />} />
                  <Route path="reports/periodic/:id" element={<PeriodicReportBuilder mode="edit" />} />
                </Routes>
              </PortalLayout>
            </ProtectedRoute>
          }
        />

        {/* Public routes with header/footer */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/what-system-offers" element={<PublicLayout><WhatSystemOffers /></PublicLayout>} />
        <Route path="/methodology" element={<PublicLayout><Methodology /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><ServicesAndReports /></PublicLayout>} />
        <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />

        {/* Catch-all route - redirect to home for any unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
