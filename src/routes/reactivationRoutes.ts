import { Router } from "express";
import { ReactivationController } from "../controllers/ReactivationController";

const router = Router();
const controller = new ReactivationController();

router.post("/reactivate", controller.reactivateUser);

export default router;
