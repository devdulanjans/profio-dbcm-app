import { Router } from "express";
import { getUsers, getUser, updateUser, getUserByAuth0Id, checkExistenceSharedUrlName, subscribeLanguage, unsubscribeLanguage, removeProfileImage} from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.get("/auth/:id", getUserByAuth0Id);
router.put("/:id", updateUser);
router.get("/shared_url/:shareUrlName", checkExistenceSharedUrlName);
router.put("/language/subscribe", subscribeLanguage);
router.put("/language/unsubscribe", unsubscribeLanguage);
router.delete("/:id/profile_image", removeProfileImage);


export default router;
