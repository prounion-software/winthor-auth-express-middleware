import { NextFunction, Request, Response, Express, Router } from "express";
import { WinthorAuthOptions } from "./types";
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid'
import { authRoutes } from '@app/domain/auth'
import OracleDB from "oracledb";


export function configAuthMiddleware(router: Router, options: WinthorAuthOptions): void {

  const routesPath = options?.routePath ?? '/auth';
  const tokenHeaderKey = options?.tokenHeaderKey ?? 'x-access-token';

  const jwtSecret = options?.jwtSecret ?? uuid();
  const jwtMinutesToExpire = options?.jwtMinutesToExpire ?? 60;
  const unprotectedRoutes = options?.unprotectedRoutes ?? [];

  router.use(createMiddleware(routesPath, jwtSecret, tokenHeaderKey, unprotectedRoutes));
  createAuthRoutes(router, routesPath, options.oracleConnectionPool, jwtSecret, jwtMinutesToExpire);
}

function createMiddleware(routesPath: string, jwtSecret: string, tokenHeaderKey: string, unprotectedRoutes: string[]): (req: Request, res: Response, next: NextFunction) => Response | NextFunction | void {

  unprotectedRoutes = ['/login', '/refresh-token', `${routesPath}/login`, `${routesPath}/refresh-token`, ...unprotectedRoutes];

  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Response | NextFunction | void => {

    if (unprotectedRoutes.includes(req.path)) {
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

function createAuthRoutes(router: Router, routesPath: string, oracleConnectionPool: OracleDB.Pool, jwtSecret: string, jwtMinutesToExpire: number) {

  authRoutes(router, routesPath, oracleConnectionPool, jwtSecret, jwtMinutesToExpire);
}
