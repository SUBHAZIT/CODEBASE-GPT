import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { useSettingsStore } from "@/lib/settings-store";
import Landing from "./pages/Landing";
import IndexingProgress from "./pages/IndexingProgress";
import RepoDashboard from "./pages/RepoDashboard";
import ChatInterface from "./pages/ChatInterface";
import OnboardingDoc from "./pages/OnboardingDoc";
import SharedChat from "./pages/SharedChat";
import SecurityScan from "./pages/SecurityScan";
import SystemDesign from "./pages/SystemDesign";
import RepoIssues from "./pages/RepoIssues";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Documentation from "./pages/Documentation";
import Changelog from "./pages/Changelog";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import OurPhilosophy from "./pages/OurPhilosophy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { settings } = useSettingsStore();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MotionConfig reducedMotion={settings.reducedMotion ? "always" : "never"}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/index/:repoId" element={<IndexingProgress />} />
              <Route path="/repo/:repoId" element={<RepoDashboard />} />
              <Route path="/repo/:repoId/chat" element={<ChatInterface />} />
              <Route path="/repo/:repoId/onboarding" element={<OnboardingDoc />} />
              <Route path="/repo/:repoId/security" element={<SecurityScan />} />
              <Route path="/repo/:repoId/system-design" element={<SystemDesign />} />
              <Route path="/repo/:repoId/issues" element={<RepoIssues />} />
              <Route path="/shared/:sessionId" element={<SharedChat />} />
              <Route path="/features" element={<Features />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/our-philosophy" element={<OurPhilosophy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </MotionConfig>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
