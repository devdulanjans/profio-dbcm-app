import { Request, Response } from "express";
import { ContactService } from "../services/ContactService";
import { log } from "console";

const service = new ContactService();

export class ContactController {
  
  async saveContact(req: Request, res: Response, next: Function) {
    try {
      const auth0Id = (req as any).auth.sub; // Auth0 user ID

      if (!auth0Id) {
        return res.status(401).json({ status: "Error", message: "Unauthorized: user.sub not found" });
      }

      const { profileId, userId, templateId } = req.body;

      if (!profileId || !userId || !templateId) {
        return res.status(400).json({ status: "Error", message: "Bad Request: Missing required fields" });
      }

      const contact = await service.saveContact(userId, profileId, auth0Id, templateId);

      res.json({ status: 0, message: "Contact saved successfully", data: contact });

    } catch (err: any) {
      log("Error in saveContact:", err);
      next(err);
    }
  }

  async saveContactBidirectional(req: Request, res: Response) {
    // try {
    //   const { profileId, userId, templateId } = req.body;
    //   const contact = await service.saveContact(userId, profileId, templateId);
    //   res.json(contact);
    // } catch (err: any) {
    //   res.status(400).json({ error: err.message });
    // }
  }

  async getContacts(req: Request, res: Response, next: Function) {
    try {
      const auth0Id = (req as any).auth.sub; // Auth0 user ID

      if (!auth0Id) {
        return res.status(401).json({ status: "Error", message: "Unauthorized: user.sub not found" });
      }

      const userId = req.params.id;

      if (!userId) {
        return res.status(400).json({ status: "Error", message: "Bad Request: Missing userId parameter" });
      }

      const contacts = await service.getContacts(userId, auth0Id);

      res.json({ status: 0, message: "Contacts retrieved successfully", data: contacts });

    } catch (err: any) {
      log("Error in getContacts:", err);
      next(err);
    }
  }

  async removeContact(req: Request, res: Response, next: Function) {
    try {
      const auth0Id = (req as any).auth.sub; // Auth0 user ID

      if (!auth0Id) {
        return res.status(401).json({ status: "Error", message: "Unauthorized: user.sub not found" });
      }

      const contactId = req.params.id;

      if (!contactId) {
        return res.status(400).json({ status: "Error", message: "Bad Request: Missing contactId parameter" });
      }

      await service.removeContact(contactId, auth0Id);

      res.json({ status: 0, message: "Contact removed successfully" });

    } catch (err: any) {
      log("Error in removeContact:", err);
      next(err);
    }
  }

  async checkSaved(req: Request, res: Response, next: Function) {
    try {
      console.log("checkSaved called");
      const auth0Id = (req as any).auth?.sub; // Auth0 user ID
      if (!auth0Id) {
        return res.status(401).json({ status: "Error", message: "Unauthorized: user.sub not found" });
      }
      const { profileId, userId } = req.body;
      const isSaved = await service.checkSaved(userId, profileId, auth0Id);
      res.json({ status: 0, message: "Status retrieved successfully", isSaved: !!isSaved });
    } catch (err: any) {
      next(err);
    }
  }
}
