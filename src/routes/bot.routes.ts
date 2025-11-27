const { Router } = require('express');
const { 
  saveBotConfig, 
  getBotConfig, 
  startBot, 
  stopBot 
} = require('../controllers/bot.controller');
const { requirePaidUser } = require('../middleware/auth.middleware');

const router = Router();

router.post("/config", requirePaidUser, saveBotConfig);
router.get("/config", requirePaidUser, getBotConfig);
router.post("/start", requirePaidUser, startBot);
router.post("/stop", requirePaidUser, stopBot);

module.exports = router;