import express from 'express';
import {
  getBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
} from '../controllers/busController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getBuses);
router.get('/:id', getBusById);

// Protected (operator, admin)
router.post('/', protect, authorize('operator', 'admin'), createBus);
router.put('/:id', protect, authorize('operator', 'admin'), updateBus);
router.delete('/:id', protect, authorize('operator', 'admin'), deleteBus);

export default router;
