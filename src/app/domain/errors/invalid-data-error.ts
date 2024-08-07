export class InvalidDataError extends Error {
  constructor(reason = 'Dados inválidos') {
    super(reason);
    this.name = 'InvalidDataError';
  }
}
