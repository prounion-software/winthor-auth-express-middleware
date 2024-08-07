import { HttpResponse } from '@app/ports/http';


export const badRequest = (error: Error): HttpResponse => {
  console.warn(`RESPONSE Bad request: ${error.message}`);

  return {
    statusCode: 400,
    body: { errorMessage: error.message },
  };
};
export const notFound = (error?: Error): HttpResponse => {
  console.warn(`RESPONSE Not found: ${error?.message || 'not found'}`);

  return {
    statusCode: 404,
    body: { errorMessage: error?.message || 'not found' },
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ok = (data: any): HttpResponse => {
  return {
    statusCode: 200,
    body: data,
  };
};

export const serverError = (
  error: Error | unknown,
  info = '',
): HttpResponse => {
  let message = 'Problemas em processar a requisição pelo servidor';
  let stack = '';

  if (error instanceof Error) {
    message = error.message;
    stack = error.stack ?? '';
  }

  console.error(`RESPONSE ${message} ${info} ${stack}`.trim());

  return {
    statusCode: 500,
    body: { errorMessage: message },
  };
};

export const unauthorized = (error: Error): HttpResponse => {
  console.warn(`RESPONSE Unauthorized: ${error.message}`);

  return {
    statusCode: 401,
    body: { errorMessage: error.message },
  };
};

export const forbidden = (error?: Error): HttpResponse => {
  console.warn(`RESPONSE Forbidden: ${error?.message || ''}`);

  return {
    statusCode: 403,
    body: { errorMessage: error?.message || '' },
  };
};

export const created = (data: any): HttpResponse => {
  return {
    statusCode: 201,
    body: data,
  };
};
