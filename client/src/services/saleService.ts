import type { Sale, SaleItem, PaymentMethod, LocationType } from '../types';
import { DEMO_SALES } from './mockData';
import { checkOnlineStatus } from './apiClient';
import { invoiceService } from './invoiceService';

let localSales = [...DEMO_SALES];

export interface CreateSaleInput {
  customerName: string;
  customerPhone: string;
  location: LocationType;
  items: SaleItem[];
  paymentMethod: PaymentMethod;
  discount?: number;
  soldBy: string;
}

export const saleService = {
  async getSales(): Promise<Sale[]> {
    return [...localSales];
  },

  async recordSale(input: CreateSaleInput): Promise<Sale> {
    checkOnlineStatus();

    if (!input.customerName.trim()) {
      throw new Error('Customer name is required.');
    }
    if (!input.customerPhone.trim()) {
      throw new Error('Customer phone number is required.');
    }
    if (!input.items || input.items.length === 0) {
      throw new Error('Sale must contain at least one item.');
    }

    const subtotal = input.items.reduce((acc, item) => acc + item.totalPrice, 0);
    const discount = Number(input.discount) || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Number((taxableAmount * 0.18).toFixed(2)); // Standard 18% GST calculation
    const grandTotal = Number((taxableAmount + tax).toFixed(2));

    const saleId = `sale_${Date.now()}`;
    const saleNumber = `SAL-${new Date().getFullYear()}-${String(localSales.length + 195).padStart(4, '0')}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(localSales.length + 195).padStart(4, '0')}`;

    // Auto-create matching invoice
    const invoice = await invoiceService.generateInvoice({
      saleId,
      saleNumber,
      invoiceNumber,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      amount: grandTotal,
      itemsCount: input.items.length
    });

    const newSale: Sale = {
      id: saleId,
      saleNumber,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      location: input.location,
      items: input.items,
      subtotal,
      tax,
      discount,
      grandTotal,
      paymentMethod: input.paymentMethod,
      status: 'completed',
      soldBy: input.soldBy,
      createdAt: new Date().toISOString(),
      invoiceId: invoice.id
    };

    localSales = [newSale, ...localSales];
    return newSale;
  }
};
