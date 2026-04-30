import mongoose from 'mongoose';

const bookingSchema = mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true,
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Bus',
    },
    // Guest passenger info (no account required)
    passengerName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    seatNumbers: [
      {
        type: String,
        required: true,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'mobile_banking'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed',
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    // If booked by an agent on behalf of customer
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
