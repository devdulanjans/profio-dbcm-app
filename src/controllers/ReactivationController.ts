import { Request, Response } from "express";
import ReactivationService from "../services/ReactivationService";
import { firebaseAdmin } from "../config/FirebaseAdmin";

const service = new ReactivationService();

export class ReactivationController {
  async reactivateUser(req: Request, res: Response) {
    try {
      const loggedInUid = (req as any).user?.uid;

      if (!loggedInUid) {
        return res.status(400).json({ status: 1, message: "Unauthorized" });
      }

      const { uid, userId } = req.body;

      if (!userId) {
        return res.status(400).json({ status: 1, message: "Missing userId" });
      }

      if (!uid) {
        return res.status(400).json({ status: 1, message: "Missing uid" });
      }

      const result = await service.reactivateUser(userId, uid, loggedInUid);
      res.json({ status: 0, message: "User reactivated successfully" });
    } catch (err: any) {
      res.status(500).json({ status: 1, message: err.message });
    }
  }
}
