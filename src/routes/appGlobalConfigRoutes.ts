import { Router } from "express";
import { AppGlobalConfigController } from "../controllers/AppGlobalConfigController";

const router = Router();
const controller = new AppGlobalConfigController();

// Get app global config
router.get("/", controller.getAppGlobalConfig);

export default router;
