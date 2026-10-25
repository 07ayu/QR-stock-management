import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText,
  ShieldAlert
} from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';
import type { Invoice, WhatsAppStatus } from '../../types';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingState, EmptyState } from '../../components/ui/FeedbackStates';

export const InvoicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [retryNotice, setRetryNotice] = useState<string | null>(null);

  // Query Invoices
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceService.getInvoices()
  });

  // Mutation for WhatsApp retry dispatch
  const retryMutation = useMutation({
    mutationFn: (id: string) => invoiceService.retryWhatsAppDelivery(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setRetryNotice(`WhatsApp delivery queued on backend for invoice ${updated.invoiceNumber}.`);
      setTimeout(() => setRetryNotice(null), 4000);
      if (selectedInvoice?.id === updated.id) {
        setSelectedInvoice(updated);
      }
    },
    onError: (err: Error) => {
      alert(`Retry failed: ${err.message}`);
    }
  });

  const getWhatsAppBadge = (status: WhatsAppStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>
            Delivered
          </Badge>
        );
      case 'sent':
        return (
          <Badge variant="info" icon={<Send className="w-3 h-3" />}>
            Sent
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" icon={<Clock className="w-3 h-3" />}>
            Queued
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="danger" icon={<AlertCircle className="w-3 h-3" />}>
            Failed
          </Badge>
        );
      default:
        return <Badge variant="neutral">Not Sent</Badge>;
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    return (
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerPhone.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Invoices & WhatsApp Delivery
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tax invoices generated from sales. WhatsApp messaging is dispatched securely by backend worker services.
          </p>
        </div>
      </div>

      {/* Backend Security Notice */}
      <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block">Security & WhatsApp Dispatch Architecture:</span>
          <span className="text-blue-800 text-[11px] leading-relaxed">
            WhatsApp Business API credentials, access tokens, and message payload construction remain exclusively protected within the NestJS backend. The frontend initiates delivery status queries and dispatches retry requests.
          </span>
        </div>
      </div>

      {retryNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{retryNotice}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice number, customer name, or phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader
          title="Generated Invoices"
          subtitle={`Showing ${filteredInvoices.length} invoices`}
        />
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingState message="Fetching invoices..." />
          ) : filteredInvoices.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No invoices found"
                description="Invoices are created automatically when customer sales are completed at the billing counter."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">WhatsApp Delivery</th>
                    <th className="py-3 px-4">Date Issued</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{inv.customerName}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{inv.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{inv.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="success">{inv.status.toUpperCase()}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {getWhatsAppBadge(inv.whatsappStatus)}
                          {inv.whatsappError && (
                            <span className="text-[10px] text-rose-600 truncate max-w-[140px]" title={inv.whatsappError}>
                              Timeout error
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(inv.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {inv.whatsappStatus === 'failed' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => retryMutation.mutate(inv.id)}
                            loading={retryMutation.isPending}
                            icon={<RefreshCw className="w-3 h-3" />}
                          >
                            Retry Send
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInvoice(inv)}
                          icon={<FileText className="w-3 h-3" />}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          title={`Tax Invoice ${selectedInvoice.invoiceNumber}`}
          subtitle="Digital Customer Copy"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-semibold text-slate-900">{selectedInvoice.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Recipient Phone:</span>
                <span className="font-mono text-slate-800">{selectedInvoice.customerPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Invoice Amount:</span>
                <span className="font-bold text-slate-900 text-sm">
                  ₹{selectedInvoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">WhatsApp Delivery:</span>
                <div>{getWhatsAppBadge(selectedInvoice.whatsappStatus)}</div>
              </div>
              {selectedInvoice.whatsappError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-[11px]">
                  <strong>Delivery Issue:</strong> {selectedInvoice.whatsappError}
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Issued On:</span>
                <span className="text-slate-700">
                  {new Date(selectedInvoice.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {selectedInvoice.whatsappStatus === 'failed' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => retryMutation.mutate(selectedInvoice.id)}
                  loading={retryMutation.isPending}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Retry Dispatch via WhatsApp
                </Button>
              )}
              <Button size="sm" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
