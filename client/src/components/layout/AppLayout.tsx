import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { DemoBanner } from '../ui/FeedbackStates';
import { QrScannerModal } from '../qr/QrScannerModal';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { inventoryService } from '../../services/inventoryService';
import type { InventoryItem } from '../../types';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [scannedResult, setScannedResult] = useState<{
    qr: string;
    item: InventoryItem | null;
  } | null>(null);

  const handleGlobalScanSuccess = async (qr: string) => {
    const item = await inventoryService.lookupItemByQr(qr);
    setScannedResult({ qr, item });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      {/* Top Demo Notice & Network Status Banner */}
      <DemoBanner />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0 pb-16 lg:pb-0">
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onOpenQrScanner={() => setQrModalOpen(true)}
          />

          <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenQrScanner={() => setQrModalOpen(true)} />

      {/* Global QR Scanner Modal */}
      <QrScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onScanSuccess={handleGlobalScanSuccess}
        title="Physical Item Scanner"
        description="Scan any physical QR code on an item to inspect its real-time location and status"
      />

      {/* Scanned Item Inspection Result Modal */}
      {scannedResult && (
        <Modal
          isOpen={true}
          onClose={() => setScannedResult(null)}
          title="Physical Item Verification"
          subtitle={`Identifier: ${scannedResult.qr}`}
        >
          {scannedResult.item ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-emerald-900">
                    Physical Unit Verified in Inventory
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    This unit has a unique identity matching our tracking records.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Product Name:</span>
                  <span className="font-semibold text-slate-900">{scannedResult.item.productName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Product SKU:</span>
                  <span className="font-mono font-medium text-slate-800">{scannedResult.item.sku}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Unique QR Identifier:</span>
                  <span className="font-mono font-semibold text-blue-700">{scannedResult.item.qrCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Current Location:</span>
                  <Badge variant={scannedResult.item.location === 'store' ? 'info' : 'warning'}>
                    {scannedResult.item.location === 'store' ? 'Main Retail Store' : 'Central Godown'}
                  </Badge>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Status:</span>
                  <Badge variant="success">{scannedResult.item.status.toUpperCase()}</Badge>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScannedResult(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Dismiss
                </button>
                <Link
                  to="/inventory"
                  onClick={() => setScannedResult(null)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition"
                >
                  <span>Go to Inventory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-rose-900">Item Not Recognized</h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    No physical item matches QR code <strong className="font-mono">{scannedResult.qr}</strong>.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Ensure this is an item-level unique sticker and not an external shipment barcode. You can receive this item into stock from the Inventory page.
              </p>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setScannedResult(null)}
                  className="px-4 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
