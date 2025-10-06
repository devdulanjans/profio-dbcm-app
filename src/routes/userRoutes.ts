import { Router } from "express";
import { getUsers, getUser, updateUser, getUserByUid, checkExistenceSharedUrlName, subscribeLanguage, unsubscribeLanguage, removeProfileImage, getPreSignURL
    , removeDocument, updatePaymentSubscriptionPlan, updateDocumentTitle } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.get("/uid/:id", getUserByUid);
router.get("/shared_url/:shareUrlName", checkExistenceSharedUrlName);

router.put("/:id", updateUser);
router.put("/payment_subscription/:id", updatePaymentSubscriptionPlan);

router.put("/language/subscribe", subscribeLanguage);
router.put("/language/unsubscribe", unsubscribeLanguage);

router.post("/presign_url", getPreSignURL);

router.delete("/:id/profile_image", removeProfileImage);
router.delete("/document/:userId/:type/:id", removeDocument);

router.patch("/document/title", updateDocumentTitle);


export default router;
