import { SharedLink, ISharedLink } from "../models/SharedLinks";

export default class SharedLinkRepository {
  public async create(sharedLink: Partial<ISharedLink>): Promise<ISharedLink> {
    return await SharedLink.create(sharedLink);
  }

  public async findByToken(token: string): Promise<ISharedLink | null> {
    return await SharedLink.findOne({ token });
  }
}
