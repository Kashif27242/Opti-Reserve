import express from "express";
import { ensureAuthenticated } from "#middleware/authMiddleware.js";
import UserPanelController from "#controllers/UserPanelController.js";

const router = express.Router();

router.get("/welcome", UserPanelController.showWelcome);
router.get("/contact", UserPanelController.showContact);
router.get("/user/resources", UserPanelController.showUserResources);
router.get("/user/resources/:id", UserPanelController.showResourceDetails);
export default router;
