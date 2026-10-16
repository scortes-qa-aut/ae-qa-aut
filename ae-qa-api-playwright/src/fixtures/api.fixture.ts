import { test as base } from '@playwright/test';
import { ApiClient } from '../clients/ApiClient';
import { AccountService } from '../services/AccountService';
import { ProductService } from '../services/ProductService';

type ApiFixtures = {
  apiClient: ApiClient;
  accountService: AccountService;
  productService: ProductService;
};

export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request);
    await use(client);
  },

  accountService: async ({ apiClient }, use) => {
    await use(new AccountService(apiClient));
  },

  productService: async ({ apiClient }, use) => {
    await use(new ProductService(apiClient));
  },
});

export { expect } from '@playwright/test';