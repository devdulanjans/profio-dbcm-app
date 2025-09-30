import { Router } from "express";
import { ContactController } from "../controllers/contactController";

const router = Router();
const controller = new ContactController();

// Save contact
router.post("/", controller.saveContact);

// Save contact
router.post("/bidirectional", controller.saveContact);

// Get all contacts for logged-in user
router.get("/user/:id", controller.getContacts);

// Delete a contact
router.delete("/:id", controller.removeContact);

// Check if profile is already saved
router.post("/is_saved", controller.checkSaved);

export default router;
