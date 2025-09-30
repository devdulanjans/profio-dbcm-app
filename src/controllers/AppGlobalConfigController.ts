import { Request, Response } from "express";
import AppGlobalConfigService from "../services/AppGlobalConfigService";

const service = new AppGlobalConfigService();

export class AppGlobalConfigController {

  async getAppGlobalConfig(req: Request, res: Response) {
    const config = await service.getAppGlobalConfig();
    res.json({ status: 0, message: "App global config retrieved successfully", data: config });
  }
}
