import { Request, Response, NextFunction } from "express";
import { firebaseAdmin } from "../config/FirebaseAdmin";


export async function checkFirebaseJwt(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: 1, message: "Missing or invalid Authorization header" });
    }

    const idToken = authHeader.split("Bearer ")[1];

    if (!idToken) {
      return res.status(401).json({ status: 1, message: "Missing Firebase ID token" });
    }

    console.log("Verifying Firebase ID token...");
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);

    if (!decodedToken) {
      return res.status(401).json({ status: 1, message: "Invalid Firebase ID token" });
    } 

    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const emailVerified = decodedToken.email_verified;

    if (!email) {
      return res.status(400).json({ status: 1, message: "Email not found in token" });
    }

    // if (!emailVerified) {
    //   return res.status(400).json({ status: 1, message: "Email not verified" });
    // }

    if (!uid) {
      return res.status(400).json({ status: 1, message: "UID not found in token" });
    }

    console.log(`Firebase token verified for UID: ${uid}, Email: ${email}`);

    if (!decodedToken.sub) {
      return res.status(400).json({ status: 1, message: "Subject (sub) not found in token" });
    }

    if (decodedToken.iss !== `https://securetoken.google.com/${process.env.FIREBASE_PROJECT_ID}`) {
      return res.status(400).json({ status: 1, message: "Invalid token issuer" });
    }

    if (decodedToken.aud !== process.env.FIREBASE_PROJECT_ID) {
      return res.status(400).json({ status: 1, message: "Invalid token audience" });
    }

    // Attach user info to request for later use
    (req as any).user = decodedToken;

    next();
  } catch (err: any) {
    console.error("Firebase token verification failed:", err);

    // Handle specific Firebase errors if needed
    if (err.code === 'auth/argument-error') {
      return res.status(400).json({ status: 1, message: "Invalid token format" });
    }
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ status: 1, message: "Firebase ID token expired" });
    }
    if (err.code === 'auth/id-token-revoked') {
      return res.status(401).json({ status: 1, message: "Firebase ID token revoked" });
    }

    res.status(401).json({ status: 1, message: "Unauthorized" });
  }
}
