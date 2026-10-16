import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: [
    ['list'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
    }],
  ],
  use: {
    baseURL: 'https://automationexercise.com',
    extraHTTPHeaders: { 'Accept': 'application/json' },
  },
});