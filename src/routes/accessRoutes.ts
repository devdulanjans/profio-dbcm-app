import { Router } from "express";
import { AccessController } from "../controllers/AccessController";

const router = Router();
const controller = new AccessController();

// Get access config
router.post("/signup", controller.signUp);
router.post("/deactivate", controller.deactivateUser);

export default router;
