import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import '../Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, todayBookings: 0, todayRevenue: 0 });
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [buses, setBuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', fullName: '', role: 'agent', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBusModal, setShowBusModal] = useState(false);
  const [editBus, setEditBus] = useState(null);
  const [busForm, setBusForm] = useState({
    busNumber: '', origin: '', destination: '',
    departureTime: '', arrivalTime: '',
    price: '', totalSeats: '', busType: 'standard', status: 'active',
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [s, u, b, bu] = await Promise.all([
        api.authGet('/bookings/stats'), api.authGet('/users'),
        api.authGet('/bookings'), api.get('/buses'),
      ]);
      setStats(s); setUsers(u); setBookings(b); setBuses(bu);
    } catch (err) { setError(err.message); }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editUser) { await api.authPut(`/users/${editUser._id}`, formData); }
      else { await api.authPost('/users', formData); }
      setShowModal(false); setEditUser(null);
      setFormData({ username: '', password: '', fullName: '', role: 'agent', phone: '' });
      setSuccess(editUser ? 'User updated' : 'User created');
      loadData(); setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message); }
  };

  const openEdit = (u) => {
    setEditUser(u);
    setFormData({ username: u.username, password: '', fullName: u.fullName, role: u.role, phone: u.phone || '' });
    setShowModal(true); setError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await api.authDelete(`/users/${id}`); loadData(); setSuccess('Deleted'); setTimeout(() => setSuccess(''), 3000); }
    catch (err) { setError(err.message); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try { await api.authPut(`/bookings/${id}/cancel`); loadData(); setSuccess('Cancelled'); setTimeout(() => setSuccess(''), 3000); }
    catch (err) { setError(err.message); }
  };

  const resetBusForm = () => {
    setBusForm({ busNumber: '', origin: '', destination: '', departureTime: '', arrivalTime: '', price: '', totalSeats: '', busType: 'standard', status: 'active' });
    setEditBus(null); setError('');
  };
  const openCreateBus = () => { resetBusForm(); setShowBusModal(true); };
  const openEditBus = (b) => {
    setEditBus(b);
    setBusForm({ ...b, departureTime: b.departureTime ? b.departureTime.slice(0, 16) : '', arrivalTime: b.arrivalTime ? b.arrivalTime.slice(0, 16) : '', busType: b.busType || 'standard', status: b.status || 'active' });
    setShowBusModal(true); setError('');
  };
  const handleSaveBus = async (e) => {
    e.preventDefault(); setError('');
    try {
      const payload = { ...busForm, price: Number(busForm.price), totalSeats: Number(busForm.totalSeats) };
      if (editBus) { await api.authPut(`/buses/${editBus._id}`, payload); }
      else { await api.authPost('/buses', payload); }
      setShowBusModal(false); resetBusForm(); setSuccess(editBus ? 'Schedule updated' : 'Schedule created');
      loadData(); setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message); }
  };
  const handleDeleteBus = async (id) => {
    if (!confirm('Delete this schedule?')) return;
    try { await api.authDelete(`/buses/${id}`); loadData(); setSuccess('Schedule removed'); setTimeout(() => setSuccess(''), 3000); }
    catch (err) { setError(err.message); }
  };

  return (
    <div className="dashboard animate-fade-in">
      <div className="dashboard-header">
        <h1><span className="text-gradient">Admin</span> Dashboard</h1>
        <p>Welcome, {user?.fullName}. Manage the Abay Bus system.</p>
      </div>
      {success && <div className="dash-success">{success}</div>}
      {error && activeTab !== 'staff' && <div className="dash-error">{error}</div>}

      <div className="stats-grid">
        {[['📊', stats.totalBookings, 'Total Bookings'], ['💰', stats.totalRevenue.toLocaleString(), 'Revenue (ETB)'],
          ['📅', stats.todayBookings, "Today's Bookings"], ['🚌', buses.length, 'Active Buses']].map(([icon, val, label], i) => (
          <div key={i} className="stat-card glass-panel">
            <div className="stat-icon">{icon}</div>
            <div className="stat-value">{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {['overview', 'buses', 'staff', 'bookings'].map((t) => (
          <button key={t} className={`btn ${activeTab === t ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setActiveTab(t); setError(''); }} style={{ textTransform: 'capitalize' }}>
            {t === 'staff' ? 'Manage Staff' : t === 'bookings' ? 'All Bookings' : t === 'buses' ? 'Schedules' : 'Overview'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="dash-section">
          <h2 style={{ marginBottom: '1rem' }}>Recent Bookings</h2>
          <div className="data-table-wrapper glass-panel">
            <table className="data-table"><thead><tr><th>Ref</th><th>Passenger</th><th>Route</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{bookings.slice(0, 10).map((b) => (
                <tr key={b._id}><td><strong>{b.bookingRef}</strong></td><td>{b.passengerName}</td>
                  <td>{b.bus?.origin} → {b.bus?.destination}</td><td>{b.totalPrice} ETB</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td>{new Date(b.createdAt).toLocaleDateString()}</td></tr>
              ))}{bookings.length === 0 && <tr><td colSpan="6" className="empty-state">No bookings yet</td></tr>}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="dash-section">
          <div className="dash-section-header"><h2>Staff Accounts</h2>
            <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditUser(null); setFormData({ username: '', password: '', fullName: '', role: 'agent', phone: '' }); setError(''); }}>+ Add Staff</button>
          </div>
          <div className="data-table-wrapper glass-panel">
            <table className="data-table"><thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{users.map((u) => (
                <tr key={u._id}><td><strong>{u.username}</strong></td><td>{u.fullName}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td><td>{u.phone || '—'}</td>
                  <td><span className={`badge badge-${u.isActive ? 'active' : 'inactive'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td><button className="action-btn action-btn-edit" onClick={() => openEdit(u)}>Edit</button>
                    {u._id !== user._id && <button className="action-btn action-btn-delete" onClick={() => handleDelete(u._id)}>Delete</button>}</td>
                </tr>))}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="dash-section">
          <h2 style={{ marginBottom: '1rem' }}>All Bookings ({bookings.length})</h2>
          <div className="data-table-wrapper glass-panel">
            <table className="data-table"><thead><tr><th>Ref</th><th>Passenger</th><th>Phone</th><th>Route</th><th>Seats</th><th>Amount</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{bookings.map((b) => (
                <tr key={b._id}><td><strong>{b.bookingRef}</strong></td><td>{b.passengerName}</td><td>{b.phone}</td>
                  <td>{b.bus?.origin} → {b.bus?.destination}</td><td>{b.seatNumbers.join(', ')}</td>
                  <td>{b.totalPrice} ETB</td><td>{b.paymentMethod === 'card' ? '💳' : '📱'}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td>{b.status !== 'cancelled' && <button className="action-btn action-btn-cancel" onClick={() => handleCancel(b._id)}>Cancel</button>}</td>
                </tr>))}{bookings.length === 0 && <tr><td colSpan="9" className="empty-state">No bookings</td></tr>}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'buses' && (
        <div className="dash-section">
          <div className="dash-section-header">
            <h2>Manage Schedules</h2>
            <button className="btn btn-primary" onClick={openCreateBus}>+ Assign Schedule</button>
          </div>
          <div className="data-table-wrapper glass-panel">
            <table className="data-table">
              <thead><tr><th>Bus No.</th><th>Route</th><th>Departure</th><th>Arrival</th><th>Price</th><th>Seats</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {buses.map((b) => {
                  const booked = b.seats ? b.seats.filter((s) => s.isBooked).length : 0;
                  return (
                    <tr key={b._id}>
                      <td><strong>{b.busNumber}</strong></td><td>{b.origin} → {b.destination}</td>
                      <td>{new Date(b.departureTime).toLocaleString()}</td><td>{new Date(b.arrivalTime).toLocaleString()}</td>
                      <td>{b.price} ETB</td><td>{booked}/{b.totalSeats}</td>
                      <td style={{ textTransform: 'capitalize' }}>{b.busType || 'standard'}</td>
                      <td><span className={`badge badge-${b.status === 'active' ? 'active' : 'inactive'}`}>{b.status || 'active'}</span></td>
                      <td>
                        <button className="action-btn action-btn-edit" onClick={() => openEditBus(b)}>Edit</button>
                        <button className="action-btn action-btn-delete" onClick={() => handleDeleteBus(b._id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
                {buses.length === 0 && <tr><td colSpan="9" className="empty-state">No schedules assigned yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <h2>{editUser ? 'Edit Staff' : 'Add New Staff'}</h2>
            {error && <div className="dash-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSaveUser} className="dash-form">
              <div className="form-group"><label>Full Name</label><input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required /></div>
              <div className="form-group"><label>Username</label><input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required /></div>
              <div className="form-group"><label>{editUser ? 'New Password (blank = keep)' : 'Password'}</label><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} {...(!editUser && { required: true })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Role</label><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}><option value="agent">Agent</option><option value="admin">Admin</option></select></div>
                <div className="form-group"><label>Phone</label><input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
              </div>
              <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editUser ? 'Update' : 'Create'}</button></div>
            </form>
          </div>
        </div>
      )}

      {showBusModal && (
        <div className="modal-overlay" onClick={() => setShowBusModal(false)}>
          <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <h2>{editBus ? 'Edit Schedule' : 'Assign New Schedule'}</h2>
            {error && <div className="dash-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSaveBus} className="dash-form">
              <div className="form-row">
                <div className="form-group"><label>Bus Number *</label><input type="text" value={busForm.busNumber} placeholder="e.g. AB-001" onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })} required /></div>
                <div className="form-group"><label>Bus Type</label><select value={busForm.busType} onChange={(e) => setBusForm({ ...busForm, busType: e.target.value })}><option value="standard">Standard</option><option value="luxury">Luxury</option><option value="minibus">Minibus</option></select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Origin *</label><input type="text" value={busForm.origin} placeholder="e.g. Addis Ababa" onChange={(e) => setBusForm({ ...busForm, origin: e.target.value })} required /></div>
                <div className="form-group"><label>Destination *</label><input type="text" value={busForm.destination} placeholder="e.g. Bahir Dar" onChange={(e) => setBusForm({ ...busForm, destination: e.target.value })} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Departure Time *</label><input type="datetime-local" value={busForm.departureTime} onChange={(e) => setBusForm({ ...busForm, departureTime: e.target.value })} required /></div>
                <div className="form-group"><label>Arrival Time *</label><input type="datetime-local" value={busForm.arrivalTime} onChange={(e) => setBusForm({ ...busForm, arrivalTime: e.target.value })} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Price (ETB) *</label><input type="number" value={busForm.price} placeholder="e.g. 800" onChange={(e) => setBusForm({ ...busForm, price: e.target.value })} required min="1" /></div>
                <div className="form-group"><label>Total Seats *</label><input type="number" value={busForm.totalSeats} placeholder="e.g. 49" onChange={(e) => setBusForm({ ...busForm, totalSeats: e.target.value })} required min="1" max="100" /></div>
              </div>
              {editBus && (
                <div className="form-group"><label>Status</label><select value={busForm.status} onChange={(e) => setBusForm({ ...busForm, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              )}
              <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={() => setShowBusModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editBus ? 'Update Schedule' : 'Assign Schedule'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
