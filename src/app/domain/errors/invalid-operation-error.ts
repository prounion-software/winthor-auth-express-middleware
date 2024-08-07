export class InvalidOperationError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'InvalidOperationError';
  }
}
