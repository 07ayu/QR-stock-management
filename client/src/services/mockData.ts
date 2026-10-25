import type { 
  Product, 
  InventoryItem, 
  StockSummary, 
  StockTransfer, 
  Sale, 
  Invoice, 
  User 
} from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'usr_admin_1',
    name: 'Rajesh Sharma',
    email: 'admin@stockmgmt.local',
    role: 'admin',
    defaultLocation: 'store'
  },
  {
    id: 'usr_emp_1',
    name: 'Vikram Singh',
    email: 'vikram.store@stockmgmt.local',
    role: 'employee',
    defaultLocation: 'store'
  },
  {
    id: 'usr_emp_2',
    name: 'Pooja Verma',
    email: 'pooja.godown@stockmgmt.local',
    role: 'employee',
    defaultLocation: 'godown'
  }
];

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prd_01',
    sku: 'SKU-HDM-2M',
    name: 'Premium 4K HDMI Cable 2m',
    category: 'Cables & Adapters',
    unit: 'pcs',
    unitPrice: 499,
    costPrice: 240,
    minStockThreshold: 15,
    description: 'Braided nylon gold-plated connector high speed 4K HDMI cable',
    status: 'active',
    createdAt: '2026-02-10T10:00:00Z'
  },
  {
    id: 'prd_02',
    sku: 'SKU-WCH-65W',
    name: 'GaN Fast Charger 65W Dual Port',
    category: 'Power & Charging',
    unit: 'pcs',
    unitPrice: 1899,
    costPrice: 1100,
    minStockThreshold: 10,
    description: 'Compact USB-C PD 3.0 laptop and mobile wall adapter',
    status: 'active',
    createdAt: '2026-02-14T11:30:00Z'
  },
  {
    id: 'prd_03',
    sku: 'SKU-SSD-1TB',
    name: 'NVMe M.2 Gen4 SSD 1TB',
    category: 'Storage',
    unit: 'pcs',
    unitPrice: 6499,
    costPrice: 4800,
    minStockThreshold: 8,
    description: '7000MB/s read speed with aluminum heatsink',
    status: 'active',
    createdAt: '2026-01-20T09:15:00Z'
  },
  {
    id: 'prd_04',
    sku: 'SKU-MOU-WL',
    name: 'Ergonomic Wireless Mouse',
    category: 'Peripherals',
    unit: 'pcs',
    unitPrice: 1250,
    costPrice: 720,
    minStockThreshold: 12,
    description: 'Dual bluetooth + 2.4GHz rechargeable silent mouse',
    status: 'active',
    createdAt: '2026-02-01T14:20:00Z'
  },
  {
    id: 'prd_05',
    sku: 'SKU-TBT-HUB',
    name: '8-in-1 Aluminum USB-C Hub',
    category: 'Cables & Adapters',
    unit: 'pcs',
    unitPrice: 2899,
    costPrice: 1650,
    minStockThreshold: 6,
    description: 'Dual HDMI, 100W PD passthrough, Ethernet, SD reader',
    status: 'active',
    createdAt: '2026-02-18T16:45:00Z'
  },
  {
    id: 'prd_06',
    sku: 'SKU-KBD-MEC',
    name: 'Tenkeyless Mechanical Keyboard (Brown Switch)',
    category: 'Peripherals',
    unit: 'pcs',
    unitPrice: 3499,
    costPrice: 2100,
    minStockThreshold: 5,
    description: 'RGB backlit hot-swappable tactile switches',
    status: 'active',
    createdAt: '2026-01-15T08:00:00Z'
  }
];

// Physical items with UNIQUE individual QR codes (not SKUs!)
export const DEMO_INVENTORY_ITEMS: InventoryItem[] = [
  // HDMI cables (Store: 12, Godown: 35)
  {
    id: 'itm_001',
    qrCode: 'QR-STR-01-00811',
    productId: 'prd_01',
    productName: 'Premium 4K HDMI Cable 2m',
    sku: 'SKU-HDM-2M',
    location: 'store',
    status: 'available',
    batchNumber: 'BAT-2026-FEB-A',
    receivedAt: '2026-02-12T09:00:00Z',
    lastMovedAt: '2026-02-15T10:30:00Z'
  },
  {
    id: 'itm_002',
    qrCode: 'QR-STR-01-00812',
    productId: 'prd_01',
    productName: 'Premium 4K HDMI Cable 2m',
    sku: 'SKU-HDM-2M',
    location: 'store',
    status: 'available',
    batchNumber: 'BAT-2026-FEB-A',
    receivedAt: '2026-02-12T09:00:00Z',
    lastMovedAt: '2026-02-15T10:30:00Z'
  },
  {
    id: 'itm_003',
    qrCode: 'QR-GDN-01-00813',
    productId: 'prd_01',
    productName: 'Premium 4K HDMI Cable 2m',
    sku: 'SKU-HDM-2M',
    location: 'godown',
    status: 'available',
    batchNumber: 'BAT-2026-FEB-A',
    receivedAt: '2026-02-12T09:00:00Z',
    lastMovedAt: '2026-02-12T09:00:00Z'
  },
  // GaN Chargers
  {
    id: 'itm_004',
    qrCode: 'QR-STR-01-00901',
    productId: 'prd_02',
    productName: 'GaN Fast Charger 65W Dual Port',
    sku: 'SKU-WCH-65W',
    location: 'store',
    status: 'available',
    batchNumber: 'BAT-2026-FEB-B',
    receivedAt: '2026-02-15T11:00:00Z',
    lastMovedAt: '2026-02-16T14:15:00Z'
  },
  {
    id: 'itm_005',
    qrCode: 'QR-GDN-01-00902',
    productId: 'prd_02',
    productName: 'GaN Fast Charger 65W Dual Port',
    sku: 'SKU-WCH-65W',
    location: 'godown',
    status: 'available',
    batchNumber: 'BAT-2026-FEB-B',
    receivedAt: '2026-02-15T11:00:00Z',
    lastMovedAt: '2026-02-15T11:00:00Z'
  },
  // SSDs
  {
    id: 'itm_006',
    qrCode: 'QR-STR-01-00720',
    productId: 'prd_03',
    productName: 'NVMe M.2 Gen4 SSD 1TB',
    sku: 'SKU-SSD-1TB',
    location: 'store',
    status: 'available',
    batchNumber: 'BAT-2026-JAN-C',
    receivedAt: '2026-01-22T13:00:00Z',
    lastMovedAt: '2026-02-01T11:00:00Z'
  },
  {
    id: 'itm_007',
    qrCode: 'QR-GDN-01-00721',
    productId: 'prd_03',
    productName: 'NVMe M.2 Gen4 SSD 1TB',
    sku: 'SKU-SSD-1TB',
    location: 'godown',
    status: 'available',
    batchNumber: 'BAT-2026-JAN-C',
    receivedAt: '2026-01-22T13:00:00Z',
    lastMovedAt: '2026-01-22T13:00:00Z'
  },
  // Mouse
  {
    id: 'itm_008',
    qrCode: 'QR-STR-01-00431',
    productId: 'prd_04',
    productName: 'Ergonomic Wireless Mouse',
    sku: 'SKU-MOU-WL',
    location: 'store',
    status: 'available',
    batchNumber: 'BAT-2026-FEB-D',
    receivedAt: '2026-02-05T10:00:00Z',
    lastMovedAt: '2026-02-06T12:00:00Z'
  },
  // USB-C Hub
  {
    id: 'itm_009',
    qrCode: 'QR-GDN-01-00512',
    productId: 'prd_05',
    productName: '8-in-1 Aluminum USB-C Hub',
    sku: 'SKU-TBT-HUB',
    location: 'godown',
    status: 'available',
    batchNumber: 'BAT-2026-FEB-E',
    receivedAt: '2026-02-20T14:00:00Z',
    lastMovedAt: '2026-02-20T14:00:00Z'
  },
  // Mechanical Keyboard
  {
    id: 'itm_010',
    qrCode: 'QR-STR-01-00305',
    productId: 'prd_06',
    productName: 'Tenkeyless Mechanical Keyboard (Brown Switch)',
    sku: 'SKU-KBD-MEC',
    location: 'store',
    status: 'available',
    batchNumber: 'BAT-2026-JAN-A',
    receivedAt: '2026-01-18T10:00:00Z',
    lastMovedAt: '2026-01-20T09:30:00Z'
  }
];

export const DEMO_STOCK_SUMMARIES: StockSummary[] = [
  {
    productId: 'prd_01',
    sku: 'SKU-HDM-2M',
    productName: 'Premium 4K HDMI Cable 2m',
    category: 'Cables & Adapters',
    unitPrice: 499,
    costPrice: 240,
    storeQty: 18,
    godownQty: 42,
    totalQty: 60,
    minThreshold: 15,
    isLowStock: false
  },
  {
    productId: 'prd_02',
    sku: 'SKU-WCH-65W',
    productName: 'GaN Fast Charger 65W Dual Port',
    category: 'Power & Charging',
    unitPrice: 1899,
    costPrice: 1100,
    storeQty: 4,
    godownQty: 16,
    totalQty: 20,
    minThreshold: 10,
    isLowStock: true // Store is very low
  },
  {
    productId: 'prd_03',
    sku: 'SKU-SSD-1TB',
    productName: 'NVMe M.2 Gen4 SSD 1TB',
    category: 'Storage',
    unitPrice: 6499,
    costPrice: 4800,
    storeQty: 3,
    godownQty: 5,
    totalQty: 8,
    minThreshold: 8,
    isLowStock: true
  },
  {
    productId: 'prd_04',
    sku: 'SKU-MOU-WL',
    productName: 'Ergonomic Wireless Mouse',
    category: 'Peripherals',
    unitPrice: 1250,
    costPrice: 720,
    storeQty: 14,
    godownQty: 30,
    totalQty: 44,
    minThreshold: 12,
    isLowStock: false
  },
  {
    productId: 'prd_05',
    sku: 'SKU-TBT-HUB',
    productName: '8-in-1 Aluminum USB-C Hub',
    category: 'Cables & Adapters',
    unitPrice: 2899,
    costPrice: 1650,
    storeQty: 2,
    godownQty: 12,
    totalQty: 14,
    minThreshold: 6,
    isLowStock: true // Store low
  },
  {
    productId: 'prd_06',
    sku: 'SKU-KBD-MEC',
    productName: 'Tenkeyless Mechanical Keyboard (Brown Switch)',
    category: 'Peripherals',
    unitPrice: 3499,
    costPrice: 2100,
    storeQty: 6,
    godownQty: 15,
    totalQty: 21,
    minThreshold: 5,
    isLowStock: false
  }
];

export const DEMO_TRANSFERS: StockTransfer[] = [
  {
    id: 'trf_01',
    transferNumber: 'TRF-2026-0038',
    sourceLocation: 'godown',
    destinationLocation: 'store',
    items: [
      {
        productId: 'prd_01',
        productName: 'Premium 4K HDMI Cable 2m',
        sku: 'SKU-HDM-2M',
        quantity: 10,
        qrCodes: ['QR-GDN-01-00813', 'QR-GDN-01-00814']
      },
      {
        productId: 'prd_02',
        productName: 'GaN Fast Charger 65W Dual Port',
        sku: 'SKU-WCH-65W',
        quantity: 5
      }
    ],
    totalItems: 15,
    status: 'completed',
    notes: 'Regular store shelf replenishment',
    initiatedBy: 'Vikram Singh',
    createdAt: '2026-02-23T11:20:00Z',
    completedAt: '2026-02-23T12:05:00Z'
  },
  {
    id: 'trf_02',
    transferNumber: 'TRF-2026-0039',
    sourceLocation: 'godown',
    destinationLocation: 'store',
    items: [
      {
        productId: 'prd_03',
        productName: 'NVMe M.2 Gen4 SSD 1TB',
        sku: 'SKU-SSD-1TB',
        quantity: 4
      }
    ],
    totalItems: 4,
    status: 'in_transit',
    notes: 'Requested urgent restock for retail display',
    initiatedBy: 'Rajesh Sharma',
    createdAt: '2026-02-24T09:30:00Z'
  },
  {
    id: 'trf_03',
    transferNumber: 'TRF-2026-0040',
    sourceLocation: 'store',
    destinationLocation: 'godown',
    items: [
      {
        productId: 'prd_06',
        productName: 'Tenkeyless Mechanical Keyboard',
        sku: 'SKU-KBD-MEC',
        quantity: 2
      }
    ],
    totalItems: 2,
    status: 'pending',
    notes: 'Return excess store units to bulk warehouse',
    initiatedBy: 'Vikram Singh',
    createdAt: '2026-02-24T14:10:00Z'
  }
];

export const DEMO_SALES: Sale[] = [
  {
    id: 'sale_01',
    saleNumber: 'SAL-2026-0192',
    customerName: 'Anand Kulkarni',
    customerPhone: '+91 98765 43210',
    location: 'store',
    items: [
      {
        productId: 'prd_02',
        productName: 'GaN Fast Charger 65W Dual Port',
        sku: 'SKU-WCH-65W',
        quantity: 1,
        unitPrice: 1899,
        totalPrice: 1899,
        qrCodes: ['QR-STR-01-00901']
      },
      {
        productId: 'prd_01',
        productName: 'Premium 4K HDMI Cable 2m',
        sku: 'SKU-HDM-2M',
        quantity: 1,
        unitPrice: 499,
        totalPrice: 499,
        qrCodes: ['QR-STR-01-00811']
      }
    ],
    subtotal: 2398,
    tax: 431.64,
    discount: 0,
    grandTotal: 2829.64,
    paymentMethod: 'upi',
    status: 'completed',
    soldBy: 'Vikram Singh',
    createdAt: '2026-02-24T15:20:00Z',
    invoiceId: 'inv_01'
  },
  {
    id: 'sale_02',
    saleNumber: 'SAL-2026-0193',
    customerName: 'Meera Deshmukh',
    customerPhone: '+91 98220 11223',
    location: 'store',
    items: [
      {
        productId: 'prd_03',
        productName: 'NVMe M.2 Gen4 SSD 1TB',
        sku: 'SKU-SSD-1TB',
        quantity: 1,
        unitPrice: 6499,
        totalPrice: 6499,
        qrCodes: ['QR-STR-01-00720']
      }
    ],
    subtotal: 6499,
    tax: 1169.82,
    discount: 200,
    grandTotal: 7468.82,
    paymentMethod: 'card',
    status: 'completed',
    soldBy: 'Vikram Singh',
    createdAt: '2026-02-24T16:45:00Z',
    invoiceId: 'inv_02'
  },
  {
    id: 'sale_03',
    saleNumber: 'SAL-2026-0194',
    customerName: 'Rahul Joshi',
    customerPhone: '+91 97654 32109',
    location: 'store',
    items: [
      {
        productId: 'prd_04',
        productName: 'Ergonomic Wireless Mouse',
        sku: 'SKU-MOU-WL',
        quantity: 2,
        unitPrice: 1250,
        totalPrice: 2500
      }
    ],
    subtotal: 2500,
    tax: 450,
    discount: 50,
    grandTotal: 2900,
    paymentMethod: 'cash',
    status: 'completed',
    soldBy: 'Vikram Singh',
    createdAt: '2026-02-24T17:15:00Z',
    invoiceId: 'inv_03'
  }
];

export const DEMO_INVOICES: Invoice[] = [
  {
    id: 'inv_01',
    invoiceNumber: 'INV-2026-0192',
    saleId: 'sale_01',
    customerName: 'Anand Kulkarni',
    customerPhone: '+91 98765 43210',
    amount: 2829.64,
    status: 'paid',
    whatsappStatus: 'delivered',
    createdAt: '2026-02-24T15:20:00Z',
    itemsCount: 2
  },
  {
    id: 'inv_02',
    invoiceNumber: 'INV-2026-0193',
    saleId: 'sale_02',
    customerName: 'Meera Deshmukh',
    customerPhone: '+91 98220 11223',
    amount: 7468.82,
    status: 'paid',
    whatsappStatus: 'sent',
    createdAt: '2026-02-24T16:45:00Z',
    itemsCount: 1
  },
  {
    id: 'inv_03',
    invoiceNumber: 'INV-2026-0194',
    saleId: 'sale_03',
    customerName: 'Rahul Joshi',
    customerPhone: '+91 97654 32109',
    amount: 2900.00,
    status: 'paid',
    whatsappStatus: 'failed',
    whatsappError: 'Recipient WhatsApp gateway timeout. Click retry to resend via backend queue.',
    createdAt: '2026-02-24T17:15:00Z',
    itemsCount: 2
  }
];
