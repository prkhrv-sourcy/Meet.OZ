import { Router } from 'express';
import Meeting from '../models/Meeting.js';

const router = Router();

function generateCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const segment = () => Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment()}-${segment()}-${segment()}`;
}

// Create meeting
router.post('/', async (req, res, next) => {
  try {
    const { title, hostName } = req.body;
    const code = generateCode();
    const meeting = await Meeting.create({
      code,
      title: title || 'Untitled Meeting',
      hostName: hostName || 'Host',
      status: 'waiting',
      startTime: new Date(),
    });
    res.status(201).json(meeting);
  } catch (err) {
    next(err);
  }
});

// Get meeting by code
router.get('/:code', async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ code: req.params.code });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (err) {
    next(err);
  }
});

// Join meeting
router.put('/:code/join', async (req, res, next) => {
  try {
    const { participantId, name } = req.body;
    const meeting = await Meeting.findOneAndUpdate(
      { code: req.params.code },
      {
        $push: { participants: { id: participantId, name, joinedAt: new Date() } },
        $set: { status: 'active' },
      },
      { new: true }
    );
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (err) {
    next(err);
  }
});

// End meeting
router.put('/:code/end', async (req, res, next) => {
  try {
    const meeting = await Meeting.findOneAndUpdate(
      { code: req.params.code },
      { $set: { status: 'ended', endTime: new Date() } },
      { new: true }
    );
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (err) {
    next(err);
  }
});

// Batch-store emotion snapshots
router.post('/:code/emotions', async (req, res, next) => {
  try {
    const { snapshots } = req.body;
    if (!Array.isArray(snapshots)) return res.status(400).json({ error: 'snapshots array required' });

    const meeting = await Meeting.findOneAndUpdate(
      { code: req.params.code },
      { $push: { emotionSnapshots: { $each: snapshots } } },
      { new: true }
    );
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ count: snapshots.length });
  } catch (err) {
    next(err);
  }
});

// Append transcript segments
router.post('/:code/transcript', async (req, res, next) => {
  try {
    const { segments } = req.body;
    if (!Array.isArray(segments)) return res.status(400).json({ error: 'segments array required' });

    const meeting = await Meeting.findOneAndUpdate(
      { code: req.params.code },
      { $push: { transcript: { $each: segments } } },
      { new: true }
    );
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ count: segments.length });
  } catch (err) {
    next(err);
  }
});

// Paginated meeting history
router.get('/history/list', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [meetings, total] = await Promise.all([
      Meeting.find({ status: 'ended' })
        .sort({ endTime: -1 })
        .skip(skip)
        .limit(limit)
        .select('code title hostName participants startTime endTime emotionSnapshots'),
      Meeting.countDocuments({ status: 'ended' }),
    ]);

    res.json({ meetings, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// Full analytics data
router.get('/:code/analytics', async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ code: req.params.code });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (err) {
    next(err);
  }
});

export default router;
