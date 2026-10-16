import { test, expect } from '../src/fixtures/api.fixture';
import * as allure from 'allure-js-commons';
import { UserPayload } from '../src/models/User';
import { assertApiSuccess, assertApiError } from '../src/utils/assertApiResponse';

test.describe('API 14 - Get user account detail by email', () => {
  let createdEmail: string | null = null;
  const password = 'Test@12345';

  test.afterEach(async ({ accountService }) => {
    if (createdEmail) {
      await accountService.deleteUser(createdEmail, password);
      createdEmail = null;
    }
  });

  test('should return user detail for existing account', async ({ accountService }) => {
    await allure.epic('API Testing');
    await allure.feature('Account Management');
    await allure.story('Get user detail by email');
    await allure.severity('critical');
    await allure.tags('api', 'smoke', 'account');

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

    await allure.step('1. Crear usuario único', async () => {
      const createResponse = await accountService.createUser(payload);
      assertApiSuccess(createResponse, 201);
    });

    const startTime = Date.now();
    const userDetail = await allure.step('2. Consultar detalle por email', async () => {
      const res = await accountService.getUserDetailByEmail(email);
      const duration = Date.now() - startTime;
      expect.soft(duration, `Tiempo ${duration}ms debería ser < 3000ms`).toBeLessThan(3000);
      return res;
    });

    await allure.step('3. Validar campos del usuario', async () => {
      assertApiSuccess(userDetail);
      expect.soft(userDetail.user, 'El objeto user debería existir').toBeDefined();
      expect.soft(userDetail.user.email, 'El email debería coincidir').toBe(email);
      expect.soft(userDetail.user.name, 'El nombre debería coincidir').toBe('QA User');
    });
  });

  test('should return 404 for non-existing email', async ({ accountService }) => {
    await allure.epic('API Testing');
    await allure.feature('Account Management');
    await allure.story('Get user detail by email - not found');
    await allure.severity('normal');
    await allure.tags('api', 'regression', 'account', 'negative');

    const nonExistingEmail = `no-existe-${Date.now()}@example.com`;

    await allure.step('1. Consultar detalle con email inexistente', async () => {
      const response = await accountService.getUserDetailByEmail(nonExistingEmail);
      assertApiError(response, 404);
      expect.soft(response.message, 'El mensaje debería indicar que no se encontró').toContain('not found');
    });
  });
});