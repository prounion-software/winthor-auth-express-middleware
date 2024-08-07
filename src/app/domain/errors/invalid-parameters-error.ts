export class InvalidParametersError extends Error {
  constructor(reason = 'Parâmetros inválido') {
    super(reason);
    this.name = 'InvalidParametersError';
  }
}
