import * as admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const firebaseAdmin = admin;

// import admin, { ServiceAccount } from "firebase-admin";
// import serviceAccountJson from "../utils/profio-dbcm-app-dev-firebase-adminsdk-fbsvc-bc1eb7d5f4.json";

// const serviceAccount = serviceAccountJson as ServiceAccount;

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// export const firebaseAdmin = admin;
