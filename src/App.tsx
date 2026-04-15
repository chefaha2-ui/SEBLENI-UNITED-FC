import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/Navbar';
import { Shield } from 'lucide-react';
import { Card } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { toast } from 'sonner';
import Home from './pages/Home';
import NewsDetail from './pages/NewsDetail';
import Matches from './pages/Matches';
import Team from './pages/Team';
import Community from './pages/Community';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, isAdmin, loading, unlockAdmin } = useAuth();
  const [password, setPassword] = React.useState('');
  const [showPrompt, setShowPrompt] = React.useState(false);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-off-white text-deep-black font-extrabold uppercase tracking-widest">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (adminOnly && !isAdmin) {
    if (!showPrompt) {
      return (
        <div className="h-[80vh] flex flex-col items-center justify-center p-4">
          <Card className="card-geometric w-full max-w-md p-8 text-center">
            <Shield size={48} className="mx-auto mb-6 text-primary-green" />
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Admin Access Required</h2>
            <p className="text-slate-gray text-sm mb-8">Please enter the official club administrator password to continue.</p>
            <div className="space-y-4">
              <Input 
                type="password" 
                placeholder="Admin Password" 
                className="bg-off-white border-border-color h-12 rounded-md text-center"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && unlockAdmin(password)}
              />
              <Button 
                onClick={() => {
                  if (unlockAdmin(password)) {
                    setShowPrompt(true);
                  } else {
                    toast.error('Incorrect admin password');
                  }
                }}
                className="w-full bg-deep-black text-pure-white hover:bg-slate-gray h-12 rounded-md font-bold uppercase tracking-widest"
              >
                Unlock Dashboard
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-off-white text-deep-black font-sans">
          <Navbar />
          <main className="pb-20 md:pb-0 md:ml-[240px]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/team" element={<Team />} />
              <Route path="/community" element={<Community />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Toaster position="top-center" />
        </div>
      </Router>
    </AuthProvider>
  );
}
