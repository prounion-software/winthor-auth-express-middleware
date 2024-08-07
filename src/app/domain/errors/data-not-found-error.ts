export class DataNotFoundError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'DataNotFoundError';
  }
}
