import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle, Keyboard } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  title?: string;
  description?: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Scan Physical Item QR Code',
  description = 'Point camera at the unique QR code affixed to the physical item'
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = 'pwa-qr-reader-container';

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        });
      } else {
        scannerRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopScanner();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      setIsInitializing(true);
      setCameraError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 150));
        if (!isMounted) return;

        const scanner = new Html5Qrcode(scannerElementId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            if (isMounted) {
              stopScanner();
              onScanSuccess(decodedText);
              onClose();
            }
          },
          () => {
            // Frame scan failure is normal for unfocused frames
          }
        );
      } catch (err: unknown) {
        if (isMounted) {
          const errMsg = (err as Error)?.message || String(err);
          if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
            setCameraError('Camera access was denied. Please allow camera permissions in your browser or switch to manual code entry.');
          } else if (errMsg.includes('NotFoundError') || errMsg.includes('no camera')) {
            setCameraError('No camera detected on this device. Please use manual entry below.');
          } else {
            setCameraError(`Camera initialisation failed: ${errMsg}`);
          }
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen, activeTab, stopScanner, onScanSuccess, onClose]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim().toUpperCase());
    setManualCode('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex border-b border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'camera'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            Live Camera
          </button>
          <button
            type="button"
            onClick={() => {
              stopScanner();
              setActiveTab('manual');
            }}
            className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual Entry
          </button>
        </div>

        {/* Content body */}
        <div className="p-5">
          {activeTab === 'camera' ? (
            <div>
              {cameraError ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-xs text-amber-900 font-medium mb-1">Camera Notice</p>
                  <p className="text-xs text-amber-700 mb-3">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('manual')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium transition"
                  >
                    Switch to Manual Entry
                  </button>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
                  <div id={scannerElementId} className="w-full min-h-[260px] flex items-center justify-center" />
                  {isInitializing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-white text-xs gap-2">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Requesting camera permission...</span>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-3 text-center">
                <span className="text-[11px] text-slate-500">
                  Note: Scanning looks up or attaches the physical item; stock is only modified upon explicit confirmation.
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unique Item QR Code
                </label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. QR-STR-01-00811"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono uppercase"
                  autoFocus
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Type the alphanumeric identifier printed below or embedded in the physical item's QR sticker.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    stopScanner();
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition shadow-sm"
                >
                  Confirm Identifier
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
