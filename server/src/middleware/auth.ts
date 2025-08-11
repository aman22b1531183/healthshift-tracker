// File: backend/src/middleware/auth.ts
// FINAL CORRECTED VERSION

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { AuthRequest } from '../types';

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) { return callback(err); }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { return res.status(401).json({ error: 'No token provided' }); }

  const options = {
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256'] as jwt.Algorithm[]
  };

  jwt.verify(token, getKey, options, (err, decoded: any) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // This part is updated to read the custom claims from the Auth0 Action
    const apiAudience = process.env.AUTH0_AUDIENCE || '';
    req.user = {
      sub: decoded.sub,
      email: decoded[`${apiAudience}/email`],
      name: decoded[`${apiAudience}/name`]
    };

    next();
  });
};