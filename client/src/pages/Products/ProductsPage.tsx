import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { productService, type CreateProductInput } from '../../services/productService';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { LoadingState, EmptyState } from '../../components/ui/FeedbackStates';
import { useAuth } from '../../hooks/useAuth';

export const ProductsPage: React.FC = () => {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateProductInput>({
    sku: '',
    name: '',
    category: 'Cables & Adapters',
    unit: 'pcs',
    unitPrice: 0,
    costPrice: 0,
    minStockThreshold: 5,
    description: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Query Products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts()
  });

  // Mutation
  const createProductMutation = useMutation({
    mutationFn: (newProduct: CreateProductInput) => productService.createProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsAddModalOpen(false);
      setSuccessMsg('Product successfully created in catalog.');
      setTimeout(() => setSuccessMsg(null), 3500);
      setFormData({
        sku: '',
        name: '',
        category: 'Cables & Adapters',
        unit: 'pcs',
        unitPrice: 0,
        costPrice: 0,
        minStockThreshold: 5,
        description: ''
      });
      setFormError(null);
    },
    onError: (err: Error) => {
      setFormError(err.message);
    }
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.sku.trim()) {
      setFormError('Product SKU identifier is required (e.g. SKU-HDM-2M)');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Product name is required');
      return;
    }
    if (formData.unitPrice <= 0) {
      setFormError('Selling price must be greater than zero');
      return;
    }
    if (formData.costPrice < 0) {
      setFormError('Cost price cannot be negative');
      return;
    }

    createProductMutation.mutate(formData);
  };

  // Filter products
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Master definitions and SKU templates. Individual physical items are tracked via QR codes.
          </p>
        </div>

        {role === 'admin' ? (
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add New Product
          </Button>
        ) : (
          <Badge variant="warning">Catalog Edit Restricted to Admin</Badge>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by SKU or Product Name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                Category: {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader
          title="Catalog Items"
          subtitle={`Showing ${filteredProducts.length} registered products`}
        />
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingState message="Fetching product catalog..." />
          ) : filteredProducts.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No products match your criteria"
                description="Try clearing search filters or add a new master product SKU to get started."
                action={
                  role === 'admin' ? (
                    <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                      Add Product
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">SKU / Code</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-right">Cost Price</th>
                    <th className="py-3 px-4 text-center">Min Threshold</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.sku}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        {p.description && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{p.unitPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 font-medium">
                        ₹{p.costPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-700">
                        {p.minStockThreshold} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={p.status === 'active' ? 'success' : 'neutral'}>
                          {p.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Master Product"
        subtitle="Define a new SKU. Physical items can then be registered using individual QR codes."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product SKU Code"
              placeholder="e.g. SKU-HDM-3M"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              required
              helperText="Unique uppercase catalog identifier"
            />

            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { label: 'Cables & Adapters', value: 'Cables & Adapters' },
                { label: 'Power & Charging', value: 'Power & Charging' },
                { label: 'Storage', value: 'Storage' },
                { label: 'Peripherals', value: 'Peripherals' },
                { label: 'General Merchandise', value: 'General Merchandise' }
              ]}
              required
            />
          </div>

          <Input
            label="Product Title / Name"
            placeholder="e.g. Braided 4K HDMI Cable 3m"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Selling Price (₹)"
              type="number"
              placeholder="0"
              value={formData.unitPrice || ''}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              required
            />

            <Input
              label="Cost Price (₹)"
              type="number"
              placeholder="0"
              value={formData.costPrice || ''}
              onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
              required
            />

            <Input
              label="Min Alert Level"
              type="number"
              value={formData.minStockThreshold}
              onChange={(e) => setFormData({ ...formData, minStockThreshold: parseInt(e.target.value) || 5 })}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={createProductMutation.isPending}
            >
              Save Product SKU
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
