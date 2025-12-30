import { Request, Response } from "express";
import { PublicService } from "../services/PublicService";

const service = new PublicService();

export class PublicController {
  // Public → view shared template with filled data
  async viewTemplate(req: Request, res: Response) {
    try {
      const { shareUrlName, templateCode, language } = req.params;

      if (!shareUrlName || !templateCode) {
        return res
          .status(400)
          .send("Share URL name and template code are required.");
      }

      const filledHtml = await service.viewSharedTemplate(
        shareUrlName,
        templateCode,
        language
      );

      if (!filledHtml) {
        return res.status(404).send("Template not found.");
      }

      console.log(`Filled HTML for ${shareUrlName}:`, filledHtml);

      res.send(filledHtml); // send HTML to render directly
    } catch (err: any) {
      res.status(404).send(err.message);
    }
  }

  async viewTemplateNew(req: Request, res: Response) {
    try {
      console.log("viewTemplateNew called with params:", req.params);
      const { shareUrlName, templateCode } = req.params;

      if (!shareUrlName || !templateCode) {
        return res
          .status(400)
          .send("Share URL name and template code are required.");
      }

      const filledHtml = await service.viewSharedTemplateNew(
        shareUrlName,
        templateCode
      );

      if (!filledHtml) {
        return res.status(404).send("Template not found.");
      }

      console.log(`Filled HTML for ${shareUrlName}:`, filledHtml);

      res.send(filledHtml); // send HTML to render directly
    } catch (err: any) {
      res.status(404).send(err.message);
    }
  }

  async deactivateUser(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ status: 1, message: "Missing email" });
      }

      const result = await service.deactivateUserByEmail(email);
      res.json({ status: 0, message: "User deactivated successfully" });
    } catch (err: any) {
      res.status(500).json({ status: 1, message: err.message });
    }
  }
}
