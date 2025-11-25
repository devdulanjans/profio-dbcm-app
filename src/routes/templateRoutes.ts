import { Router } from "express";
import { TemplateController } from "../controllers/templateController";
import { get } from "http";

const router = Router();
const controller = new TemplateController();

router.get("/", controller.getAllTemplates);
router.get("/all", controller.getAllTemplatesWithDetails);
router.get("/:id", controller.getTemplateById);

export default router;
