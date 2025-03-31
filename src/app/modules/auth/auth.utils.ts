import jwt from 'jsonwebtoken';
import { TJwtPayload } from './auth.interface';

export const createToken = (
  JwtPayload: TJwtPayload,
  secret: string,
  expiresIn: string,
) => jwt.sign(JwtPayload, secret, { expiresIn } as jwt.SignOptions);

export const verifyToken = (token: string, secret: string) =>
  jwt.verify(token, secret) as jwt.JwtPayload;
