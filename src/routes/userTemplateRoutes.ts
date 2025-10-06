import { Router } from "express";
import { getTemplateByUserId, assignTemplateToUser, deleteTemplateFromUser, getUserAndTemplateByIds, shareTemplate, updateViewCount } from "../controllers/userTemplateController";

const router = Router();

router.get("/:userId", getTemplateByUserId);
router.get("/:userId/:templateId", getUserAndTemplateByIds);

router.post("/:userId/:templateId", assignTemplateToUser);
router.delete("/:userId/:templateId", deleteTemplateFromUser);

router.post("/share", shareTemplate);
router.put("/view_count/:userId/:templateId", updateViewCount);

export default router;
