import express from 'express'
let mockTime = null;

const router = express.Router()

// POST /api/test/set-time { time: "2026-05-10T09:45:00.000Z" }
router.post('/set-time', (req, res) => {
  const { time } = req.body;
  if (!time) {
    mockTime = null;
    return res.json({ success: true, message: 'Clock reset to system time' });
  }
  
  const date = new Date(time);
  if (isNaN(date.getTime())) {
    return res.status(400).json({ success: false, error: 'Invalid date format' });
  }
  
  mockTime = date;
  console.log(`[TEST] System time mocked to: ${date.toISOString()}`);
  res.json({ success: true, message: `System time mocked to ${date.toLocaleString()}` });
});

// GET /api/test/get-time
router.get('/get-time', (req, res) => {
  res.json({ 
    success: true, 
    currentTime: mockTime ? mockTime.toISOString() : new Date().toISOString(),
    isMocked: !!mockTime 
  });
});

export const getMockTime = () => mockTime;
export default router;