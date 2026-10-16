import { expect } from '@playwright/test';
import { ApiResponse } from '../models/User';

/**
 * Valida que la respuesta de negocio sea exitosa.
 * La API de automationexercise.com SIEMPRE devuelve HTTP 200,
 * incluso en errores. El código real viene en body.responseCode.
 */
export function assertApiSuccess(body: ApiResponse, expectedCode = 200): void {
  expect(
    body.responseCode,
    `Se esperaba responseCode ${expectedCode} pero llegó ${body.responseCode}: ${body.message ?? 'sin mensaje'}`
  ).toBe(expectedCode);
}

/**
 * Valida que la respuesta de negocio sea un error esperado.
 */
export function assertApiError(body: ApiResponse, expectedCode: number): void {
  expect(
    body.responseCode,
    `Se esperaba error ${expectedCode} pero llegó ${body.responseCode}`
  ).toBe(expectedCode);

  expect(
    body.message,
    'La respuesta de error debería incluir un mensaje'
  ).toBeTruthy();
}