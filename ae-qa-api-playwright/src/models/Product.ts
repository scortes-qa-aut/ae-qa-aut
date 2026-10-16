import { ApiResponse } from './User';

export interface ProductCategory {
  usertype: {
    usertype: string;
  };
  category: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: ProductCategory;
}

export interface ProductsListResponse extends ApiResponse {
  products: Product[];
}