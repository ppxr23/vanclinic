import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";

// Client pages
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import MedicalRecord from "./pages/MedicalRecord";
import Shop from "./pages/Shop";
import Profile from "./pages/Profile";

// Admin router
import AdminRouter from "./pages/admin/AdminRouter";

function Router() {
  return (
    <Switch>
      {/* ── CLIENT (Patient) ── */}
      <Route path="/" component={Splash} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/medical-record" component={MedicalRecord} />
      <Route path="/shop" component={Shop} />
      <Route path="/profile" component={Profile} />

      {/* ── BACK-OFFICE (Admin) ── */}
      {/* /admin → dashboard par défaut */}
      <Route path="/admin">
        {() => <AdminRouter page="dashboard" />}
      </Route>
      <Route path="/admin/:page">
        {(params) => <AdminRouter page={(params as any).page || "dashboard"} />}
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider defaultTheme="light">
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
