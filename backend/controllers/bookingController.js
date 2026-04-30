import Booking from '../models/bookingModel.js';
import Bus from '../models/busModel.js';

// Generate unique booking reference
const generateBookingRef = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AB-${dateStr}-${rand}`;
};

// @desc    Create a booking (public — customer books online)
// @route   POST /api/bookings
// @access  Public
export const createBooking = async (req, res) => {
  try {
    const { busId, seatNumbers, passengerName, phone, address, paymentMethod } = req.body;

    // Validate required fields
    if (!busId || !seatNumbers || !passengerName || !phone || !address || !paymentMethod) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['card', 'mobile_banking'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Payment method must be card or mobile_banking' });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Check if seats are available
    for (const seatNum of seatNumbers) {
      const seat = bus.seats.find((s) => s.seatNumber === seatNum);
      if (!seat) {
        return res.status(400).json({ message: `Seat ${seatNum} does not exist` });
      }
      if (seat.isBooked) {
        return res.status(400).json({ message: `Seat ${seatNum} is already booked` });
      }
    }

    // Mark seats as booked
    seatNumbers.forEach((seatNum) => {
      const seat = bus.seats.find((s) => s.seatNumber === seatNum);
      seat.isBooked = true;
    });
    await bus.save();

    const totalPrice = bus.price * seatNumbers.length;

    const booking = await Booking.create({
      bookingRef: generateBookingRef(),
      bus: bus._id,
      passengerName,
      phone,
      address,
      seatNumbers,
      totalPrice,
      paymentMethod,
      isPaid: true,
      paidAt: Date.now(),
    });

    // Populate bus info for the receipt
    const populatedBooking = await Booking.findById(booking._id).populate(
      'bus',
      'busNumber origin destination departureTime arrivalTime price busType'
    );

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by reference (for receipt reprint)
// @route   GET /api/bookings/ref/:ref
// @access  Public
export const getBookingByRef = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingRef: req.params.ref }).populate(
      'bus',
      'busNumber origin destination departureTime arrivalTime price busType'
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Agent creates booking on behalf of walk-in customer
// @route   POST /api/bookings/agent
// @access  Private (agent, admin)
export const agentCreateBooking = async (req, res) => {
  try {
    const { busId, seatNumbers, passengerName, phone, address, paymentMethod } = req.body;

    if (!busId || !seatNumbers || !passengerName || !phone || !address || !paymentMethod) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Check seats
    for (const seatNum of seatNumbers) {
      const seat = bus.seats.find((s) => s.seatNumber === seatNum);
      if (!seat) {
        return res.status(400).json({ message: `Seat ${seatNum} does not exist` });
      }
      if (seat.isBooked) {
        return res.status(400).json({ message: `Seat ${seatNum} is already booked` });
      }
    }

    // Mark seats
    seatNumbers.forEach((seatNum) => {
      const seat = bus.seats.find((s) => s.seatNumber === seatNum);
      seat.isBooked = true;
    });
    await bus.save();

    const totalPrice = bus.price * seatNumbers.length;

    const booking = await Booking.create({
      bookingRef: generateBookingRef(),
      bus: bus._id,
      passengerName,
      phone,
      address,
      seatNumbers,
      totalPrice,
      paymentMethod,
      isPaid: true,
      paidAt: Date.now(),
      bookedBy: req.user._id,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('bus', 'busNumber origin destination departureTime arrivalTime price busType')
      .populate('bookedBy', 'fullName username');

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (admin, agent)
// @route   GET /api/bookings
// @access  Private (admin, agent)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('bus', 'busNumber origin destination departureTime arrivalTime price')
      .populate('bookedBy', 'fullName username')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (admin, agent)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Free up the seats
    const bus = await Bus.findById(booking.bus);
    if (bus) {
      booking.seatNumbers.forEach((seatNum) => {
        const seat = bus.seats.find((s) => s.seatNumber === seatNum);
        if (seat) seat.isBooked = false;
      });
      await bus.save();
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking stats (admin)
// @route   GET /api/bookings/stats
// @access  Private (admin)
export const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ status: { $ne: 'cancelled' } });
    const totalRevenue = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' }, isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    // Today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      status: { $ne: 'cancelled' },
    });

    const todayRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: { $ne: 'cancelled' },
          isPaid: true,
        },
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    res.json({
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayBookings,
      todayRevenue: todayRevenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
