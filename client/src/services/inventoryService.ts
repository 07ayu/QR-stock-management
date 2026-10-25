import type { InventoryItem, StockSummary, LocationType } from '../types';
import { DEMO_INVENTORY_ITEMS, DEMO_STOCK_SUMMARIES } from './mockData';
import { checkOnlineStatus } from './apiClient';

let localInventoryItems = [...DEMO_INVENTORY_ITEMS];
let localStockSummaries = [...DEMO_STOCK_SUMMARIES];

export const inventoryService = {
  async getStockSummaries(): Promise<StockSummary[]> {
    return [...localStockSummaries];
  },

  async getInventoryItems(location?: LocationType): Promise<InventoryItem[]> {
    if (!location) {
      return [...localInventoryItems];
    }
    return localInventoryItems.filter(item => item.location === location);
  },

  /**
   * Look up a physical item by its unique physical QR code.
   * Note: A QR code identifies a single physical unit (e.g. QR-STR-01-00811),
   * not the product SKU (e.g. SKU-HDM-2M).
   */
  async lookupItemByQr(qrCode: string): Promise<InventoryItem | null> {
    const cleanQr = qrCode.trim().toUpperCase();
    const item = localInventoryItems.find(
      i => i.qrCode.toUpperCase() === cleanQr
    );
    return item ? { ...item } : null;
  },

  async receivePhysicalItems(params: {
    productId: string;
    productName: string;
    sku: string;
    location: LocationType;
    qrCodes: string[];
    batchNumber?: string;
  }): Promise<InventoryItem[]> {
    checkOnlineStatus();

    // Check for QR collisions
    for (const qr of params.qrCodes) {
      const existing = localInventoryItems.find(
        i => i.qrCode.toUpperCase() === qr.toUpperCase()
      );
      if (existing) {
        throw new Error(`Item with QR Code "${qr}" already exists in the system.`);
      }
    }

    const createdItems: InventoryItem[] = params.qrCodes.map((qr) => ({
      id: `itm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      qrCode: qr.trim().toUpperCase(),
      productId: params.productId,
      productName: params.productName,
      sku: params.sku,
      location: params.location,
      status: 'available',
      batchNumber: params.batchNumber,
      receivedAt: new Date().toISOString(),
      lastMovedAt: new Date().toISOString()
    }));

    localInventoryItems = [...createdItems, ...localInventoryItems];

    // Update stock summary
    const summary = localStockSummaries.find(s => s.productId === params.productId);
    if (summary) {
      if (params.location === 'store') {
        summary.storeQty += createdItems.length;
      } else {
        summary.godownQty += createdItems.length;
      }
      summary.totalQty = summary.storeQty + summary.godownQty;
      summary.isLowStock = summary.totalQty < summary.minThreshold;
    }

    return createdItems;
  }
};
