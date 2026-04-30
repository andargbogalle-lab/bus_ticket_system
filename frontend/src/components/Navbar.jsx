import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'agent': return '/agent';
      default: return '/';
    }
  };

  const getRoleBadge = () => {
    if (!user) return null;
    const colors = {
      admin: '#ef4444',
      agent: '#f59e0b',
    };
    return (
      <span className="role-badge" style={{ background: colors[user.role] || '#64748b' }}>
        {user.role}
      </span>
    );
  };

  return (
    <header className="navbar-container glass-panel">
      <div className="navbar-content">
        <Link to="/" className="brand-logo">
          <span className="text-gradient">Abay</span>Bus
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-item">Home</Link>
          <Link to="/routes" className="nav-item">Our Routes</Link>

          {user ? (
            <>
              <Link to={getDashboardPath()} className="nav-item">
                Dashboard
              </Link>
              <div className="nav-user">
                {getRoleBadge()}
                <span className="nav-username">{user.fullName}</span>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">Staff Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
