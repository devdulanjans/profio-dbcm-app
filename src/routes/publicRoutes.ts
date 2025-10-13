import { Router } from "express";
import { PublicController } from "../controllers/publicController";

const router = Router();
const controller = new PublicController();

router.get("/:language/:shareUrlName/:templateCode", controller.viewTemplate);

export default router;
