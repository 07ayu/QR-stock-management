import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  ArrowRight
} from 'lucide-react';
import { transferService } from '../../services/transferService';
import { inventoryService } from '../../services/inventoryService';
import type { LocationType } from '../../types';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Input';
import { LoadingState, EmptyState } from '../../components/ui/FeedbackStates';
import { useAuth } from '../../hooks/useAuth';

export const TransfersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewTransferModalOpen, setIsNewTransferModalOpen] = useState(false);

  // Transfer Form State
  const [sourceLoc, setSourceLoc] = useState<LocationType>('godown');
  const [destLoc, setDestLoc] = useState<LocationType>('store');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [transferQty, setTransferQty] = useState<number>(1);
  const [transferNotes, setTransferNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Queries
  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['transfers'],
    queryFn: () => transferService.getTransfers()
  });

  const { data: summaries = [] } = useQuery({
    queryKey: ['stockSummaries'],
    queryFn: () => inventoryService.getStockSummaries()
  });

  // Calculate available stock at chosen source
  const selectedProductSummary = summaries.find(s => s.productId === selectedProductId);
  const availableAtSource = selectedProductSummary
    ? sourceLoc === 'store'
      ? selectedProductSummary.storeQty
      : selectedProductSummary.godownQty
    : 0;

  // Mutations
  const createTransferMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProductSummary) throw new Error('Please select a product.');
      return transferService.createTransfer({
        sourceLocation: sourceLoc,
        destinationLocation: destLoc,
        items: [
          {
            productId: selectedProductSummary.productId,
            productName: selectedProductSummary.productName,
            sku: selectedProductSummary.sku,
            quantity: transferQty
          }
        ],
        notes: transferNotes,
        initiatedBy: user?.name || 'Staff'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['stockSummaries'] });
      setIsNewTransferModalOpen(false);
      setSuccessMsg(`Transfer ${data.transferNumber} initiated successfully.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setTransferNotes('');
      setFormError(null);
    },
    onError: (err: Error) => {
      setFormError(err.message);
    }
  });

  const completeTransferMutation = useMutation({
    mutationFn: (id: string) => transferService.completeTransfer(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['stockSummaries'] });
      setSuccessMsg(`Transfer ${updated.transferNumber} marked as completed.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: Error) => {
      setSuccessMsg(null);
      alert(err.message);
    }
  });

  const handleSourceChange = (newSource: LocationType) => {
    setSourceLoc(newSource);
    // Auto-swap destination so source != destination
    setDestLoc(newSource === 'store' ? 'godown' : 'store');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (sourceLoc === destLoc) {
      setFormError('Source and destination cannot be identical.');
      return;
    }
    if (!selectedProductId) {
      setFormError('Please choose a product to transfer.');
      return;
    }
    if (transferQty <= 0) {
      setFormError('Transfer quantity must be at least 1.');
      return;
    }
    if (transferQty > availableAtSource) {
      setFormError(`Cannot transfer ${transferQty} units. Only ${availableAtSource} available at ${sourceLoc.toUpperCase()}.`);
      return;
    }

    createTransferMutation.mutate();
  };

  const filteredTransfers = transfers.filter(t => {
    return (
      t.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.items.some(i => i.productName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Stock Transfers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch, track, and receive inventory movements between Central Godown and Retail Store.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            if (summaries.length > 0 && !selectedProductId) {
              setSelectedProductId(summaries[0].productId);
            }
            setIsNewTransferModalOpen(true);
          }}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Initiate Transfer
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by transfer number or product name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Transfers List */}
      <Card>
        <CardHeader
          title="Transfer Logs"
          subtitle={`Showing ${filteredTransfers.length} recorded stock transfers`}
        />
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingState message="Fetching transfer records..." />
          ) : filteredTransfers.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No transfers found"
                description="Initiate a transfer to move units between Store and Godown."
                action={
                  <Button size="sm" onClick={() => setIsNewTransferModalOpen(true)}>
                    New Transfer
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Transfer #</th>
                    <th className="py-3 px-4">Source &rarr; Destination</th>
                    <th className="py-3 px-4">Items Transferred</th>
                    <th className="py-3 px-4 text-center">Total Units</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Initiated By</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransfers.map((trf) => (
                    <tr key={trf.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {trf.transferNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold capitalize text-slate-800">
                            {trf.sourceLocation}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold capitalize text-blue-700">
                            {trf.destinationLocation}
                          </span>
                        </div>
                        {trf.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{trf.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {trf.items.map((i, idx) => (
                          <div key={idx} className="text-slate-700">
                            <strong>{i.quantity}x</strong> {i.productName}
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {trf.totalItems} pcs
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            trf.status === 'completed'
                              ? 'success'
                              : trf.status === 'in_transit'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {trf.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{trf.initiatedBy}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(trf.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {trf.status === 'in_transit' ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => completeTransferMutation.mutate(trf.id)}
                            loading={completeTransferMutation.isPending}
                            icon={<Check className="w-3.5 h-3.5" />}
                          >
                            Receive & Stock
                          </Button>
                        ) : trf.status === 'completed' ? (
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Stocked
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
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

      {/* New Transfer Modal */}
      <Modal
        isOpen={isNewTransferModalOpen}
        onClose={() => setIsNewTransferModalOpen(false)}
        title="Initiate Stock Movement"
        subtitle="Transfer physical inventory between Retail Store and Central Godown"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Source Location"
              value={sourceLoc}
              onChange={(e) => handleSourceChange(e.target.value as LocationType)}
              options={[
                { label: 'Central Godown (GDN-01)', value: 'godown' },
                { label: 'Main Retail Store (STR-01)', value: 'store' }
              ]}
              required
            />

            <Select
              label="Destination Location"
              value={destLoc}
              onChange={(e) => setDestLoc(e.target.value as LocationType)}
              options={[
                { label: 'Main Retail Store (STR-01)', value: 'store' },
                { label: 'Central Godown (GDN-01)', value: 'godown' }
              ]}
              required
            />
          </div>

          {/* Product selector */}
          <Select
            label="Product to Move"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            options={summaries.map(s => ({
              label: `${s.productName} (${s.sku}) — Available at ${sourceLoc.toUpperCase()}: ${
                sourceLoc === 'store' ? s.storeQty : s.godownQty
              } pcs`,
              value: s.productId
            }))}
            required
          />

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Transfer Quantity (Max available: {availableAtSource})
            </label>
            <input
              type="number"
              min={1}
              max={availableAtSource || 1}
              value={transferQty}
              onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
              className="w-full text-sm rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Transfer Notes / Reason (Optional)
            </label>
            <textarea
              rows={2}
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
              placeholder="e.g. Replenishing retail counter display ahead of weekend sale"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewTransferModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={createTransferMutation.isPending}
            >
              Dispatch Transfer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
