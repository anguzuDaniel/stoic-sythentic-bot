const { Router } = require('express');
const { 
  saveBotConfig, 
  getBotConfig, 
  startBot, 
  stopBot,
  getBotStatus,
  forceTrade
} = require('../controllers/bot.controller');
const { requirePaidUser } = require('../middleware/auth.middleware');

const router = Router();

router.post("/config",  saveBotConfig);
router.get("/config",  getBotConfig);
router.post("/start",  startBot);
router.post("/stop", stopBot);
router.get("/status", getBotStatus);
router.post("/force-trade", forceTrade);

module.exports = router;