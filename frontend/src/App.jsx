import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import BusRoutes from './pages/BusRoutes';
import BookTicket from './pages/BookTicket';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AgentDashboard from './pages/agent/AgentDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/routes" element={<BusRoutes />} />
            <Route path="/book/:id" element={<BookTicket />} />
            <Route path="/login" element={<Login />} />

            {/* Protected: Admin */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Protected: Agent */}
            <Route path="/agent" element={
              <ProtectedRoute roles={['agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;
