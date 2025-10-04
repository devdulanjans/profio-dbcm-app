// src/controllers/userController.ts
import e, { json, Request, Response } from "express";
import UserService from "../services/UserService";
import { log } from "console";

const userService = new UserService();

export const getUsers = async (_req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.json(users);
};

export const getUser = async (req: Request, res: Response) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  console.log("Fetching user with ID:", userId);

  const user = await userService.getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json(user);
};

export const getUserByUid = async (req: Request, res: Response) => {
  const uid = req.params.id;

  if (!uid) {
    return res.status(400).json({ message: "UID is required" });
  }

  const user = await userService.getUserByUid(uid);

  if (!user) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json(user);
};

export const updateUser = async (req: Request, res: Response, next: Function) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const body = req.body;

  try {

    if (req.body.otherLinks) {
      req.body.otherLinks = JSON.parse(req.body.otherLinks);
    }

    const updatedUser = await userService.updateUser(userId, body);
    if (!updatedUser) return res.status(404).json({ message: "Not found" });

    res.json({ status: 0, message: "User updated successfully", data: updatedUser });
  } catch (error) {
    log("Error in updateUser:", error);
    next(error);
  }
  
};

export const updatePaymentSubscriptionPlan = async (req: Request, res: Response, next: Function) => {

  const uid = (req as any).user?.uid;

  if (!uid) {
    return res.status(400).json({ message: "UID is required" });
  }

  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const { paymentSubscriptionType} = req.body;

  if (!paymentSubscriptionType) {
    return res.status(400).json({ message: "Payment subscription type is required" });
  }

  try {
    const updatedUser = await userService.updatePaymentSubscriptionPlan(userId, paymentSubscriptionType, uid);

    if (!updatedUser) return res.status(404).json({ message: "Not found" });

    res.json({ status: 0, message: "Payment subscription plan updated successfully", data: updatedUser });
    
  } catch (error) {
    log("Error in updatePaymentSubscriptionPlan:", error);
    next(error);
  }
};


export const checkExistenceSharedUrlName = async (req: Request, res: Response) => {
  const shareUrlName = req.params.shareUrlName;

  if (!shareUrlName) {
    return res.status(400).json({ message: "Share URL name is required" });
  }

  const user = await userService.getUserByShareUrlName(shareUrlName);

  if (!user) {
    return res.status(200).json({ message: "Not found" , exists: false });
  }

  res.json({ message: "Found", exists: true });
};

//api to subscripe language
export const subscribeLanguage = async (req: Request, res: Response, next: Function) => {
  const uid = (req as any).user?.uid;

  if (!uid) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const { language, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!language) {
    return res.status(400).json({ message: "Language is required" });
  }

  try {
    const updatedUser = await userService.subscribeLanguage(userId, language, uid);

    if (!updatedUser) return res.status(404).json({ status: "error", message: "Not found" });

    res.json({ status: 0, message: "Language subscribed successfully", data: updatedUser });
  } catch (error) {
    log("Error in subscribeLanguage:", error);
    next(error);
  }
};  

export const unsubscribeLanguage = async (req: Request, res: Response, next: Function) => {
  const uid = (req as any).user?.uid;

  if (!uid) {
    return res.status(400).json({ status: 1, message: "UID is required" });
  }

  const { language, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ status: 1, message: "User ID is required" });
  }

  if (!language) {
    return res.status(400).json({ status: 1, message: "Language is required" });
  }
  if (!userId) {
    return res.status(400).json({ status: 1, message: "User ID is required" });
  }
  if (!language) {
    return res.status(400).json({ status: 1, message: "Language is required" });
  }
  try {
    const updatedUser = await userService.unsubscribeLanguage(userId, language, uid);
    if (!updatedUser) return res.status(404).json({ status: 1, message: "Not found" });

    res.json({ status: 0, message: "Language unsubscribed successfully", data: updatedUser });
  }
  catch (error) {
    log("Error in unsubscribeLanguage:", error);
    next(error);
  }
};



export const removeProfileImage = async (req: Request, res: Response, next: Function) => {
  const uid = (req as any).user?.uid;

  if (!uid) {
    return res.status(400).json({ message: "UID is required" });
  }

  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const updatedUser = await userService.removeProfileImage(userId, uid);
    if (!updatedUser) return res.status(404).json({ message: "Not found" });
    res.json({ status: 0, message: "Profile image removed successfully", data: updatedUser });
  } catch (error) {
    log("Error in removeProfileImage:", error);
    next(error);
  }
};

export const getPreSignURL = async (req: Request, res: Response, next: Function) => {
  const uid = (req as any).user?.uid;

  if (!uid) {
    return res.status(400).json({ message: "UID is required" });
  }

  const { userId, fileExtension, title, type } = req.body;

  if (type === "PROFILE"){
    if (!userId || !fileExtension || !type) {
    return res.status(400).json({ message: "User ID, file extension, and type are required" });
  }
  } else if (type === "DOCUMENT"){
    if (!userId || !fileExtension || !title  || !type) {
    return res.status(400).json({ message: "User ID, file extension, title, and type are required" });
  }
  }

  if (type !== "DOCUMENT" && type !== "PROFILE") {
    return res.status(400).json({ message: "Type must be either 'DOCUMENT' or 'PROFILE'" });
  }

  if (fileExtension !== "png" && fileExtension !== "jpg" && fileExtension !== "jpeg") {
    return res.status(400).json({ message: "Invalid file extension. Allowed extensions are png, jpg, jpeg" });
  }

  try {
    const presignURL = await userService.getPreSignURL(userId, fileExtension, uid, title , type);
    res.json({ status: 0, message: "Pre-signed URL generated successfully", data: presignURL });
  } catch (error) {
    log("Error in getPreSignURL:", error);
    next(error);
  }
};

export const removeDocument = async (req: Request, res: Response, next: Function) => {
  const uid = (req as any).user?.uid;
  if (!uid) {
    return res.status(400).json({ message: "UID is required" });
  }

  const documentId = req.params.id;
  const userId = req.params.userId;
  const type = req.params.type;

  if (!documentId) {
    return res.status(400).json({ message: "Document ID is required" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!type) {
    return res.status(400).json({ message: "Type is required" });
  }

  if (!type || (type !== "DOCUMENT" && type !== "PROFILE")) {
    return res.status(400).json({ message: "Type must be either 'DOCUMENT' or 'PROFILE'" });
  }

  try {
    const updatedUser = await userService.deleteDocument(userId,documentId, uid, type);
    if (!updatedUser) return res.status(404).json({ message: "Not found" });
    res.json({ status: 0, message: "Document removed successfully", data: null });
  } catch (error) {
    log("Error in removeDocument:", error);
    next(error);
  }
};
