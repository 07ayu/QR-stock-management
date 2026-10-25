import type { Product, ProductStatus } from '../types';
import { DEMO_PRODUCTS } from './mockData';
import { checkOnlineStatus } from './apiClient';

// In-memory demo store to allow interactive frontend testing
let localProducts = [...DEMO_PRODUCTS];

export interface CreateProductInput {
  sku: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  costPrice: number;
  minStockThreshold: number;
  description?: string;
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    // Return demo products for now; ready to connect to GET /products
    return [...localProducts];
  },

  async createProduct(input: CreateProductInput): Promise<Product> {
    checkOnlineStatus();

    // Validate SKU uniqueness
    const existing = localProducts.find(
      p => p.sku.trim().toUpperCase() === input.sku.trim().toUpperCase()
    );
    if (existing) {
      throw new Error(`A product with SKU "${input.sku}" already exists.`);
    }

    const newProduct: Product = {
      id: `prd_${Date.now()}`,
      sku: input.sku.trim().toUpperCase(),
      name: input.name.trim(),
      category: input.category.trim() || 'General',
      unit: input.unit || 'pcs',
      unitPrice: Number(input.unitPrice),
      costPrice: Number(input.costPrice),
      minStockThreshold: Number(input.minStockThreshold) || 5,
      description: input.description?.trim(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    localProducts = [newProduct, ...localProducts];
    return newProduct;
  },

  async updateStatus(id: string, status: ProductStatus): Promise<Product> {
    checkOnlineStatus();
    const item = localProducts.find(p => p.id === id);
    if (!item) throw new Error('Product not found');
    item.status = status;
    return { ...item };
  }
};
