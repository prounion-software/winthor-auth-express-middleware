import { NextFunction, Request, Response, Express, Router } from "express";
import { WinthorAuthOptions } from "./types";
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid'
import { authRoutes } from '@app/domain/auth'
import OracleDB from "oracledb";


export function createAuthMiddleware(app: Express, options: WinthorAuthOptions): (req: Request, res: Response, next: NextFunction) => Response | NextFunction | void {

  const routesPath = options?.routePath ?? '/auth';
  const tokenHeaderKey = options?.tokenHeaderKey ?? 'x-access-token';

  const router = Router();
  app.use(routesPath, router);

  const jwtSecret = options?.jwtSecret ?? uuid();
  const jwtMinutesToExpire = options?.jwtMinutesToExpire ?? 60;

  createAuthRoutes(router, options.oracleConnectionPool, jwtSecret, jwtMinutesToExpire);
  return createMiddleware(routesPath, jwtSecret, tokenHeaderKey);

}

function createMiddleware(routesPath: string, jwtSecret: string, tokenHeaderKey: string): (req: Request, res: Response, next: NextFunction) => Response | NextFunction | void {

  const allowedRoutes = ['/login', '/refresh-token', `${routesPath}/login`, `${routesPath}/refresh-token`];

  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Response | NextFunction | void => {

    if (allowedRoutes.includes(req.path)) {
      next();
    } else {
      let token = req.headers[tokenHeaderKey] as string;

      if (!token) {
        token = req.query.token as string;

        if (!token) {
          return res.sendStatus(403);
        }
      }


      try {
        const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
        req.userId = decoded.userId;

        next();
      } catch (error) {
        return res.sendStatus(401);
      }
    }
  };

}

function createAuthRoutes(router: Router, oracleConnectionPool: OracleDB.Pool, jwtSecret: string, jwtMinutesToExpire: number) {

  authRoutes(router, oracleConnectionPool, jwtSecret, jwtMinutesToExpire);
}
