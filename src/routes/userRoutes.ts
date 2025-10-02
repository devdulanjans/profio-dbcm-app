import { Router } from "express";
import { getUsers, getUser, updateUser, getUserByUid, checkExistenceSharedUrlName, subscribeLanguage, unsubscribeLanguage, removeProfileImage, getPreSignURL
    , removeDocument} from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.get("/uid/:id", getUserByUid);
router.put("/:id", updateUser);
router.get("/shared_url/:shareUrlName", checkExistenceSharedUrlName);
router.put("/language/subscribe", subscribeLanguage);
router.put("/language/unsubscribe", unsubscribeLanguage);

router.delete("/:id/profile_image", removeProfileImage);
router.delete("/document/:userId/:type/:id", removeDocument);

router.post("/presign_url", getPreSignURL);


export default router;
