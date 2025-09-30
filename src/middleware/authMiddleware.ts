import { expressjwt as jwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
require("dotenv").config();

console.log("Auth0 domain:", process.env.AUTH0_DOMAIN);
console.log("Auth0 audience:", process.env.AUTH0_API_IDENTIFIER);

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as any, // cast needed for TS
  audience: process.env.AUTH0_API_IDENTIFIER,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});
