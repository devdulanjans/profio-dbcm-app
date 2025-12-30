import { Schema, model, Document, ObjectId } from "mongoose";

export interface ITemplate extends Document {
    _id: string; // UUID or BIGINT
    template_code: string; // Unique code for the template
    name: string; // Template name (max 150 chars)
    description: string; // Short description
    html_content?: string; // HTML content of the template
    public_html_content?: string; // Public HTML content of the template
    preview_image: string; // URL to preview image
    placeholders: Map<string, string>; // JSON structure of placeholders
    is_active: boolean; // Availability status
    created_at: Date; // Creation timestamp
    updated_at: Date; // Last updated timestamp
}

const templateSchema = new Schema<ITemplate>({
    name: { type: String, required: true, maxlength: 150 },
    template_code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    html_content: { type: String, required: false },
    public_html_content: { type: String, required: false },
    preview_image: { type: String, required: true },
    placeholders: { type: Map, of: String, required: true },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export const TemplateModel = model<ITemplate>("Template", templateSchema, "template");