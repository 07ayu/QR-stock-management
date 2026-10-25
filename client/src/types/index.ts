export type LocationType = 'store' | 'godown';

export interface LocationInfo {
  id: LocationType;
  name: string;
  code: string;
  description: string;
}

export const LOCATIONS: Record<LocationType, LocationInfo> = {
  store: {
    id: 'store',
    name: 'Main Retail Store',
    code: 'STR-01',
    description: 'Front-facing retail counter and immediate display stock'
  },
  godown: {
    id: 'godown',
    name: 'Central Godown',
    code: 'GDN-01',
    description: 'Bulk storage warehouse and primary receiving facility'
  }
};

export type ProductStatus = 'active' | 'archived';

export interface Product {
  id: string;
  sku: string; // e.g. "PRD-ELEC-001"
  name: string;
  category: string;
  unit: string;
  unitPrice: number; // Selling price
  costPrice: number; // Purchase price
  minStockThreshold: number;
  description?: string;
  status: ProductStatus;
  createdAt: string;
}

export type ItemStatus = 'available' | 'reserved' | 'in_transit' | 'sold' | 'damaged';

export interface InventoryItem {
  id: string;
  qrCode: string; // Unique physical item QR code (e.g. "QR-STR-8492048")
  productId: string;
  productName: string;
  sku: string;
  location: LocationType;
  status: ItemStatus;
  batchNumber?: string;
  receivedAt: string;
  lastMovedAt: string;
}

export interface StockSummary {
  productId: string;
  sku: string;
  productName: string;
  category: string;
  unitPrice: number;
  costPrice: number;
  storeQty: number;
  godownQty: number;
  totalQty: number;
  minThreshold: number;
  isLowStock: boolean;
}

export type TransferStatus = 'pending' | 'in_transit' | 'completed' | 'cancelled';

export interface StockTransfer {
  id: string;
  transferNumber: string; // e.g. "TRF-2026-0042"
  sourceLocation: LocationType;
  destinationLocation: LocationType;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    qrCodes?: string[];
  }[];
  totalItems: number;
  status: TransferStatus;
  notes?: string;
  initiatedBy: string;
  createdAt: string;
  completedAt?: string;
}

export type PaymentMethod = 'cash' | 'upi' | 'card';
export type SaleStatus = 'completed' | 'cancelled';

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  qrCodes?: string[]; // QR codes of specific physical units sold
}

export interface Sale {
  id: string;
  saleNumber: string; // e.g. "INV-2026-108"
  customerName: string;
  customerPhone: string;
  location: LocationType;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  soldBy: string;
  createdAt: string;
  invoiceId?: string;
}

export type InvoiceStatus = 'issued' | 'paid' | 'cancelled';
export type WhatsAppStatus = 'not_sent' | 'pending' | 'sent' | 'delivered' | 'failed';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-108"
  saleId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  status: InvoiceStatus;
  whatsappStatus: WhatsAppStatus;
  whatsappError?: string;
  createdAt: string;
  itemsCount: number;
}

export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  defaultLocation: LocationType;
}

export interface EndpointIntegrationStatus {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'connected' | 'mock_active';
  description: string;
}
