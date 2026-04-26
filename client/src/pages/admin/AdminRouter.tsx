import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminPatients from './AdminPatients';
import AdminAppointments from './AdminAppointments';
import AdminMedical from './AdminMedical';
import AdminTelemedicine from './AdminTelemedicine';
import AdminPlanning from './AdminPlanning';
import AdminShop from './AdminShop';
import AdminInventory from './AdminInventory';
import AdminOrders from './AdminOrders';
import AdminReports from './AdminReports';
import AdminAnalytics from './AdminAnalytics';
import AdminUsers from './AdminUsers';
import AdminLogs from './AdminLogs';
import AdminSettings from './AdminSettings';

const PAGES: Record<string, React.ComponentType> = {
  dashboard: AdminDashboard, patients: AdminPatients, appointments: AdminAppointments,
  medical: AdminMedical, telemedicine: AdminTelemedicine, planning: AdminPlanning,
  shop: AdminShop, inventory: AdminInventory, orders: AdminOrders,
  reports: AdminReports, analytics: AdminAnalytics, users: AdminUsers,
  logs: AdminLogs, settings: AdminSettings,
};

export default function AdminRouter({ page }: { page: string }) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  if (!user || user.role === 'patient') { setLocation('/dashboard'); return null; }
  const Page = PAGES[page] || AdminDashboard;
  return (
    <AdminLayout currentPage={page}>
      <Page />
    </AdminLayout>
  );
}
