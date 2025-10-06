import { Request, Response } from "express";
import PaymentService from "../services/PaymentService";
import { firebaseAdmin } from "../config/FirebaseAdmin";

const service = new PaymentService();

export class PaymentController {

  async insertPaymentRecord(req: Request, res: Response) {
    const uid = req.body.uid;

    if (!uid) {
      return res.status(400).json({ message: "UID is required", data: null, status: 1 });
    }
    
    const { userId, amount, currencyCode, paymentId} = req.body;

    if (!userId || !amount || !currencyCode || !paymentId) {
      return res.status(400).json({ message: "All fields are required", data: null, status: 1 });
    }

    // check amount is a number
    if (isNaN(amount)) {
      return res.status(400).json({ message: "Amount must be a number", data: null, status: 1 });
    }

    try {
      const paymentRecord = await service.createPaymentRecord(uid, userId, amount, currencyCode, paymentId);

      if (!paymentRecord) {
        return res.status(400).json({ message: "Payment record created but user not updated", data: null, status: 1 });
      }

      return res.status(201).json({ status: 0, data: paymentRecord, message: "Payment record created successfully" });

    } catch (error) {
      return res.status(500).json({ message: `Failed to create payment record: ${error}`, data: null, status: 1 });
    }
  }

  async getPaymentRecords(req: Request, res: Response) {
    const uid = req.body.uid;

    if (!uid) {
      return res.status(400).json({ message: "UID is required", data: null, status: 1 });
    }

    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required", data: null, status: 1 });
    }

    try {
      const paymentRecords = await service.getPaymentRecords(uid, userId);

      return res.status(200).json({ status: 0, data: paymentRecords, message: "Payment records retrieved successfully" });
      
    } catch (error) {
      return res.status(500).json({ message: `Failed to retrieve payment records: ${error}`, data: null, status: 1 });
    }
  }
}
