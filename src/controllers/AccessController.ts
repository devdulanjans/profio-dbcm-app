import { Request, Response } from "express";
import AccessService from "../services/AccessService";
import { firebaseAdmin } from "../config/FirebaseAdmin";

const service = new AccessService();

export class AccessController {

async signUp(req: Request, res: Response) {
  try {

    const { email, uid } = req.body;
    
    if (!email) {
      return res.status(400).json({ status: 1, message: "Missing email" });
    }

    if (!uid) {
      return res.status(400).json({ status: 1, message: "Missing uid" });
    }

    const createdUser = await service.signUp(uid, email);
    
    if (!createdUser) {
      return res.status(500).json({ status: 1, message: "Failed to create user" });
    }

    res.json({ status: 0, message: "User created successfully", data: createdUser });

  } catch (err: any) {
    res.status(500).json({ status: 1, message: err.message });
  }
}

async deactivateUser(req: Request, res: Response) {
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

    const result = await service.deactivateUser(userId, uid, loggedInUid);
    res.json({ status: 0, message: "User deactivated successfully" });
  } catch (err: any) {
    res.status(500).json({ status: 1, message: err.message });
  }
}
}
