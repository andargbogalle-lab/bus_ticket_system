import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import './BusRoutes.css';

const BusRoutes = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async (date) => {
    setLoading(true);
    try {
      const query = date ? `?date=${date}` : '';
      const data = await api.get(`/buses${query}`);
      setBuses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    if (e.target.value) {
      fetchBuses(e.target.value);
    } else {
      fetchBuses();
    }
  };

  const getAvailableSeats = (bus) => {
    if (!bus.seats || bus.seats.length === 0) return bus.totalSeats;
    return bus.seats.filter((s) => !s.isBooked).length;
  };

  const getDuration = (dep, arr) => {
    const diff = new Date(arr) - new Date(dep);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="routes-page animate-fade-in">
      {/* Page Header */}
      <div className="routes-hero">
        <h1>
          <span className="text-gradient">Abay Bus</span> Schedule
        </h1>
        <p className="routes-description">
          Choose your destination and travel with comfort. All routes operated exclusively by Abay Bus.
        </p>
      </div>

      {/* Date Selector */}
      <div className="date-selector glass-panel">
        <div className="date-selector-content">
          <div className="date-icon">📅</div>
          <div className="date-field">
            <label htmlFor="travel-date">Filter by Travel Date</label>
            <input
              type="date"
              id="travel-date"
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          {selectedDate && (
            <button className="btn btn-outline btn-sm" onClick={() => { setSelectedDate(''); fetchBuses(); }}>
              Show All
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="routes-loading">
          <p className="text-gradient">Loading schedules...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="routes-error glass-panel">
          <p>⚠️ {error}</p>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Make sure the backend server is running on port 5000
          </p>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && buses.length === 0 && (
        <div className="routes-empty glass-panel">
          <div className="empty-icon">🚌</div>
          <h3>No buses available</h3>
          <p>No schedules found{selectedDate ? ' for this date' : ''}. Check back later.</p>
        </div>
      )}

      {/* Routes List */}
      {!loading && buses.length > 0 && (
        <div className="routes-list">
          {buses.map((bus) => {
            const available = getAvailableSeats(bus);
            return (
              <div key={bus._id} className="route-card glass-panel">
                <div className="route-badge">
                  <span className="bus-number">{bus.busNumber}</span>
                  {bus.busType && bus.busType !== 'standard' && (
                    <span className="bus-type-badge">{bus.busType}</span>
                  )}
                </div>

                <div className="route-main">
                  <div className="route-cities">
                    <div className="city-block">
                      <span className="city-label">From</span>
                      <span className="city-name">{bus.origin}</span>
                      <span className="city-time">
                        {new Date(bus.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="route-line">
                      <div className="route-dot"></div>
                      <div className="route-dash"></div>
                      <div className="route-duration">{getDuration(bus.departureTime, bus.arrivalTime)}</div>
                      <div className="route-dash"></div>
                      <div className="route-dot"></div>
                    </div>

                    <div className="city-block">
                      <span className="city-label">To</span>
                      <span className="city-name">{bus.destination}</span>
                      <span className="city-time">
                        {new Date(bus.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="route-details">
                    <div className="detail-item">
                      <span className="detail-icon">💺</span>
                      <span className="detail-text">
                        <strong>{available}</strong> / {bus.totalSeats} seats
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span className="detail-text">
                        {new Date(bus.departureTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="route-action">
                  <p className="route-price">{bus.price} <span>ETB</span></p>
                  {available > 0 ? (
                    <Link to={`/book/${bus._id}`} className="btn btn-primary">
                      Book Now
                    </Link>
                  ) : (
                    <button className="btn btn-outline" disabled>Sold Out</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BusRoutes;
