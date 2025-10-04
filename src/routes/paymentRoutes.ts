import { Router } from "express";
import { PaymentController } from "../controllers/PaymentController";

const router = Router();
const controller = new PaymentController();

// Get payment config
router.post("/", controller.insertPaymentRecord);
router.get("/:id", controller.getPaymentRecords);

export default router;
