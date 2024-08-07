import { InvalidCredentialsError } from '@app/domain/errors/invalid-credential-error';
import { HttpResponse } from '@app/ports/http';
import { badRequest, forbidden, notFound, ok, serverError } from "@shared/helpers/http-helper";
import jwt from 'jsonwebtoken';
import oracledb from 'oracledb';
import { AuthDao } from '../dao/dao';
import { UserBasicData, UserCredentials } from '../types';

export class AuthHttpController {
  constructor(private connectionPool: oracledb.Pool) { }

  private async generateAccessToken(
    userId: number,
    secret: string,
    minutesToExpire: number
  ): Promise<string> {
    return jwt.sign({ userId: userId }, secret, {
      expiresIn: `${minutesToExpire}m`,
    });
  }

  async auth(credentials: UserCredentials, jwtSecret: string, jwtMinutesToExpire: number): Promise<HttpResponse> {
    if (!credentials.username || !credentials.password) {
      return forbidden(new InvalidCredentialsError());
    }

    const dao = this.getDao();

    try {
      await dao.openConnection();
      const response = await dao.auth(credentials.username, credentials.password);

      if (response.hasError()) {
        await dao.closeConnection();
        return forbidden(response.error);
      }

      await dao.closeConnection();

      const user = response.value as UserBasicData;
      const token = await this.generateAccessToken(
        user.id,
        jwtSecret,
        jwtMinutesToExpire
      );

      const refreshToken = await this.generateAccessToken(
        user.id,
        jwtSecret,
        jwtMinutesToExpire * 2
      );

      return ok({ token, refreshToken });
    } catch (error) {
      await dao.closeConnection();
      return serverError(error, 'POST: /login');
    }
  }

  async me(userId: number): Promise<HttpResponse> {
    const dao = this.getDao();

    try {
      await dao.openConnection();
      const response = await dao.getUserData(userId);
      await dao.closeConnection();

      if (response.hasError()) {
        return notFound(response.error);
      }

      return ok(response.value);
    } catch (error) {
      await dao.closeConnection();
      return serverError(error, 'POST: /me');
    }
  }

  async refreshToken(currentRefreshToken: string, jwtSecret: string, jwtMinutesToExpire: number): Promise<HttpResponse> {
    if (!currentRefreshToken) {
      return badRequest(new Error('Token não informado'));
    }

    let userId: number = 0;

    try {

      const decoded = jwt.verify(currentRefreshToken, jwtSecret) as jwt.JwtPayload;

      if (!decoded.userId) {
        throw new Error('Refresh Token inválido')
      }

      userId = Number(decoded.userId);

      if (isNaN(userId) || userId <= 0) {
        throw new Error('Refresh Token inválido')
      }

    } catch (error) {
      return badRequest(new Error('Refresh Token inválido'));
    }

    const dao = this.getDao();

    try {
      await dao.openConnection();

      const userData = await dao.getUserData(userId);

      if (userData.hasError()) {
        await dao.closeConnection();
        return notFound(userData.error);
      }

      await dao.closeConnection();

      const user = userData.value as UserBasicData;

      const newToken = await this.generateAccessToken(
        user.id,
        jwtSecret,
        jwtMinutesToExpire
      );

      const newRefreshToken = await this.generateAccessToken(
        user.id,
        jwtSecret,
        jwtMinutesToExpire * 2
      );

      return ok({ token: newToken, refreshToken: newRefreshToken });
    } catch (error) {
      await dao.closeConnection();
      return serverError(error, 'POST: /refresh-token');
    }
  }

  private getDao(): AuthDao {
    return new AuthDao(this.connectionPool);
  }
}
