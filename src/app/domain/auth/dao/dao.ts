import { DataNotFoundError } from '@app/domain/errors';
import { InvalidCredentialsError } from '@app/domain/errors/invalid-credential-error';
import { AppResponse } from '@app/ports/app-response';
import { BaseDao } from '@shared/dao/base-dao';
import oracledb from 'oracledb';
import { UserBasicData } from '../types';
import { sqlAuth, sqlUserData } from './sql';

export class AuthDao extends BaseDao {
  constructor(public readonly connectionPool: oracledb.Pool) {
    super(connectionPool);
  }

  async auth(
    username: string,
    password: string
  ): Promise<AppResponse<UserBasicData, InvalidCredentialsError>> {
    const response = new AppResponse<UserBasicData, InvalidCredentialsError>();

    const data = await this.queryOne<UserBasicData>(sqlAuth, [
      username,
      password
    ]);

    if (!data) {
      response.error = new InvalidCredentialsError();
    } else {
      response.value = data;
    }

    return response;
  }

  async getUserData(
    userId: number
  ): Promise<AppResponse<UserBasicData, DataNotFoundError>> {
    const response = new AppResponse<UserBasicData, DataNotFoundError>();
    const dadosDb = await this.queryOne<UserBasicData>(sqlUserData, [userId]);

    if (!dadosDb) {
      response.error = new DataNotFoundError('Usuário não encontrado');
    } else {
      response.value = dadosDb;
    }

    return response;
  }


}
