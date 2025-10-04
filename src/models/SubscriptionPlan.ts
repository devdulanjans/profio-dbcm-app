import { Schema, model, Document, ObjectId } from "mongoose";

export interface ISubscriptionPlan extends Document {
    _id: string; // UUID or BIGINT
    code: string; // Subscription code (max 100 chars)
    name: string; // Subscription name (max 150 chars)
    description: string; // Short description
    card_template_limit?: number; // Max card templates allowed
    language_limit?: number; // Max languages allowed
    document_upload_limit?: number; // Max document uploads allowed
    isShowPremiumBadge?: boolean; // Show premium badge or not
    isShowProfileClickCount?: boolean; // Show profile click count or not
    is_active: boolean; // Availability status
    created_at: Date; // Creation timestamp
    updated_at: Date; // Last updated timestamp
    amount?: number; // Subscription amount
    currencyCode?: string; // Currency code (e.g., USD, EUR)
}

const subscriptionSchema = new Schema<ISubscriptionPlan>({
    code: { type: String, required: true, unique: true, maxlength: 100 },
    name: { type: String, required: true, maxlength: 150 },
    description: { type: String, required: true },
    card_template_limit: { type: Number, required: true },
    language_limit: { type: Number, required: true },
    document_upload_limit: { type: Number, required: true },
    isShowPremiumBadge: { type: Boolean, default: true },
    isShowProfileClickCount: { type: Boolean, default: true },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    currencyCode: { type: String, required: true },
});

export const SubscriptionPlanModel = model<ISubscriptionPlan>("SubscriptionPlan", subscriptionSchema, "subscription_plan");