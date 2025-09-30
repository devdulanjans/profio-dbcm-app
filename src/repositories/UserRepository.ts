// src/repositories/UserRepository.ts
import User from "../models/User";
import { UserDto } from "../dtos/UserDto";
import { UserCreateDto } from "../dtos/UserUpdateDto";
import { IUser } from "../models/User";

export default class UserRepository {
  public async findAll() {
    return User.find().lean();
  }

  public async findById(id: string) {
    return User.findById(id);
  }

  public static async findUserByAuth0Id(auth0Id: string) {
    return User.findOne({ auth0Id });
  }

  public async findByShareUrlName(shareUrlName: string) {
    return User.findOne({ shareURLName: shareUrlName });
  }

  public async getSubscriptionIdByUserId(userId: string): Promise<string | null> {
    const user = await User.findById(userId).select('subscriptionId');
    return user && user.subscriptionId !== undefined ? user.subscriptionId : null;
  }

  public static async create(data: UserDto): Promise<IUser> {
    const user = new User(data);
    return user.save();
  }

  public async update(id: string, data: Partial<IUser>): Promise<IUser | null>{
    return User.findByIdAndUpdate(id, data);
  }

  public async delete(id: string) {
    return User.findByIdAndDelete(id);
  }
}
