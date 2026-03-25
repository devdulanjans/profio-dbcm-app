import UserRepository from "../repositories/UserRepository";

class ReactivationService {
  private repo = new UserRepository();

  async reactivateUser(uid: string, loggedInUid: string) {
    if (uid !== loggedInUid) {
      throw new Error("Unauthorized: UID mismatch");
    }

    const user = await this.repo.findUserByUid(uid);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isDeleted) {
      throw new Error("User is already deactivated");
    }

    if (user.isActive === true) {
      throw new Error("User is already active");
    }

    user.isActive = true;
    
    user.updatedAt = new Date();
    await this.repo.update(user._id.toString(), user);

    return true;

  }
}

export default ReactivationService;
