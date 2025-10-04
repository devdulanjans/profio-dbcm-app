import AppGlobalConfigRepo from "../repositories/AppGlobalConfigRepository";
import UserRepository from "../repositories/UserRepository";
import SubscriptionRepository from "../repositories/SubscriptionPlanRepository";
import { UserDto } from "../dtos/UserDto"; // Adjust the path as needed
import { sendWelcomeEmail } from "../utils/SendEmail"; // Adjust the path as needed

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

    const payload = {
      email: createdUser.email,
    }
    await sendWelcomeEmail(email, payload);

    return createdUser;
  }

  async deactivateUser(userId: string, uid: string, loggedInUid: string) {
    if (uid !== loggedInUid) {
      throw new Error("Unauthorized: UID mismatch");
    }

    const user = await this.repo.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    if (user.isDeleted) {
      throw new Error("User is already deactivated");
    }

    if (user.uid !== uid) {
      throw new Error("UID does not match the user record");
    }

    user.isDeleted = true;
    user.updatedAt = new Date();
    await this.repo.update(userId, user);
    return true;
  }
}

export default AccessService;
