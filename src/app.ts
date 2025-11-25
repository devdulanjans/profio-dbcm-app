import express from "express";
import userRoutes from "./routes/userRoutes";
import subscriptionPlanRoutes from "./routes/subscriptionPlanRoutes";
import templateRoutes from "./routes/templateRoutes";
import userTemplateRoutes from "./routes/userTemplateRoutes";
import contactRoutes from "./routes/contactRoutes";
import publicRoutes from "./routes/publicRoutes";
import appGlobalConfigRoutes from "./routes/appGlobalConfigRoutes";
import accessRoutes from "./routes/accessRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import { checkJwt } from "./middleware/authMiddleware";
import { checkFirebaseJwt } from "./middleware/firebaseMiddleware";
// import UserRepository from "./repositories/UserRepository";
// import SubscriptionRepository from "./repositories/SubscriptionPlanRepository";
// import { userInfo } from "node:os";
// import User from "./models/User";
// import { UserDto } from "./dtos/UserDto";

const app = express();
app.use(express.json());

// Public route
app.get("/health", (req, res) => {
  res.json({ message: "Welcome to my API" });
});

// Protected route (JWT required)
app.get("/api/private", checkFirebaseJwt, (req, res) => {
  res.json({ message: "Access granted! Token is valid." });
});

// app.get("/callback", async (req, res) => {
//     try {
//         const code = req.query.code as string;

//         if (!code) {
//             return res.status(400).json({ error: "Authorization code missing" });
//         }

//         // Exchange code for token
//         const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 grant_type: "authorization_code",
//                 client_id: process.env.AUTH0_CLIENT_ID,
//                 client_secret: process.env.AUTH0_CLIENT_SECRET,
//                 code: code,
//                 redirect_uri: process.env.AUTH0_CALLBACK_URL,
//             }),
//         });

//         console.info("Token response status:", tokenResponse.status);

//         if (!tokenResponse.ok) {
//             const errorData = await tokenResponse.json();
//             throw new Error(JSON.stringify(errorData));
//         }

//         const tokens = await tokenResponse.json();

//         // Decode the ID token to extract the Auth0 user ID (sub)
//         const idToken = tokens.id_token;
//         const [, payloadBase64] = idToken.split(".");
//         const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));
//         const auth0Id = payload.sub;
//         const email = payload.email;

//         let user = await UserRepository.findUserByAuth0Id(auth0Id);
//         let createdUser;

//         if (!user) {
//             // Create new user if not exists
//             console.log("Creating new user with Auth0 ID:", auth0Id);

//             const subscriptionCode = "FREE";
//             let subscription = await SubscriptionRepository.findBySubscriptionCode(subscriptionCode);
//             let subscriptionId = "";

//             if (!subscription) {
//               console.error(`No subscription found with code: ${subscriptionCode}`);
//             } else {
//               subscriptionId = subscription._id;
//             }

//             const userToCreate: UserDto = { uid: auth0Id, email: email, isDeleted: false, createdAt: new Date(), updatedAt: new Date(), subscriptionId: subscriptionId, languageSubscriptionList: ["en"] };
//             createdUser = await UserRepository.create(userToCreate);
//         }

//         res.json({ tokens, user: createdUser || user });

//     } catch (err: any) {
//         console.error("Error exchanging code for token:", err.response?.data || err.message);
//         res.status(500).json({ error: "Failed to get token", details: err.response?.data || err.message });
//     }
// });

// Apply middleware for user routes
app.use("/api/users", checkFirebaseJwt, userRoutes);
app.use("/api/subscriptions", checkFirebaseJwt, subscriptionPlanRoutes);
app.use("/api/templates", checkFirebaseJwt, templateRoutes);
app.use("/api/user-templates", checkFirebaseJwt, userTemplateRoutes);
app.use("/api/contacts", checkFirebaseJwt, contactRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/app-global-config", checkFirebaseJwt, appGlobalConfigRoutes);
app.use("/api/access", checkFirebaseJwt, accessRoutes);
app.use("/api/payments", checkFirebaseJwt, paymentRoutes);

// Custom error handler for JWT
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // console.error("Error handler caught an error:", err);
    if (err.name === "UnauthorizedError") {
      if (err.message === "No authorization token was found") {
        return res.status(401).json({ message: "Token missing from request" });
      }
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "AuthorizationError") {
      return res.status(403).json({ message: err.message }); // Forbidden
    }

    if (err.name === "BadRequestError") {
      return res.status(400).json({ message: err.message }); // Bad Request
    }

    if (err.name === "NotFoundError") {
      return res.status(404).json({ message: err.message }); // Not Found
    }

    // fallback
    res.status(500).json({ message: "Internal Server Error" });
  }
);

export default app;
