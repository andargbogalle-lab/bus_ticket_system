import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import '../Dashboard.css';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('book');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Booking form
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [busDetail, setBusDetail] = useState(null);
  const [form, setForm] = useState({ passengerName: '', phone: '', address: '', paymentMethod: 'cash' });
  const [booking, setBooking] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [bu, bo] = await Promise.all([api.get('/buses'), api.authGet('/bookings')]);
      setBuses(bu); setBookings(bo);
    } catch (err) { setError(err.message); }
  };

  const handleSelectBus = async (busId) => {
    setSelectedBus(busId); setSelectedSeats([]); setBooking(null);
    if (!busId) { setBusDetail(null); return; }
    try { const data = await api.get(`/buses/${busId}`); setBusDetail(data); }
    catch (err) { setError(err.message); }
  };

  const toggleSeat = (num) => {
    setSelectedSeats((prev) => prev.includes(num) ? prev.filter((s) => s !== num) : [...prev, num]);
  };

  const handleBook = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      const data = await api.authPost('/bookings/agent', {
        busId: selectedBus, seatNumbers: selectedSeats,
        passengerName: form.passengerName, phone: form.phone,
        address: form.address, paymentMethod: form.paymentMethod,
      });
      setBooking(data); setSuccess('Booking created successfully!');
      setForm({ passengerName: '', phone: '', address: '', paymentMethod: 'card' });
      setSelectedSeats([]); loadData();
    } catch (err) { setError(err.message); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try { await api.authPut(`/bookings/${id}/cancel`); loadData(); setSuccess('Cancelled'); setTimeout(() => setSuccess(''), 3000); }
    catch (err) { setError(err.message); }
  };

  const todayBookings = bookings.filter((b) => {
    const today = new Date().toDateString();
    return new Date(b.createdAt).toDateString() === today && b.status !== 'cancelled';
  });

  const todayRevenue = todayBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className={`dashboard animate-fade-in ${booking ? 'printable-receipt-only' : ''}`}>
      <div className="dashboard-header no-print">
        <h1><span className="text-gradient">Agent</span> Dashboard</h1>
        <p>Welcome, {user?.fullName}. Book tickets for walk-in customers.</p>
      </div>
      {success && <div className="dash-success">{success}</div>}
      {error && <div className="dash-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card glass-panel"><div className="stat-icon">📅</div><div className="stat-value">{todayBookings.length}</div><div className="stat-label">Today's Bookings</div></div>
        <div className="stat-card glass-panel"><div className="stat-icon">💰</div><div className="stat-value">{todayRevenue.toLocaleString()}</div><div className="stat-label">Today's Revenue (ETB)</div></div>
        <div className="stat-card glass-panel"><div className="stat-icon">📊</div><div className="stat-value">{bookings.length}</div><div className="stat-label">Total Bookings</div></div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {['book', 'transactions'].map((t) => (
          <button key={t} className={`btn ${activeTab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>
            {t === 'book' ? '+ Book Ticket' : 'Transactions'}
          </button>
        ))}
      </div>

      {activeTab === 'book' && (
        <div className="dash-section">
          <div className="form-card glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Book for Customer</h2>
            <div className="dash-form">
              <div className="form-group">
                <label>Select Bus</label>
                <select value={selectedBus} onChange={(e) => handleSelectBus(e.target.value)}>
                  <option value="">-- Choose a bus --</option>
                  {buses.map((b) => (
                    <option key={b._id} value={b._id}>{b.busNumber} — {b.origin} → {b.destination} ({b.price} ETB)</option>
                  ))}
                </select>
              </div>

              {busDetail && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Select Seats</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {busDetail.seats.map((s) => (
                        <button key={s.seatNumber} type="button" disabled={s.isBooked}
                          className={`seat-btn ${s.isBooked ? 'booked' : ''} ${selectedSeats.includes(s.seatNumber) ? 'selected' : ''}`}
                          onClick={() => toggleSeat(s.seatNumber)}
                          style={{ width: '40px', height: '40px', borderRadius: '6px', border: '1px solid rgba(37,99,235,0.3)', background: s.isBooked ? 'rgba(100,116,139,0.2)' : selectedSeats.includes(s.seatNumber) ? 'var(--primary-color)' : 'rgba(37,99,235,0.1)', color: selectedSeats.includes(s.seatNumber) ? '#fff' : s.isBooked ? 'rgba(100,116,139,0.4)' : 'var(--text-main)', cursor: s.isBooked ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit' }}>
                          {s.seatNumber}
                        </button>
                      ))}
                    </div>
                    {selectedSeats.length > 0 && <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Selected: <strong style={{ color: 'var(--text-main)' }}>{selectedSeats.join(', ')}</strong> | Total: <strong className="text-gradient">{busDetail.price * selectedSeats.length} ETB</strong></p>}
                  </div>

                  <form onSubmit={handleBook} className="dash-form">
                    <div className="form-group"><label>Passenger Full Name *</label><input type="text" value={form.passengerName} onChange={(e) => setForm({ ...form, passengerName: e.target.value })} required placeholder="Full name" /></div>
                    <div className="form-row">
                      <div className="form-group"><label>Phone *</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="0911..." /></div>
                      <div className="form-group"><label>Address / Kebele *</label><input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required placeholder="Address" /></div>
                    </div>
                    <div className="form-group"><label>Payment Method</label>
                      <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                        <option value="card">💳 Card</option><option value="mobile_banking">📱 Mobile Banking</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={selectedSeats.length === 0}>Confirm Booking</button>
                  </form>
                </>
              )}

              {booking && (
                <div className="printable-receipt" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>✅ Booking Confirmed</h3>
                  <p>Ref: <strong>{booking.bookingRef}</strong></p>
                  <p>{booking.passengerName} — {booking.seatNumbers.join(', ')} — {booking.totalPrice} ETB</p>
                  <button className="btn btn-outline no-print" style={{ marginTop: '1rem' }} onClick={() => window.print()}>🖨️ Print</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="dash-section">
          <h2 style={{ marginBottom: '1rem' }}>Booking Transactions</h2>
          <div className="data-table-wrapper glass-panel">
            <table className="data-table"><thead><tr><th>Ref</th><th>Passenger</th><th>Phone</th><th>Route</th><th>Seats</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{bookings.map((b) => (
                <tr key={b._id}><td><strong>{b.bookingRef}</strong></td><td>{b.passengerName}</td><td>{b.phone}</td>
                  <td>{b.bus?.origin} → {b.bus?.destination}</td><td>{b.seatNumbers.join(', ')}</td>
                  <td>{b.totalPrice} ETB</td><td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td>{b.status !== 'cancelled' && <button className="action-btn action-btn-cancel" onClick={() => handleCancel(b._id)}>Cancel</button>}</td>
                </tr>))}{bookings.length === 0 && <tr><td colSpan="8" className="empty-state">No transactions</td></tr>}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
