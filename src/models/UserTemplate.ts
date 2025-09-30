import { Schema, model, Document } from "mongoose";

export interface IUserTemplate extends Document {
    _id: string; // UUID or BIGINT
    user_id: string; // Reference to users.id
    template_id: string; // Reference to templates.id
    view_count?: number; // Number of times the template has been viewed
    created_at: Date;
    updated_at: Date;
}

const userTemplateSchema = new Schema<IUserTemplate>({
    user_id: { type: String, required: true },
    template_id: { type: String, required: true },
    view_count: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export const UserTemplateModel = model<IUserTemplate>("UserTemplate", userTemplateSchema, "user_template");
