import { test, expect } from '../src/fixtures/api.fixture';
import * as allure from 'allure-js-commons';
import { assertApiSuccess } from '../src/utils/assertApiResponse';
import { Product } from '../src/models/Product';

test.describe('API 1 - Get All Products List', () => {
  test('should return a non-empty list of products with valid structure', async ({ productService }) => {
    await allure.epic('API Testing');
    await allure.feature('Products');
    await allure.story('Get all products list');
    await allure.severity('critical');
    await allure.tags('api', 'smoke', 'products');

    const startTime = Date.now();

    const body = await allure.step('1. Consultar lista de productos', async () => {
      const res = await productService.getAllProducts();
      const duration = Date.now() - startTime;

      // El tiempo se reporta en Allure pero no bloquea el test,
      // porque el sitio es público y compartido (sin SLA).
      await allure.attachment(
        'Response Time',
        `API 1 respondió en ${duration}ms`,
        { contentType: 'text/plain' }
      );

      return res;
    });

    await allure.step('2. Validar código de negocio', async () => {
      assertApiSuccess(body);
    });

    await allure.step('3. Validar estructura de la lista', async () => {
      expect(body.products, 'La lista de productos debería existir').toBeDefined();
      expect(Array.isArray(body.products), 'products debería ser un array').toBe(true);
      expect.soft(body.products.length, 'Debería haber al menos 1 producto').toBeGreaterThan(0);
    });

    await allure.step('4. Validar estructura de un producto representativo', async () => {
      const product: Product = body.products[0];

      expect.soft(product.id, 'El producto debería tener id').toBeDefined();
      expect.soft(product.name, 'El producto debería tener name').toBeTruthy();
      expect.soft(product.price, 'El producto debería tener price').toBeTruthy();
      expect.soft(product.brand, 'El producto debería tener brand').toBeTruthy();
      expect.soft(product.category, 'El producto debería tener category').toBeDefined();
      expect.soft(product.category.usertype, 'La categoría debería tener usertype').toBeDefined();
      expect.soft(product.category.category, 'La categoría debería tener category').toBeTruthy();
    });

    await allure.step('5. Validar consistencia de precios', async () => {
      const allHavePrices = body.products.every(
        (p) => typeof p.price === 'string' && p.price.startsWith('Rs.')
      );
      expect.soft(allHavePrices, 'Todos los productos deberían tener precio con formato "Rs."').toBe(true);
    });
  });
});