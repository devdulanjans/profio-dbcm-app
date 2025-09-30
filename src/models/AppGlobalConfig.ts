import { Schema, model, Document, Types } from "mongoose";

export interface IAppGlobalConfig extends Document {
  _id: Types.ObjectId;
  languages: string[];
  labels: {
    [key: string]: {
      [lang: string]: string;
    };
  };
}

const appGlobalConfigSchema = new Schema<IAppGlobalConfig>({
  languages: [{ type: String }],
  labels: {
    type: Map,
    of: {
      type: Map,
      of: String
    }
  }
});

export default model<IAppGlobalConfig>("AppGlobalConfig", appGlobalConfigSchema, "app_global_config");