import UserRepository from "../repositories/UserRepository";

class ReactivationService {
  private repo = new UserRepository();

  async reactivateUser(userId: string, uid: string, loggedInUid: string) {
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

    if (user.isActive === true) {
      throw new Error("User is already active");
    }

    if (user.uid !== uid) {
      throw new Error("UID does not match the user record");
    }

    user.isActive = true;
    
    user.updatedAt = new Date();
    await this.repo.update(userId, user);

    return true;

  }
}

export default ReactivationService;
