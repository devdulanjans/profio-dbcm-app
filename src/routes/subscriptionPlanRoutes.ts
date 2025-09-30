import { Router } from "express";
import { getAllSubscriptions, getSubscriptionById, getSubscriptionByCode} from "../controllers/subscriptionPlanController";

const router = Router();

router.get("/", getAllSubscriptions);
router.get("/id/:id", getSubscriptionById);
router.get("/code/:code", getSubscriptionByCode);


export default router;
