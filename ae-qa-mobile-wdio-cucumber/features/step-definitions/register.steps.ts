import { When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import RegisterPage from '../../pageobjects/RegisterPage';
import { state } from '../support/state';

When('se registra un nuevo usuario con datos únicos', async () => {
  const timestamp = Date.now();
  state.registeredName = `QA User ${timestamp}`;
  state.registeredEmail = `qa_${timestamp}@example.com`;
  state.registeredPassword = 'Test@12345';

  await RegisterPage.startSignup(state.registeredName, state.registeredEmail);
  await RegisterPage.completeForm(state.registeredPassword, 'QA', 'User');
});

Then('la UI muestra la confirmación de cuenta creada', async () => {
  const created = await RegisterPage.isAccountCreated();
  expect(created).toBe(true);
});