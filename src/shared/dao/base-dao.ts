import oracledb from 'oracledb';

export abstract class BaseDao {
  public connection: oracledb.Connection | null = null;

  constructor(public readonly connectionPool: oracledb.Pool) { }

  async openConnection(): Promise<oracledb.Connection> {
    if (!this.connection) {
      this.connection = await this.connectionPool.getConnection();
    }

    return this.connection;
  }

  async closeConnection(): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection?.close();
    } catch (error) {
      /* empty */
    }

    this.connection = null;
  }

  async commit(close = true): Promise<void> {
    if (!this.connection) return;

    await this.connection.commit();

    if (close) {
      await this.closeConnection();
    }
  }

  async rollback(): Promise<void> {
    if (!this.connection) return;

    await this.connection.rollback();
  }

  async execSQL(sql: string, params: unknown[], commit = true): Promise<void> {
    if (!this.connection) {
      throw new Error('Não há conexão aberta com o banco de dados');
    }

    await this.connection.execute(sql, params);

    if (commit) {
      await this.connection.commit();
    }
  }

  async query<T = unknown>(sql: string, params: unknown[]): Promise<T[]> {
    if (!this.connection) {
      throw new Error('Não há conexão aberta com o banco de dados');
    }

    const result = await this.connection.execute<T>(sql, params);

    if (!result || !result.rows || result.rows.length === 0) {
      return [];
    }

    return result.rows;
  }

  async queryOne<T = unknown>(
    sql: string,
    params: unknown[]
  ): Promise<T | null> {
    const result = await this.query<T>(sql, params);

    if (!result) {
      return null;
    }

    return result[0];
  }
}
