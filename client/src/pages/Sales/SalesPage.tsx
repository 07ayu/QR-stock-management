import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Receipt, 
  ArrowRight
} from 'lucide-react';
import { saleService } from '../../services/saleService';
import { productService } from '../../services/productService';
import type { SaleItem, PaymentMethod } from '../../types';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { LoadingState, EmptyState } from '../../components/ui/FeedbackStates';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export const SalesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, currentLocation } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);

  // New Sale Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [successSale, setSuccessSale] = useState<string | null>(null);

  // Temporary item picker
  const [selectedProdId, setSelectedProdId] = useState<string>('');
  const [pickerQty, setPickerQty] = useState<number>(1);
  const [attachedQr, setAttachedQr] = useState<string>('');

  // Queries
  const { data: sales = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ['sales'],
    queryFn: () => saleService.getSales()
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts()
  });

  // Calculate totals
  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const taxable = Math.max(0, subtotal - discount);
  const tax = Number((taxable * 0.18).toFixed(2));
  const grandTotal = Number((taxable + tax).toFixed(2));

  // Add item to cart
  const handleAddToCart = () => {
    const product = products.find(p => p.id === selectedProdId);
    if (!product) return;

    const existingIndex = cartItems.findIndex(i => i.productId === product.id);
    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += pickerQty;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * product.unitPrice;
      if (attachedQr.trim()) {
        updated[existingIndex].qrCodes = [
          ...(updated[existingIndex].qrCodes || []),
          attachedQr.trim().toUpperCase()
        ];
      }
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity: pickerQty,
          unitPrice: product.unitPrice,
          totalPrice: pickerQty * product.unitPrice,
          qrCodes: attachedQr.trim() ? [attachedQr.trim().toUpperCase()] : []
        }
      ]);
    }
    setAttachedQr('');
    setPickerQty(1);
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // Submit Sale Mutation
  const saleMutation = useMutation({
    mutationFn: async () => {
      return saleService.recordSale({
        customerName,
        customerPhone,
        location: currentLocation,
        items: cartItems,
        paymentMethod,
        discount,
        soldBy: user?.name || 'Staff'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['stockSummaries'] });
      setIsNewSaleModalOpen(false);
      setSuccessSale(`Sale ${data.saleNumber} completed. Invoice generated.`);
      setTimeout(() => setSuccessSale(null), 4500);
      setCartItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscount(0);
      setSaleError(null);
    },
    onError: (err: Error) => {
      setSaleError(err.message);
    }
  });

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaleError(null);

    if (!customerName.trim()) {
      setSaleError('Please provide the customer name.');
      return;
    }
    if (!customerPhone.trim()) {
      setSaleError('Customer mobile number is required for WhatsApp invoice delivery.');
      return;
    }
    if (cartItems.length === 0) {
      setSaleError('Cart is empty. Add at least one item.');
      return;
    }

    saleMutation.mutate();
  };

  const filteredSales = sales.filter(s => {
    return (
      s.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerPhone.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Sales & Billing Counter
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Retail Point-of-Sale checkout with item QR linking and automatic invoice generation.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            if (products.length > 0 && !selectedProdId) {
              setSelectedProdId(products[0].id);
            }
            setIsNewSaleModalOpen(true);
          }}
          icon={<ShoppingCart className="w-3.5 h-3.5" />}
        >
          New Sale / Checkout
        </Button>
      </div>

      {successSale && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successSale}</span>
          </div>
          <Link
            to="/invoices"
            className="font-semibold text-emerald-900 underline flex items-center gap-1"
          >
            <span>View Invoices</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
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
            placeholder="Search sale number, customer name, or phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Sales History Table */}
      <Card>
        <CardHeader
          title="Sales History"
          subtitle={`Showing ${filteredSales.length} retail transactions`}
        />
        <CardContent className="p-0">
          {isLoadingSales ? (
            <LoadingState message="Fetching sales records..." />
          ) : filteredSales.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No sales found"
                description="Record a sale through the checkout window to create transaction receipts."
                action={
                  <Button size="sm" onClick={() => setIsNewSaleModalOpen(true)}>
                    Record First Sale
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Sale #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-center">Payment</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-center">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{sale.saleNumber}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(sale.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{sale.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{sale.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {sale.items.map((i, idx) => (
                            <div key={idx} className="text-slate-700">
                              <strong>{i.quantity}x</strong> {i.productName}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={sale.location === 'store' ? 'info' : 'warning'}>
                          {sale.location.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="purple">{sale.paymentMethod.toUpperCase()}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{sale.grandTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          to="/invoices"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Sale Modal (POS Style) */}
      <Modal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        title="Point of Sale — Checkout"
        subtitle="Complete customer transaction and generate digital invoice"
        maxWidth="xl"
      >
        <form onSubmit={handleSaleSubmit} className="space-y-4">
          {saleError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{saleError}</span>
            </div>
          )}

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <Input
              label="Customer Full Name"
              placeholder="e.g. Anand Kulkarni"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <Input
              label="WhatsApp Mobile Number"
              placeholder="+91 98765 43210"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
              helperText="For instant WhatsApp digital invoice delivery"
            />
          </div>

          {/* Add Item to Cart Section */}
          <div className="p-3.5 border border-slate-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Add Item to Transaction
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-6">
                <Select
                  label="Select Product"
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  options={products.map(p => ({
                    label: `${p.name} — ₹${p.unitPrice}`,
                    value: p.id
                  }))}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Qty"
                  type="number"
                  min={1}
                  value={pickerQty}
                  onChange={(e) => setPickerQty(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  label="Unit QR (Opt.)"
                  placeholder="QR-STR-01-..."
                  value={attachedQr}
                  onChange={(e) => setAttachedQr(e.target.value)}
                />
              </div>
              <div className="sm:col-span-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddToCart}
                  className="w-full"
                  title="Add to cart"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Cart Table */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase mb-1.5">
              Items in Sale ({cartItems.length})
            </div>
            {cartItems.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                No items added yet. Select a product above to add.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-right">Total</th>
                      <th className="p-2.5 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cartItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-900">{item.productName}</div>
                          {item.qrCodes && item.qrCodes.length > 0 && (
                            <div className="text-[10px] text-blue-600 font-mono">
                              QR: {item.qrCodes.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-800">{item.quantity}</td>
                        <td className="p-2.5 text-right text-slate-600">₹{item.unitPrice}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">₹{item.totalPrice}</td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment & Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div className="space-y-3">
              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                options={[
                  { label: 'UPI / QR Payment', value: 'upi' },
                  { label: 'Credit / Debit Card', value: 'card' },
                  { label: 'Cash in Hand', value: 'cash' }
                ]}
              />

              <Input
                label="Discount Amount (₹)"
                type="number"
                min={0}
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Discount:</span>
                <span className="text-rose-600">-₹{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Estimated GST (18%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-blue-700">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notice & Buttons */}
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Confirmation step: Submitting will deduct inventory from {currentLocation.toUpperCase()} and generate an invoice.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewSaleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={saleMutation.isPending}
              disabled={cartItems.length === 0}
            >
              Confirm Sale & Generate Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
