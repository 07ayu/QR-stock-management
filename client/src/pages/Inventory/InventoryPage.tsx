import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  QrCode, 
  Store, 
  Warehouse, 
  Search, 
  Plus, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { productService } from '../../services/productService';
import type { InventoryItem, LocationType } from '../../types';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { LoadingState, EmptyState } from '../../components/ui/FeedbackStates';
import { QrScannerModal } from '../../components/qr/QrScannerModal';

export const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<'all' | LocationType>('all');
  const [viewMode, setViewMode] = useState<'physical_items' | 'stock_summary'>('physical_items');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<InventoryItem | null>(null);

  // Form State for Receiving Physical Units
  const [receiveForm, setReceiveForm] = useState(() => ({
    productId: '',
    location: 'godown' as LocationType,
    qrList: '',
    batchNumber: 'BAT-2026-01'
  }));
  const [receiveError, setReceiveError] = useState<string | null>(null);
  const [receiveSuccess, setReceiveSuccess] = useState<string | null>(null);

  // Queries
  const { data: stockSummaries = [], isLoading: isLoadingSummaries } = useQuery({
    queryKey: ['stockSummaries'],
    queryFn: () => inventoryService.getStockSummaries()
  });

  const { data: inventoryItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['inventoryItems'],
    queryFn: () => inventoryService.getInventoryItems()
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts()
  });

  // Receive stock mutation
  const receiveMutation = useMutation({
    mutationFn: async (data: typeof receiveForm) => {
      const selectedProduct = products.find(p => p.id === data.productId);
      if (!selectedProduct) throw new Error('Selected product does not exist.');

      const qrCodes = data.qrList
        .split(/[\n,]+/)
        .map(q => q.trim().toUpperCase())
        .filter(Boolean);

      if (qrCodes.length === 0) {
        throw new Error('Please enter or scan at least one unique QR code.');
      }

      return inventoryService.receivePhysicalItems({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        location: data.location,
        qrCodes,
        batchNumber: data.batchNumber
      });
    },
    onSuccess: (items) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      queryClient.invalidateQueries({ queryKey: ['stockSummaries'] });
      setIsReceiveModalOpen(false);
      setReceiveSuccess(`Successfully received ${items.length} physical item(s) into inventory.`);
      setTimeout(() => setReceiveSuccess(null), 4000);
      setReceiveForm({
        productId: '',
        location: 'godown',
        qrList: '',
        batchNumber: 'BAT-' + new Date().getFullYear() + '-01'
      });
      setReceiveError(null);
    },
    onError: (err: Error) => {
      setReceiveError(err.message);
    }
  });

  // Filtering
  const filteredItems = inventoryItems.filter(item => {
    const matchesLoc = selectedLocation === 'all' || item.location === selectedLocation;
    const matchesQuery = 
      item.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLoc && matchesQuery;
  });

  const filteredSummaries = stockSummaries.filter(summary => {
    return (
      summary.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle scanned QR from on-page button
  const handleQrDetected = (scannedQr: string) => {
    setSearchTerm(scannedQr);
    const item = inventoryItems.find(i => i.qrCode.toUpperCase() === scannedQr.toUpperCase());
    if (item) {
      setSelectedItemDetail(item);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Inventory & Physical Items
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track discrete physical units by unique QR code across Main Retail Store and Central Godown.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsQrScannerOpen(true)}
            icon={<QrCode className="w-3.5 h-3.5" />}
          >
            Scan & Locate Item
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (products.length > 0 && !receiveForm.productId) {
                setReceiveForm(prev => ({ ...prev, productId: products[0].id }));
              }
              setIsReceiveModalOpen(true);
            }}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Receive Stock
          </Button>
        </div>
      </div>

      {receiveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{receiveSuccess}</span>
        </div>
      )}

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200 items-stretch sm:items-center justify-between">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setViewMode('physical_items')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              viewMode === 'physical_items'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Physical QR Units ({filteredItems.length})
          </button>
          <button
            onClick={() => setViewMode('stock_summary')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              viewMode === 'stock_summary'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Product Balances ({filteredSummaries.length})
          </button>
        </div>

        {/* Location Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setSelectedLocation('all')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                selectedLocation === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Locations
            </button>
            <button
              onClick={() => setSelectedLocation('store')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                selectedLocation === 'store' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Store className="w-3 h-3 text-blue-600" />
              Store
            </button>
            <button
              onClick={() => setSelectedLocation('godown')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                selectedLocation === 'godown' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Warehouse className="w-3 h-3 text-amber-600" />
              Godown
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by QR code, SKU, or name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'physical_items' ? (
        <Card>
          <CardHeader
            title="Individual Physical Item Tracking"
            subtitle="Every physical unit has its own unique QR code sticker"
          />
          <CardContent className="p-0">
            {isLoadingItems ? (
              <LoadingState message="Loading physical items..." />
            ) : filteredItems.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No physical items found"
                  description="No individual items match your filter. Receive stock to register new QR-tagged units."
                  action={
                    <Button size="sm" onClick={() => setIsReceiveModalOpen(true)}>
                      Receive New Items
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Unique Item QR</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Master SKU</th>
                      <th className="py-3 px-4">Current Location</th>
                      <th className="py-3 px-4">Batch Number</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {item.qrCode}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{item.productName}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{item.sku}</td>
                        <td className="py-3 px-4">
                          <Badge variant={item.location === 'store' ? 'info' : 'warning'}>
                            {item.location === 'store' ? 'Retail Store (STR-01)' : 'Central Godown (GDN-01)'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {item.batchNumber || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={item.status === 'available' ? 'success' : 'neutral'}>
                            {item.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedItemDetail(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition"
                            title="Inspect Item"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Aggregated Product Balances"
            subtitle="Store vs Godown inventory totals"
          />
          <CardContent className="p-0">
            {isLoadingSummaries ? (
              <LoadingState message="Loading inventory balances..." />
            ) : filteredSummaries.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No balances available"
                  description="Add products and receive stock to see aggregated balances."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Product / SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Retail Store</th>
                      <th className="py-3 px-4 text-right">Central Godown</th>
                      <th className="py-3 px-4 text-right">Total Balance</th>
                      <th className="py-3 px-4 text-center">Alert Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSummaries.map((summary) => (
                      <tr key={summary.productId} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{summary.productName}</div>
                          <div className="font-mono text-slate-400 text-[11px]">{summary.sku}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{summary.category}</td>
                        <td className="py-3 px-4 text-right font-medium text-blue-700">
                          {summary.storeQty} pcs
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-amber-700">
                          {summary.godownQty} pcs
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {summary.totalQty} pcs
                        </td>
                        <td className="py-3 px-4 text-center">
                          {summary.isLowStock ? (
                            <Badge variant="warning">Low Stock (&lt;{summary.minThreshold})</Badge>
                          ) : (
                            <Badge variant="success">Sufficient</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Receive Physical Items Modal */}
      <Modal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        title="Receive Physical Stock"
        subtitle="Assign unique physical QR codes to each individual unit received"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            receiveMutation.mutate(receiveForm);
          }}
          className="space-y-4"
        >
          {receiveError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{receiveError}</span>
            </div>
          )}

          <Select
            label="Product Definition (SKU)"
            value={receiveForm.productId}
            onChange={(e) => setReceiveForm({ ...receiveForm, productId: e.target.value })}
            options={products.map(p => ({
              label: `${p.name} (${p.sku})`,
              value: p.id
            }))}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Receiving Location"
              value={receiveForm.location}
              onChange={(e) => setReceiveForm({ ...receiveForm, location: e.target.value as LocationType })}
              options={[
                { label: 'Central Godown (Recommended for intake)', value: 'godown' },
                { label: 'Main Retail Store', value: 'store' }
              ]}
              required
            />

            <Input
              label="Batch / Shipment Lot"
              value={receiveForm.batchNumber}
              onChange={(e) => setReceiveForm({ ...receiveForm, batchNumber: e.target.value })}
              placeholder="e.g. BAT-2026-FEB-01"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Unique QR Code Identifiers (1 per line or comma-separated)
            </label>
            <textarea
              rows={4}
              value={receiveForm.qrList}
              onChange={(e) => setReceiveForm({ ...receiveForm, qrList: e.target.value })}
              placeholder={`QR-GDN-01-09881\nQR-GDN-01-09882\nQR-GDN-01-09883`}
              className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Important: Each entry represents one discrete physical piece. Do not enter the product SKU here.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReceiveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={receiveMutation.isPending}
            >
              Record Physical Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Item Details View Modal */}
      {selectedItemDetail && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedItemDetail(null)}
          title="Physical Item Record"
          subtitle={`Unique Identifier: ${selectedItemDetail.qrCode}`}
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Product Name:</span>
                <span className="font-semibold text-slate-900">{selectedItemDetail.productName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Product SKU:</span>
                <span className="font-mono font-medium text-slate-800">{selectedItemDetail.sku}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Unique QR Identifier:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedItemDetail.qrCode}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Location:</span>
                <Badge variant={selectedItemDetail.location === 'store' ? 'info' : 'warning'}>
                  {selectedItemDetail.location === 'store' ? 'Main Retail Store' : 'Central Godown'}
                </Badge>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Stock Status:</span>
                <Badge variant="success">{selectedItemDetail.status.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Batch Number:</span>
                <span className="font-mono text-slate-700">{selectedItemDetail.batchNumber || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Received Date:</span>
                <span className="text-slate-700">
                  {new Date(selectedItemDetail.receivedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setSelectedItemDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* On-Page QR Scanner */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={handleQrDetected}
        title="Scan Item QR Code"
        description="Scan code to automatically find and filter this unit in inventory"
      />
    </div>
  );
};
