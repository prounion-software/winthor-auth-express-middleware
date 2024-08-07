import oracledb from 'oracledb';

export type WinthorAuthOptions = {
  oracleConnectionPool: oracledb.Pool;
  jwtSecret?: string;
  jwtMinutesToExpire?: number;
  routePath?: string
};
