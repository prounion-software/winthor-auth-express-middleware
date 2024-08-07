import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response | NextFunction | void => {
  if (req.path === '/login' || req.path === '/refresh-token') {
    next();
  } else {
    let token = req.headers['x-access-token'] as string;

    if (!token) {
      token = req.query.token as string;

      if (!token) {
        return res.sendStatus(403);
      }
    }

    const secret = process.env.JWT_SECRET || 'secret';

    try {
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

      req.userId = decoded.userId;

      next();
    } catch (error) {
      return res.sendStatus(401);
    }
  }
};
