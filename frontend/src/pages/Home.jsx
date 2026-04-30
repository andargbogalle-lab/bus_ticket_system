import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container animate-fade-in">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Journey Begins with <br />
            <span className="text-gradient">Abay Bus</span>
          </h1>
          <p className="hero-subtitle">
            Experience the most comfortable, reliable, and premium bus travel with Abay Bus. Book your tickets instantly.
          </p>
          <div className="hero-actions">
            <Link to="/routes" className="btn btn-primary btn-lg">Book a Ticket</Link>
            <Link to="/routes" className="btn btn-outline btn-lg glass-panel">View Our Routes</Link>
          </div>
        </div>

        {/* Bus Image */}
        <div className="hero-image">
          <img src="/bus.jpg" alt="Abay Bus - Premium Travel Experience" className="bus-illustration" />
        </div>
        
        <div className="hero-stats glass-panel">
          <div className="stat-item">
            <h3>50+</h3>
            <p>Buses</p>
          </div>
          <div className="stat-item">
            <h3>20+</h3>
            <p>Cities</p>
          </div>
          <div className="stat-item">
            <h3>100k+</h3>
            <p>Happy Travelers</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Premium Comfort & Amenities</h2>
          <p className="section-subtitle">Experience luxury travel with our world-class facilities</p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card glass-panel">
            <div className="feature-icon">🪑</div>
            <h3>Reclining Seats</h3>
            <p>Spacious, comfortable seats with adjustable recline for maximum relaxation during your journey.</p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card glass-panel">
            <div className="feature-icon">❄️</div>
            <h3>Air Conditioning</h3>
            <p>Climate-controlled environment to keep you cool and comfortable throughout your trip.</p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card glass-panel">
            <div className="feature-icon">📺</div>
            <h3>Entertainment</h3>
            <p>Individual screens with movies, music, and games to make your journey enjoyable.</p>
          </div>

          {/* Feature 4 */}
          <div className="feature-card glass-panel">
            <div className="feature-icon">📶</div>
            <h3>Free WiFi</h3>
            <p>Stay connected with complimentary high-speed internet access on all our buses.</p>
          </div>

          {/* Feature 5 */}
          <div className="feature-card glass-panel">
            <div className="feature-icon">🔌</div>
            <h3>USB Charging</h3>
            <p>Power outlets and USB ports at every seat to keep your devices charged.</p>
          </div>

          {/* Feature 6 */}
          <div className="feature-card glass-panel">
            <div className="feature-icon">🚻</div>
            <h3>Clean Restrooms</h3>
            <p>Modern, hygienic onboard restrooms maintained to the highest standards.</p>
          </div>

          {/* Feature 7 */}
          <div className="feature-card glass-panel">
            <div className="feature-icon">🧳</div>
            <h3>Luggage Space</h3>
            <p>Ample storage space for your luggage with secure compartments.</p>
          </div>

          {/* Feature 8 */}
          <div className="feature-card glass-panel">
            <div className="feature-icon">💧</div>
            <h3>Bottled Water</h3>
            <p>Complimentary bottled water provided to keep you hydrated throughout your journey.</p>
          </div>

          {/* Feature 9 */}
          <div className="feature-card glass-panel">
            <div className="feature-icon">🍪</div>
            <h3>Breakfast Service</h3>
            <p>Enjoy delicious cream biscuits served during morning trips for a pleasant start to your day.</p>
          </div>

          {/* Feature 10 */}
          <div className="feature-card glass-panel">
            <div className="feature-icon">🛡️</div>
            <h3>Safety First</h3>
            <p>GPS tracking, seat belts, and experienced drivers ensure your safety.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="why-choose-content glass-panel">
          <div className="why-choose-text">
            <h2>Why Choose Abay Bus?</h2>
            <ul className="why-list">
              <li>
                <span className="check-icon">✓</span>
                <div>
                  <strong>Punctual Service</strong>
                  <p>We value your time - 98% on-time departure rate</p>
                </div>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <div>
                  <strong>Professional Drivers</strong>
                  <p>Experienced, licensed drivers with excellent safety records</p>
                </div>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <div>
                  <strong>24/7 Support</strong>
                  <p>Round-the-clock customer service for your convenience</p>
                </div>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <div>
                  <strong>Easy Booking</strong>
                  <p>Book online in seconds with instant confirmation</p>
                </div>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <div>
                  <strong>Flexible Cancellation</strong>
                  <p>Free cancellation up to 24 hours before departure</p>
                </div>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <div>
                  <strong>Affordable Prices</strong>
                  <p>Competitive rates without compromising on quality</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="why-choose-cta">
            <h3>Ready to Travel?</h3>
            <p>Book your next journey with Abay Bus today!</p>
            <Link to="/routes" className="btn btn-primary btn-lg">Explore Routes</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
