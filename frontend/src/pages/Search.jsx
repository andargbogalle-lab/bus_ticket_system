import { useState, useEffect } from 'react';
import './Search.css';

const Search = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  
  // Dummy data for now, later we'll fetch from backend
  const [buses, setBuses] = useState([
    {
      _id: '1',
      name: 'Abay Express',
      busNumber: 'ET-100',
      origin: 'Addis Ababa',
      destination: 'Hawassa',
      departureTime: '2024-05-10T06:00:00Z',
      price: 450,
      totalSeats: 50
    },
    {
      _id: '2',
      name: 'Selam Bus',
      busNumber: 'SB-200',
      origin: 'Addis Ababa',
      destination: 'Bahir Dar',
      departureTime: '2024-05-10T05:30:00Z',
      price: 600,
      totalSeats: 48
    }
  ]);

  const searchHandler = (e) => {
    e.preventDefault();
    console.log('Search for', origin, destination, date);
    // Fetch buses matching criteria
  };

  return (
    <div className="search-page animate-fade-in">
      <div className="search-header glass-panel">
        <h2>Find Your Bus</h2>
        <form onSubmit={searchHandler} className="search-form">
          <div className="form-group">
            <label>Origin</label>
            <input 
              type="text" 
              placeholder="Leaving from..." 
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Destination</label>
            <input 
              type="text" 
              placeholder="Going to..." 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary search-btn">Search</button>
        </form>
      </div>

      <div className="buses-container">
        <h3>Available Buses</h3>
        <div className="bus-list">
          {buses.map(bus => (
            <div key={bus._id} className="bus-card glass-panel">
              <div className="bus-info">
                <h4>{bus.name} ({bus.busNumber})</h4>
                <p className="route-info">
                  {bus.origin} &rarr; {bus.destination}
                </p>
                <p className="time-info">
                  Departure: {new Date(bus.departureTime).toLocaleString()}
                </p>
              </div>
              <div className="bus-action">
                <p className="price">{bus.price} ETB</p>
                <button className="btn btn-outline">Select Seats</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
