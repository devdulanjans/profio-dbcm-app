import { Router } from "express";
import { AccessController } from "../controllers/AccessController";

const router = Router();
const controller = new AccessController();

// Get access config
router.post("/signup", controller.signUp);

export default router;
