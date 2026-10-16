import { ApiClient } from '../clients/ApiClient';
import { ProductsListResponse } from '../models/Product';

export class ProductService {
  constructor(private client: ApiClient) {}

  async getAllProducts(): Promise<ProductsListResponse> {
    const response = await this.client.get('/api/productsList');
    return response.json();
  }
}