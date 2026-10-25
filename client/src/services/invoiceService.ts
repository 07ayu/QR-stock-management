import type { Invoice } from '../types';
import { DEMO_INVOICES } from './mockData';
import { checkOnlineStatus } from './apiClient';

let localInvoices = [...DEMO_INVOICES];

export interface GenerateInvoiceInput {
  saleId: string;
  saleNumber: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  itemsCount: number;
}

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    return [...localInvoices];
  },

  async generateInvoice(input: GenerateInvoiceInput): Promise<Invoice> {
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: input.invoiceNumber,
      saleId: input.saleId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      amount: input.amount,
      status: 'paid',
      whatsappStatus: 'pending',
      createdAt: new Date().toISOString(),
      itemsCount: input.itemsCount
    };

    localInvoices = [newInvoice, ...localInvoices];
    return newInvoice;
  },

  /**
   * Triggers WhatsApp message dispatch via backend service.
   * Note: WhatsApp Business API keys & secrets are kept strictly on the backend.
   */
  async retryWhatsAppDelivery(invoiceId: string): Promise<Invoice> {
    checkOnlineStatus();
    const invoice = localInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found.');

    invoice.whatsappStatus = 'pending';
    delete invoice.whatsappError;

    // Simulate backend queue dispatch in demo mode
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mark as sent
    invoice.whatsappStatus = 'sent';
    return { ...invoice };
  }
};
