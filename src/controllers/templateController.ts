import { Request, Response } from 'express';
import {SubscriptionPlanModel} from '../models/SubscriptionPlan';
import TemplateService from '../services/TemplateService';

const templateService = new TemplateService();

// GET /api/subscriptions - Get all subscriptions
export const getAllTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await templateService.getAllTemplates();
        res.json({ status: 0, message: "Templates retrieved successfully", data: templates });
    } catch (error) {
        res.status(500).json({ status: 1, message: 'Error fetching templates', error });
    }
};

// GET 
export const getTemplateById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const template = await templateService.getTemplateById(id);
        if (!template) {
            return res.status(404).json({ status: 1, message: 'Template not found' });
        }
        res.json({ status: 0, message: "Template retrieved successfully", data: template });
    } catch (error) {
        res.status(500).json({ status: 1, message: 'Error fetching template', error });
    }
};