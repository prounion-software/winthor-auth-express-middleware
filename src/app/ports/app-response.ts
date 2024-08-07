export class AppResponse<T, E = Error> {
  public value?: T;
  public error?: E;

  hasError(): boolean {
    return !!this.error;
  }
}
