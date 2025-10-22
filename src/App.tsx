import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProviders } from './context/AppContext'
import { Header } from './components/Header'
import { Landing } from './pages/Landing'
import { Explore } from './pages/Explore'
import { CreatorProfile } from './pages/CreatorProfile'
import { Dashboard } from './pages/Dashboard'
import { BecomeCreator } from './pages/BecomeCreator'
import { HowItWorks } from './pages/HowItWorks'

function App() {
  return (
    <AppProviders>
      <Router>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/tip/:basename" element={<CreatorProfile />} />
              <Route path="/profile/:address" element={<CreatorProfile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/creators" element={<BecomeCreator />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProviders>
  )
}

export default App