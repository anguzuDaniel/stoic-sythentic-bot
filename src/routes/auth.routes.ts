import { Router } from "express";
const { loginUser, signupUser } = require("../controllers/auth.controller");

const router = Router();

router.post("/login", loginUser);
router.post("/signup", signupUser);
// router.get("/profile", requireAuth, getUserProfile);

module.exports = router;
