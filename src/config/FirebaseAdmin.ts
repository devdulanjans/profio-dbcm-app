import admin, { ServiceAccount } from "firebase-admin";
import serviceAccountJson from "../utils/profio-dbcm-app-firebase-adminsdk-fbsvc-ebec6b87c3.json";

const serviceAccount = serviceAccountJson as ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const firebaseAdmin = admin;
