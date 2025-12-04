const { Router } = require('express');
const { authenticateToken, requirePaidUser } = require('../middleware/auth.middleware');
const forceTrade = require('../controllers/bot/forceTrade');
const startBot = require('../controllers/bot/startBot');

const router = Router();

router.post("/config", authenticateToken, saveBotConfig);
router.get("/config", authenticateToken, getBotConfig);
router.post("/start",authenticateToken, startBot);
router.post("/stop", authenticateToken, stopBot);
router.get("/status", authenticateToken, getBotStatus);
router.post("/force-trade", authenticateToken, forceTrade);

module.exports = router;