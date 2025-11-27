import { Router } from "express";
import { loginUser, signupUser } from "../controllers/auth.controller";
const router = Router();
router.post("/login", loginUser);
router.post("/signup", signupUser);
// router.get("/profile", requireAuth, getUserProfile);
export default router;
//# sourceMappingURL=auth.routes.js.map