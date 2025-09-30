import AppGlobalConfig from "../models/AppGlobalConfig";

export default class AppGlobalConfigRepository {

  public async findAll() {
    return await AppGlobalConfig.find();
  }
}