import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AppProviders } from "./context/AppContext";
import { Header } from "./components/Header";
import { Landing } from "./pages/Landing";
import { Explore } from "./pages/Explore";
import { CreatorProfile } from "./pages/CreatorProfile";
import { Dashboard } from "./pages/Dashboard";
import { BecomeCreator } from "./pages/BecomeCreator";
import { HowItWorks } from "./pages/HowItWorks";
import { InvestorDeck } from "./pages/Deck";
import { TipScan } from "./pages/Scan";
import { KarmaProjects } from "./pages/KarmaProjects";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import { NoahAIDashboard } from "./pages/NoahAIDashboard";
import { initGA, trackPageView } from "./lib/analytics";

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

function App() {
  return (
    <HelmetProvider>
      <AppProviders>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AnalyticsTracker />
          <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 w-full">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/:identifier" element={<CreatorProfile />} />
                <Route path="/tip/:identifier" element={<CreatorProfile />} />
                <Route path="/profile/:address" element={<CreatorProfile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/creators" element={<BecomeCreator />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/deck" element={<InvestorDeck />} />
                <Route path="/scan" element={<TipScan />} />
                <Route path="/scan/hash/:hash" element={<TipScan />} />
                <Route path="/scan/address/:address" element={<TipScan />} />
                <Route path="/scan/basename/:basename" element={<TipScan />} />
                <Route path="/projects" element={<KarmaProjects />} />
                <Route path="/noah-ai" element={<NoahAIDashboard />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AppProviders>
    </HelmetProvider>
  );
}

export default App;
