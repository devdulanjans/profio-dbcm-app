import AppGlobalConfigRepo from "../repositories/AppGlobalConfigRepository";

class AppGlobalConfigService {
  private repo = new AppGlobalConfigRepo();

  async getAppGlobalConfig() {
    return await this.repo.findAll();
  }
}

export default AppGlobalConfigService;
