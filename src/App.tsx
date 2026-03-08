import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import SavedIdeas from "./pages/SavedIdeas";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminPromptTemplates from "./pages/admin/AdminPromptTemplates";
import AdminAIConfig from "./pages/admin/AdminAIConfig";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminApiUsage from "./pages/admin/AdminApiUsage";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/app" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/saved" element={<SavedIdeas />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="articles" element={<AdminArticles />} />
                <Route path="templates" element={<AdminPromptTemplates />} />
                <Route path="ai-config" element={<AdminAIConfig />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="feedback" element={<AdminFeedback />} />
                <Route path="api-usage" element={<AdminApiUsage />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
