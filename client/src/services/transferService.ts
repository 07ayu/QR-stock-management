import type { StockTransfer, LocationType } from '../types';
import { DEMO_TRANSFERS } from './mockData';
import { checkOnlineStatus } from './apiClient';
import { inventoryService } from './inventoryService';

let localTransfers = [...DEMO_TRANSFERS];

export interface CreateTransferInput {
  sourceLocation: LocationType;
  destinationLocation: LocationType;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    qrCodes?: string[];
  }[];
  notes?: string;
  initiatedBy: string;
}

export const transferService = {
  async getTransfers(): Promise<StockTransfer[]> {
    return [...localTransfers];
  },

  async createTransfer(input: CreateTransferInput): Promise<StockTransfer> {
    checkOnlineStatus();

    if (input.sourceLocation === input.destinationLocation) {
      throw new Error('Source location and destination location cannot be the same.');
    }

    if (!input.items || input.items.length === 0) {
      throw new Error('At least one item must be selected for transfer.');
    }

    // Validate quantities at source
    const summaries = await inventoryService.getStockSummaries();
    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new Error(`Invalid transfer quantity for ${item.productName}`);
      }
      const summary = summaries.find(s => s.productId === item.productId);
      if (!summary) {
        throw new Error(`Product ${item.productName} not found in inventory.`);
      }
      const availableAtSource = input.sourceLocation === 'store' ? summary.storeQty : summary.godownQty;
      if (availableAtSource < item.quantity) {
        throw new Error(`Insufficient stock for ${item.productName} at ${input.sourceLocation.toUpperCase()} (Available: ${availableAtSource}, Requested: ${item.quantity}).`);
      }
    }

    const totalItems = input.items.reduce((acc, curr) => acc + curr.quantity, 0);

    const newTransfer: StockTransfer = {
      id: `trf_${Date.now()}`,
      transferNumber: `TRF-${new Date().getFullYear()}-${String(localTransfers.length + 41).padStart(4, '0')}`,
      sourceLocation: input.sourceLocation,
      destinationLocation: input.destinationLocation,
      items: input.items,
      totalItems,
      status: 'in_transit',
      notes: input.notes?.trim(),
      initiatedBy: input.initiatedBy,
      createdAt: new Date().toISOString()
    };

    localTransfers = [newTransfer, ...localTransfers];
    return newTransfer;
  },

  async completeTransfer(transferId: string): Promise<StockTransfer> {
    checkOnlineStatus();
    const transfer = localTransfers.find(t => t.id === transferId);
    if (!transfer) throw new Error('Transfer record not found.');
    if (transfer.status === 'completed') throw new Error('Transfer is already completed.');

    transfer.status = 'completed';
    transfer.completedAt = new Date().toISOString();
    return { ...transfer };
  }
};
