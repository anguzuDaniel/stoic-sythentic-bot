import { Router } from "express";
const { getUserProfile, updatePlan } = require("../controllers/user.controller");

const router = Router();

router.get("/profile", getUserProfile);
router.post("/update-plan", updatePlan);

module.exports = router;
