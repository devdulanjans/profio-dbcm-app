import AppGlobalConfigRepo from "../repositories/AppGlobalConfigRepository";
import UserRepository from "../repositories/UserRepository";
import SubscriptionRepository from "../repositories/SubscriptionPlanRepository";
import { UserDto } from "../dtos/UserDto"; // Adjust the path as needed

class AccessService {
  private repo = new UserRepository();

  async signUp( uid : string, email: string) {
    // check existance
    const existingUser = await this.repo.findUserByEmailOrUid(email, uid);

    if (existingUser) {
      throw new Error("User with this email or UID already exists");
    }

    // Create new user if not exists
    console.log("Creating new user with UID:", uid);

    const subscriptionCode = "FREE";
    let subscription = await SubscriptionRepository.findBySubscriptionCode(subscriptionCode);
    let subscriptionId = "";

    if (!subscription) {
      console.error(`No subscription found with code: ${subscriptionCode}`);
    } else {
      subscriptionId = subscription._id;
    }

    const userToCreate: UserDto = { uid: uid, email: email, isDeleted: false, createdAt: new Date(), updatedAt: new Date(), subscriptionId: subscriptionId, languageSubscriptionList: ["en"] };
    const createdUser = await UserRepository.create(userToCreate);

    return createdUser;
  }
}

export default AccessService;
