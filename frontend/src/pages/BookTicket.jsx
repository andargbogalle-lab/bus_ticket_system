import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import './BookTicket.css';

const BookTicket = () => {
  const { id } = useParams();
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1=seats, 2=info, 3=payment, 4=receipt

  // Seat selection
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Passenger info
  const [passengerName, setPassengerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('');

  // Booking result
  const [booking, setBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const data = await api.get(`/buses/${id}`);
        setBus(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBus();
  }, [id]);

  const toggleSeat = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setError('');
    try {
      const data = await api.post('/bookings', {
        busId: id,
        seatNumbers: selectedSeats,
        passengerName,
        phone,
        address,
        paymentMethod,
      });
      setBooking(data);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="book-page animate-fade-in">
        <div className="book-loading">Loading bus details...</div>
      </div>
    );
  }

  if (error && !bus) {
    return (
      <div className="book-page animate-fade-in">
        <div className="book-error glass-panel">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/routes" className="btn btn-primary">Back to Routes</Link>
        </div>
      </div>
    );
  }

  const totalPrice = bus ? bus.price * selectedSeats.length : 0;

  return (
    <div className="book-page animate-fade-in">
      {/* Progress Steps */}
      <div className="step-progress no-print">
        {['Select Seats', 'Your Info', 'Payment', 'Receipt'].map((label, i) => (
          <div key={i} className={`step-item ${step >= i + 1 ? 'active' : ''} ${step === i + 1 ? 'current' : ''}`}>
            <div className="step-number">{i + 1}</div>
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Select Seats */}
      {step === 1 && (
        <div className="step-content">
          <div className="bus-summary glass-panel">
            <h2 className="text-gradient">Select Your Seats</h2>
            <div className="bus-route-info">
              <span className="route-origin">{bus.origin}</span>
              <span className="route-arrow">→</span>
              <span className="route-dest">{bus.destination}</span>
            </div>
            <p className="bus-detail-line">
              Bus: <strong>{bus.busNumber}</strong> &nbsp;|&nbsp; 
              Departure: <strong>{new Date(bus.departureTime).toLocaleString()}</strong> &nbsp;|&nbsp;
              Price per seat: <strong>{bus.price} ETB</strong>
            </p>
          </div>

          <div className="seat-legend">
            <div className="legend-item"><div className="legend-box available"></div> Available</div>
            <div className="legend-item"><div className="legend-box selected"></div> Selected</div>
            <div className="legend-item"><div className="legend-box booked"></div> Booked</div>
          </div>

          <div className="seat-map glass-panel">
            <div className="bus-front">🚌 Front</div>
            <div className="seats-grid">
              {bus.seats && bus.seats.map((seat) => (
                <button
                  key={seat.seatNumber}
                  className={`seat-btn ${seat.isBooked ? 'booked' : ''} ${selectedSeats.includes(seat.seatNumber) ? 'selected' : ''}`}
                  disabled={seat.isBooked}
                  onClick={() => toggleSeat(seat.seatNumber)}
                  title={`Seat ${seat.seatNumber}`}
                >
                  {seat.seatNumber}
                </button>
              ))}
            </div>
          </div>

          {selectedSeats.length > 0 && (
            <div className="selection-summary glass-panel">
              <p>
                Selected: <strong>{selectedSeats.join(', ')}</strong> &nbsp;|&nbsp; 
                Total: <strong className="text-gradient">{totalPrice} ETB</strong>
              </p>
              <button className="btn btn-primary" onClick={() => setStep(2)}>
                Continue →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Passenger Info */}
      {step === 2 && (
        <div className="step-content">
          <div className="form-card glass-panel">
            <h2 className="text-gradient">Passenger Information</h2>
            <p className="form-subtitle">Please enter your full details</p>

            <div className="booking-form">
              <div className="form-group">
                <label htmlFor="passenger-name">Full Name *</label>
                <input
                  type="text"
                  id="passenger-name"
                  placeholder="Enter your full name"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="e.g. 0911234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address / Kebele *</label>
                <input
                  type="text"
                  id="address"
                  placeholder="Enter your address or kebele"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button
                className="btn btn-primary"
                disabled={!passengerName || !phone || !address}
                onClick={() => setStep(3)}
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="step-content">
          <div className="form-card glass-panel">
            <h2 className="text-gradient">Choose Payment Method</h2>

            <div className="payment-options">
              <label className={`payment-option glass-panel ${paymentMethod === 'card' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <div className="payment-icon">💳</div>
                <div className="payment-label">
                  <strong>Card Payment</strong>
                  <span>Visa, Mastercard</span>
                </div>
              </label>

              <label className={`payment-option glass-panel ${paymentMethod === 'mobile_banking' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="mobile_banking"
                  checked={paymentMethod === 'mobile_banking'}
                  onChange={() => setPaymentMethod('mobile_banking')}
                />
                <div className="payment-icon">📱</div>
                <div className="payment-label">
                  <strong>Mobile Banking</strong>
                  <span>CBE Birr, telebirr, Amole</span>
                </div>
              </label>
            </div>

            <div className="order-summary glass-panel">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Route</span>
                <span>{bus.origin} → {bus.destination}</span>
              </div>
              <div className="summary-row">
                <span>Bus</span>
                <span>{bus.busNumber}</span>
              </div>
              <div className="summary-row">
                <span>Seats</span>
                <span>{selectedSeats.join(', ')}</span>
              </div>
              <div className="summary-row">
                <span>Price per seat</span>
                <span>{bus.price} ETB</span>
              </div>
              <div className="summary-row">
                <span>Number of seats</span>
                <span>{selectedSeats.length}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount</span>
                <span className="text-gradient">{totalPrice} ETB</span>
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
              <button
                className="btn btn-primary btn-lg"
                disabled={!paymentMethod || submitting}
                onClick={handleConfirmBooking}
              >
                {submitting ? 'Processing...' : `Pay ${totalPrice} ETB`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Receipt */}
      {step === 4 && booking && (
        <div className="step-content">
          <div className="receipt-card" id="printable-receipt">
            <div className="receipt-header">
              <h1 className="receipt-brand">Abay<span>Bus</span></h1>
              <p className="receipt-tagline">Your Ticket Receipt</p>
            </div>

            <div className="receipt-success">
              <div className="success-icon">✅</div>
              <h2>Booking Confirmed!</h2>
              <p className="booking-ref">Ref: <strong>{booking.bookingRef}</strong></p>
            </div>

            <div className="receipt-details">
              <div className="receipt-section">
                <h4>Route Details</h4>
                <div className="receipt-row">
                  <span>From</span>
                  <span>{booking.bus.origin}</span>
                </div>
                <div className="receipt-row">
                  <span>To</span>
                  <span>{booking.bus.destination}</span>
                </div>
                <div className="receipt-row">
                  <span>Bus Number</span>
                  <span>{booking.bus.busNumber}</span>
                </div>
                <div className="receipt-row">
                  <span>Departure</span>
                  <span>{new Date(booking.bus.departureTime).toLocaleString()}</span>
                </div>
                <div className="receipt-row">
                  <span>Arrival</span>
                  <span>{new Date(booking.bus.arrivalTime).toLocaleString()}</span>
                </div>
              </div>

              <div className="receipt-section">
                <h4>Passenger Details</h4>
                <div className="receipt-row">
                  <span>Full Name</span>
                  <span>{booking.passengerName}</span>
                </div>
                <div className="receipt-row">
                  <span>Phone</span>
                  <span>{booking.phone}</span>
                </div>
                <div className="receipt-row">
                  <span>Address</span>
                  <span>{booking.address}</span>
                </div>
              </div>

              <div className="receipt-section">
                <h4>Payment Details</h4>
                <div className="receipt-row">
                  <span>Seats</span>
                  <span>{booking.seatNumbers.join(', ')}</span>
                </div>
                <div className="receipt-row">
                  <span>Payment Method</span>
                  <span>{booking.paymentMethod === 'card' ? '💳 Card' : '📱 Mobile Banking'}</span>
                </div>
                <div className="receipt-row">
                  <span>Status</span>
                  <span className="status-confirmed">Confirmed</span>
                </div>
                <div className="receipt-row receipt-total">
                  <span>Total Paid</span>
                  <span>{booking.totalPrice} ETB</span>
                </div>
              </div>
            </div>

            <div className="receipt-footer">
              <p>Thank you for choosing Abay Bus!</p>
              <p className="receipt-date">Booked on: {new Date(booking.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="receipt-actions no-print">
            <button className="btn btn-primary btn-lg" onClick={handlePrint}>
              🖨️ Print Receipt
            </button>
            <Link to="/routes" className="btn btn-outline btn-lg">
              Book Another Ticket
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookTicket;
