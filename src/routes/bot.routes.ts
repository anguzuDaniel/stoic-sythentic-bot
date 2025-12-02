const { Router } = require('express');
const { 
  saveBotConfig, 
  getBotConfig, 
  startBot, 
  stopBot,
  getBotStatus,
  forceTrade
} = require('../controllers/bot.controller');
const { authenticateToken, requirePaidUser } = require('../middleware/auth.middleware');

const router = Router();

router.post("/config", authenticateToken, saveBotConfig);
router.get("/config", authenticateToken, getBotConfig);
router.post("/start",authenticateToken, startBot);
router.post("/stop", authenticateToken, stopBot);
router.get("/status", authenticateToken, getBotStatus);
router.post("/force-trade", authenticateToken, forceTrade);

module.exports = router;