import Bus from '../models/busModel.js';

// @desc    Fetch all active buses (public schedule)
// @route   GET /api/buses
// @access  Public
export const getBuses = async (req, res) => {
  try {
    const { origin, destination, date } = req.query;

    let query = { status: 'active' };
    if (origin) query.origin = { $regex: origin, $options: 'i' };
    if (destination) query.destination = { $regex: destination, $options: 'i' };

    if (date) {
      const searchDate = new Date(date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);

      query.departureTime = {
        $gte: searchDate,
        $lt: nextDate,
      };
    }

    const buses = await Bus.find(query).sort({ departureTime: 1 });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single bus by ID
// @route   GET /api/buses/:id
// @access  Public
export const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (bus) {
      res.json(bus);
    } else {
      res.status(404).json({ message: 'Bus not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a bus
// @route   POST /api/buses
// @access  Private (operator, admin)
export const createBus = async (req, res) => {
  try {
    const {
      busNumber,
      origin,
      destination,
      departureTime,
      arrivalTime,
      price,
      totalSeats,
      busType,
    } = req.body;

    const busExists = await Bus.findOne({ busNumber });
    if (busExists) {
      return res.status(400).json({ message: 'Bus number already exists' });
    }

    // Generate seats
    const seats = [];
    for (let i = 1; i <= totalSeats; i++) {
      seats.push({ seatNumber: String(i), isBooked: false });
    }

    const bus = await Bus.create({
      busNumber,
      origin,
      destination,
      departureTime,
      arrivalTime,
      price,
      totalSeats,
      busType: busType || 'standard',
      seats,
      operator: req.user._id,
    });

    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a bus
// @route   PUT /api/buses/:id
// @access  Private (operator, admin)
export const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    const fields = ['busNumber', 'origin', 'destination', 'departureTime', 'arrivalTime', 'price', 'totalSeats', 'busType', 'status'];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        bus[field] = req.body[field];
      }
    });

    // If totalSeats changed, regenerate seats
    if (req.body.totalSeats && req.body.totalSeats !== bus.seats.length) {
      const seats = [];
      for (let i = 1; i <= req.body.totalSeats; i++) {
        const existingSeat = bus.seats.find((s) => s.seatNumber === String(i));
        seats.push({
          seatNumber: String(i),
          isBooked: existingSeat ? existingSeat.isBooked : false,
        });
      }
      bus.seats = seats;
    }

    const updatedBus = await bus.save();
    res.json(updatedBus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a bus
// @route   DELETE /api/buses/:id
// @access  Private (operator, admin)
export const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    await Bus.deleteOne({ _id: bus._id });
    res.json({ message: 'Bus removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
