import React from 'react';
import { 
  Boxes, 
  IndianRupee, 
  ShoppingCart, 
  AlertTriangle, 
  ArrowLeftRight, 
  Plus, 
  ArrowUpRight, 
  Store, 
  Warehouse,
  QrCode
} from 'lucide-react';
import { MetricCard, Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  DEMO_STOCK_SUMMARIES, 
  DEMO_TRANSFERS, 
  DEMO_SALES, 
  DEMO_INVENTORY_ITEMS 
} from '../../services/mockData';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const { role } = useAuth();

  // Aggregate metrics from demo data
  const totalItemsCount = DEMO_STOCK_SUMMARIES.reduce((acc, curr) => acc + curr.totalQty, 0);
  const storeStockCount = DEMO_STOCK_SUMMARIES.reduce((acc, curr) => acc + curr.storeQty, 0);
  const godownStockCount = DEMO_STOCK_SUMMARIES.reduce((acc, curr) => acc + curr.godownQty, 0);

  const totalInventoryValue = DEMO_STOCK_SUMMARIES.reduce(
    (acc, curr) => acc + curr.totalQty * curr.unitPrice, 
    0
  );

  const lowStockItems = DEMO_STOCK_SUMMARIES.filter((item) => item.isLowStock);
  const salesTodayCount = DEMO_SALES.length;
  const salesTodayValue = DEMO_SALES.reduce((acc, curr) => acc + curr.grandTotal, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Operational Dashboard
            </h1>
            <span className="text-[11px] font-semibold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
              {role} View
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock monitoring across Retail Store and Central Godown
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/sales">
            <Button size="sm" icon={<ShoppingCart className="w-3.5 h-3.5" />}>
              Record Sale
            </Button>
          </Link>
          <Link to="/transfers">
            <Button size="sm" variant="outline" icon={<ArrowLeftRight className="w-3.5 h-3.5" />}>
              Transfer Stock
            </Button>
          </Link>
          {role === 'admin' && (
            <Link to="/products">
              <Button size="sm" variant="outline" icon={<Plus className="w-3.5 h-3.5" />}>
                New Product
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Physical Stock"
          value={`${totalItemsCount} units`}
          subtitle={`Store: ${storeStockCount} | Godown: ${godownStockCount}`}
          icon={<Boxes className="w-5 h-5" />}
          badge={<Badge variant="info">All Locations</Badge>}
        />

        <MetricCard
          title="Retail Stock Value"
          value={`₹${totalInventoryValue.toLocaleString('en-IN')}`}
          subtitle="Estimated retail selling valuation"
          icon={<IndianRupee className="w-5 h-5" />}
          trend={{ value: '+4.2%', isPositive: true }}
        />

        <MetricCard
          title="Sales Recorded Today"
          value={`${salesTodayCount} orders`}
          subtitle={`Revenue: ₹${salesTodayValue.toLocaleString('en-IN')}`}
          icon={<ShoppingCart className="w-5 h-5" />}
          trend={{ value: '+12%', isPositive: true }}
        />

        <MetricCard
          title="Low Stock Alerts"
          value={`${lowStockItems.length} items`}
          subtitle="Products below minimum threshold"
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          badge={<Badge variant={lowStockItems.length > 0 ? 'warning' : 'success'}>Action Required</Badge>}
        />
      </div>

      {/* Location Stock Balance Comparison */}
      <Card>
        <CardHeader
          title="Location Stock Breakdown"
          subtitle="Inventory distribution between Main Retail Store and Central Godown"
          action={
            <Link
              to="/inventory"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View Full Inventory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Store Card */}
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Main Retail Store (STR-01)
                  </h4>
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{storeStockCount} units</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Available for counter checkout</p>
              </div>
              <Badge variant="info">Active Counter</Badge>
            </div>

            {/* Godown Card */}
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Central Godown (GDN-01)
                  </h4>
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{godownStockCount} units</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Bulk reserve ready for store transfer</p>
              </div>
              <Badge variant="warning">Bulk Reserve</Badge>
            </div>
          </div>

          {/* Product stock balance table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Product / SKU</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Retail Store</th>
                  <th className="py-2.5 px-3 text-right">Central Godown</th>
                  <th className="py-2.5 px-3 text-right">Total Balance</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEMO_STOCK_SUMMARIES.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.sku}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{item.category}</td>
                    <td className="py-3 px-3 text-right font-medium text-blue-700">
                      {item.storeQty} pcs
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-amber-700">
                      {item.godownQty} pcs
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {item.totalQty} pcs
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.isLowStock ? (
                        <Badge variant="warning">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">Healthy</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Section: Recent Transfers & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stock Transfers */}
        <Card>
          <CardHeader
            title="Recent Stock Transfers"
            subtitle="Recent transfers between store and godown"
            action={
              <Link to="/transfers" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <span>All Transfers</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 text-xs">
              {DEMO_TRANSFERS.slice(0, 3).map((trf) => (
                <div key={trf.id} className="p-4 hover:bg-slate-50/50 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-900">{trf.transferNumber}</span>
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
                    </div>
                    <p className="text-slate-500 mt-1">
                      From <strong className="capitalize text-slate-700">{trf.sourceLocation}</strong> to{' '}
                      <strong className="capitalize text-slate-700">{trf.destinationLocation}</strong> ({trf.totalItems} items)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400">
                      {new Date(trf.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unique Physical Item Tracking Preview */}
        <Card>
          <CardHeader
            title="Physical Item QR Identifiers"
            subtitle="Items tagged with discrete physical unit QR codes"
            action={
              <Link to="/inventory" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <span>Inspect All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 text-xs">
              {DEMO_INVENTORY_ITEMS.slice(0, 3).map((itm) => (
                <div key={itm.id} className="p-4 hover:bg-slate-50/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-blue-700">{itm.qrCode}</div>
                      <div className="text-slate-600">{itm.productName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={itm.location === 'store' ? 'info' : 'warning'}>
                      {itm.location.toUpperCase()}
                    </Badge>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Received {new Date(itm.receivedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
