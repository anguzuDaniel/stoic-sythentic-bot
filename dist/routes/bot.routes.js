import { Router } from "express";
import { saveBotConfig } from "../controllers/bot.controller";
import { getBotConfig } from "../config/getBotConfig";
import { startBot } from "../config/startBot";
import { stopBot } from "../config/stopBot";
import { requirePaidUser } from "../middleware/authMiddleware";
const router = Router();
router.post("/config", requirePaidUser, saveBotConfig);
router.get("/config", requirePaidUser, getBotConfig);
router.post("/start", requirePaidUser, startBot);
router.post("/stop", requirePaidUser, stopBot);
export default router;
//# sourceMappingURL=bot.routes.js.map