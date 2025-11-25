import { Request, Response } from "express";
import { SubscriptionPlanModel } from "../models/SubscriptionPlan";
import TemplateService from "../services/TemplateService";

const templateService = new TemplateService();
export class TemplateController {
  // GET /api/subscriptions - Get all subscriptions
  async getAllTemplates(req: Request, res: Response) {
    try {
      const templates = await templateService.getAllTemplates();
      res.json({
        status: 0,
        message: "Templates retrieved successfully",
        data: templates,
      });
    } catch (error) {
      res
        .status(500)
        .json({ status: 1, message: "Error fetching templates", error });
    }
  }

  async getAllTemplatesWithDetails(req: Request, res: Response) {
    try {
      // get logged in user from request context
      const loggedInUid = (req as any).user?.uid;
      console.log("Logged in UID:", loggedInUid);
      if (!loggedInUid) {
        return res.status(400).json({ status: 1, message: "Unauthorized" });
      }

      const language = (req.query.language as string) || "en";

      const templates = await templateService.getAllTemplatesWithDetails(
        loggedInUid,
        language
      );
      res.json({
        status: 0,
        message: "Templates retrieved successfully",
        data: templates,
      });
    } catch (error) {
      res
        .status(500)
        .json({ status: 1, message: "Error fetching templates", error });
    }
  }

  // GET
  async getTemplateById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const template = await templateService.getTemplateById(id);
      if (!template) {
        return res
          .status(404)
          .json({ status: 1, message: "Template not found" });
      }
      res.json({
        status: 0,
        message: "Template retrieved successfully",
        data: template,
      });
    } catch (error) {
      res
        .status(500)
        .json({ status: 1, message: "Error fetching template", error });
    }
  }
}
