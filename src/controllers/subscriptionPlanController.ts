import { Request, Response } from 'express';
import {SubscriptionPlanModel} from '../models/SubscriptionPlan';
import SubscriptionPlanService from '../services/SubscriptionPlanService';

const subscriptionPlanService = new SubscriptionPlanService();

export const getAllSubscriptions = async (req: Request, res: Response) => {
    try {
        const subscriptions = await subscriptionPlanService.getAllSubscriptions();
        res.json({ status: 0, message: "Subscriptions retrieved successfully", data: subscriptions });
    } catch (error) {
        res.status(500).json({ status: "Error", message: 'Error fetching subscriptions', error });
    }
};

export const getSubscriptionById = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ status: "Error", message: "Bad Request: Missing id parameter" });
    }

    try {
        const subscription = await subscriptionPlanService.getSubscriptionById(id);

        if (!subscription) {
            return res.status(404).json({ status: "Error", message: 'Subscription not found' });
        }

        res.json({ status: 0, message: "Subscription retrieved successfully", data: subscription });

    } catch (error) {
        res.status(500).json({ status: 1, message: 'Error fetching subscription', error });
    }
};

// GET /api/subscriptions/:code - Get subscription by code
export const getSubscriptionByCode = async (req: Request, res: Response) => {
    const { code } = req.params;

    if (!code) {
        return res.status(400).json({ status: 1, message: "Bad Request: Missing code parameter" });
    }

    try {
        const subscription = await subscriptionPlanService.getSubscriptionByCode(code);

        if (!subscription) {
            return res.status(404).json({ status: 1, message: 'Subscription not found' });
        }

        res.json({ status: 0, message: "Subscription retrieved successfully", data: subscription });
        
    } catch (error) {
        res.status(500).json({ status: "Error", message: 'Error fetching subscription', error });
    }
};