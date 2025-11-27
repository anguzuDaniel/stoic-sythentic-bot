import { Router } from "express";
import { getUserProfile, updatePlan } from "../controllers/user.controller";
const router = Router();
router.get("/profile", getUserProfile);
router.post("/update-plan", updatePlan);
export default router;
//# sourceMappingURL=user.routes.js.map