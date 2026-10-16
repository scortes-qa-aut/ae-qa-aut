import { test, expect } from '../src/fixtures/api.fixture';
import * as allure from 'allure-js-commons';
import { UserPayload } from '../src/models/User';
import { assertApiSuccess } from '../src/utils/assertApiResponse';

test.describe('API 7 - Verify Login', () => {
  let createdEmail: string | null = null;
  const password = 'Test@12345';

  test.afterEach(async ({ accountService }) => {
    if (createdEmail) {
      await accountService.deleteUser(createdEmail, password);
      createdEmail = null;
    }
  });

  test('should verify login with valid details', async ({ accountService }) => {
    await allure.epic('API Testing');
    await allure.feature('Authentication');
    await allure.story('Verify login with valid details');
    await allure.severity('critical');
    await allure.tags('api', 'smoke', 'auth');

    const email = `qa_${Date.now()}@example.com`;
    createdEmail = email;

    const payload: UserPayload = {
      name: 'QA User',
      email: email,
      password: password,
      title: 'Mr',
      birth_date: '1',
      birth_month: '1',
      birth_year: '1990',
      firstname: 'QA',
      lastname: 'User',
      company: 'Test Co',
      address1: '123 Test St',
      address2: '',
      country: 'United States',
      zipcode: '12345',
      state: 'Test State',
      city: 'Test City',
      mobile_number: '1234567890',
    };

    // Setup: crear el usuario antes de validar el login
    await allure.step('1. Preparar usuario con credenciales válidas', async () => {
      const createResponse = await accountService.createUser(payload);
      assertApiSuccess(createResponse, 201);
    });

    // Test principal: verificar login
    const startTime = Date.now();

    const loginResponse = await allure.step('2. Enviar POST /verifyLogin con credenciales válidas', async () => {
      const res = await accountService.verifyLogin(email, password);
      const duration = Date.now() - startTime;

      await allure.attachment(
        'Response Time',
        `API 7 respondió en ${duration}ms`,
        { contentType: 'text/plain' }
      );

      return res;
    });

    await allure.step('3. Validar código de negocio y mensaje', async () => {
      assertApiSuccess(loginResponse);
      expect.soft(
        loginResponse.message,
        'El mensaje debería confirmar que el usuario existe'
      ).toContain('User exists');
    });
  });
});