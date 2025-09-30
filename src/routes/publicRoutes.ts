import { Router } from "express";
import { PublicController } from "../controllers/publicController";

const router = Router();
const controller = new PublicController();

router.get("/:shareUrlName/:templateCode/:language", controller.viewTemplate);

export default router;
