import { Request, Response } from 'express';
import UserTemplateService from '../services/UserTemplateService';

const templateService = new UserTemplateService();

export const getTemplateByUserId = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const template = await templateService.getTemplateDetailsByUserId(userId);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json(template);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching template', error });
    }
};

export const getUserAndTemplateByIds = async (req: Request, res: Response) => {
    const { userId, templateId } = req.params;
    try {
        const template = await templateService.getDetailsByUserIdAndTemplateId(userId, templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json(template);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching template', error });
    }
};

export const assignTemplateToUser = async (req: Request, res: Response) => {
    const { userId, templateId } = req.params;
    try {
        const result = await templateService.assignTemplateToUser(userId, templateId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Error assigning template' });
    }
};

export const deleteTemplateFromUser = async (req: Request, res: Response) => {
    const { userId, templateId } = req.params;
    try {
        const result = await templateService.deleteTemplateFromUser(userId, templateId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting template', error });
    }
};

export const shareTemplate = async (req: Request, res: Response) => {
    try {
      const ownerUid = (req as any).user.uid;

      if (!ownerUid) {
        return res.status(400).json({ status: "error", message: "Owner UID is required." });
      }

      const { templateId, userId, language } = req.body;

      if (!templateId || !userId) {
        return res.status(400).json({ status: "error", message: "Template ID and User ID are required." });
      }

      const link = await templateService.shareTemplate(ownerUid, templateId, userId, language);

      res.json({ status: 0 , message:"Template shared successfully", link });

    } catch (err: any) {
      res.status(400).json({ status: 1, message: err.message });
    }
  }

export const updateViewCount = async (req: Request, res: Response) => {
    const { userId, templateId } = req.params;
    try {
        const result = await templateService.incrementViewCount(userId, templateId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error updating view count', error });
    }   
};
