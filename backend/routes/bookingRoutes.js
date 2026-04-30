import express from 'express';
import {
  createBooking,
  getBookingByRef,
  agentCreateBooking,
  getAllBookings,
  cancelBooking,
  getBookingStats,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.post('/', createBooking);
router.get('/ref/:ref', getBookingByRef);

// Protected
router.get('/stats', protect, authorize('admin'), getBookingStats);
router.get('/', protect, authorize('admin', 'agent'), getAllBookings);
router.post('/agent', protect, authorize('agent', 'admin'), agentCreateBooking);
router.put('/:id/cancel', protect, authorize('admin', 'agent'), cancelBooking);

export default router;
