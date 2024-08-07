import { Request, Response, Router } from 'express';
import oracledb from 'oracledb';
import { AuthHttpController } from './controller';

export function authRoutes(
  router: Router,
  connectionPool: oracledb.Pool,
  jwtSecret: string,
  jwtMinutesToExpire: number
): void {
  const controller = new AuthHttpController(connectionPool);

  router.post('/login', async (req: Request, res: Response) => {
    const httpResponse = await controller.auth(
      {
        username: req?.body?.username ?? "",
        password: req?.body?.password ?? ""
      },
      jwtSecret,
      jwtMinutesToExpire
    );
    res.status(httpResponse.statusCode).json(httpResponse.body);
  });


  router.get('/me', async (req: Request, res: Response) => {
    const httpResponse = await controller.me(req.userId);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  });

  router.post('/me', async (req: Request, res: Response) => {
    const httpResponse = await controller.me(req.userId);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  });

  router.post('/refresh-token', async (req: Request, res: Response) => {
    const token = req.body.token || '';

    const httpResponse = await controller.refreshToken(token, jwtSecret, jwtMinutesToExpire);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  });
}
