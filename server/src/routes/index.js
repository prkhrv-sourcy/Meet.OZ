import { Router } from 'express';
import agoraRoutes from './agora.js';
import meetingRoutes from './meetings.js';
import aiRoutes from './ai.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/agora', agoraRoutes);
router.use('/meetings', meetingRoutes);
router.use('/ai', aiRoutes);

export default router;
