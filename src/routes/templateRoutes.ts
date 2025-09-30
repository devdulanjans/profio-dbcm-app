import { Router } from "express";
import { getAllTemplates, getTemplateById } from "../controllers/templateController";
import { get } from "http";

const router = Router();

router.get("/", getAllTemplates);
router.get("/:id", getTemplateById);

export default router;
