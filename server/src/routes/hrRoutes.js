import express from 'express';
import { getDashboardStats, getClinics, requestLeave } from '../controllers/hrController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/clinics', protect, getClinics);
router.post('/leaves', protect, requestLeave);

export default router;
