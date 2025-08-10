// File: backend/src/middleware/auth.ts
// CORRECTED VERSION

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

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

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { 
    return res.status(401).json({ error: 'No token provided' }); 
  }

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
    
    const apiAudience = process.env.AUTH0_AUDIENCE || '';
    req.user = {
      sub: decoded.sub,
      email: decoded[`${apiAudience}/email`],
      name: decoded[`${apiAudience}/name`]
    };

    // This line is corrected to explicitly return
    return next();
  });
};