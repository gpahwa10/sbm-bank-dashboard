import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/auth";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import RequisitionsPage from "@/pages/requisitions";
import JobsPage from "@/pages/jobs";
import CandidatesPage from "@/pages/candidates";
import ApplicationsPage from "@/pages/applications";
import InterviewsPage from "@/pages/interviews";
import OffersPage from "@/pages/offers";
import OnboardingPage from "@/pages/onboarding";
import ReportsPage from "@/pages/reports";
import AdminPage from "@/pages/admin";
import NotificationsPage from "@/pages/notifications";
import CompliancePage from "@/pages/compliance";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  const token = useAuthStore((s) => s.token);

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/">
        {token ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/dashboard/compliance">
        <ProtectedRoute component={CompliancePage} />
      </Route>
      <Route path="/requisitions">
        <ProtectedRoute component={RequisitionsPage} />
      </Route>
      <Route path="/jobs">
        <ProtectedRoute component={JobsPage} />
      </Route>
      <Route path="/candidates">
        <ProtectedRoute component={CandidatesPage} />
      </Route>
      <Route path="/applications">
        <ProtectedRoute component={ApplicationsPage} />
      </Route>
      <Route path="/interviews">
        <ProtectedRoute component={InterviewsPage} />
      </Route>
      <Route path="/offers">
        <ProtectedRoute component={OffersPage} />
      </Route>
      <Route path="/onboarding">
        <ProtectedRoute component={OnboardingPage} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={ReportsPage} />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={AdminPage} />
      </Route>
      <Route path="/notifications">
        <ProtectedRoute component={NotificationsPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
