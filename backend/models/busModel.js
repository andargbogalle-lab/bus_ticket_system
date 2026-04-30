import mongoose from 'mongoose';

const seatSchema = mongoose.Schema({
  seatNumber: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
});

const busSchema = mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: true,
      unique: true,
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    busType: {
      type: String,
      enum: ['standard', 'luxury', 'minibus'],
      default: 'standard',
    },
    seats: [seatSchema],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    // Operator who manages this bus
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Bus = mongoose.model('Bus', busSchema);

export default Bus;
