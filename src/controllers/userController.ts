// src/controllers/userController.ts
import { Request, Response } from "express";
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

  const user = await userService.getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json(user);
};

export const getUserByAuth0Id = async (req: Request, res: Response) => {
  const auth0Id = req.params.id;

  if (!auth0Id) {
    return res.status(400).json({ message: "Auth0 ID is required" });
  }

  const user = await userService.getUserByAuth0Id(auth0Id);

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
    const updatedUser = await userService.updateUser(userId, body);
    if (!updatedUser) return res.status(404).json({ message: "Not found" });
    res.json({ status: 0, message: "User updated successfully", data: updatedUser });
  } catch (error) {
    log("Error in updateUser:", error);
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
  const auth0Id = (req as any).auth.sub;
  
  if (!auth0Id) {
    return res.status(400).json({ message: "Auth0 ID is required" });
  }

  const { language, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!language) {
    return res.status(400).json({ message: "Language is required" });
  }

  try {
    const updatedUser = await userService.subscribeLanguage(userId, language, auth0Id);

    if (!updatedUser) return res.status(404).json({ status: "error", message: "Not found" });

    res.json({ status: 0, message: "Language subscribed successfully", data: updatedUser });
  } catch (error) {
    log("Error in subscribeLanguage:", error);
    next(error);
  }
};  

export const unsubscribeLanguage = async (req: Request, res: Response, next: Function) => {
  const auth0Id = (req as any).auth.sub;

  if (!auth0Id) {
    return res.status(400).json({ status: 1, message: "Auth0 ID is required" });
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
    const updatedUser = await userService.unsubscribeLanguage(userId, language, auth0Id);
    if (!updatedUser) return res.status(404).json({ status: 1, message: "Not found" });

    res.json({ status: 0, message: "Language unsubscribed successfully", data: updatedUser });
  }
  catch (error) {
    log("Error in unsubscribeLanguage:", error);
    next(error);
  }
};
