declare namespace Express {
  export interface Request {
    userId: number;
  }

  export interface JwtPayload {
    userId: number;
  }
}
