import { Router } from "express";
import { getAllSubscriptions, getSubscriptionById, getSubscriptionByCode, assignSubscriptionToUser} from "../controllers/subscriptionPlanController";

const router = Router();

router.get("/", getAllSubscriptions);
router.get("/id/:id", getSubscriptionById);
router.get("/code/:code", getSubscriptionByCode);
router.post("/assign/:id", assignSubscriptionToUser);

export default router;
