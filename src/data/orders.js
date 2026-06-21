export const staticOrders = [
  {
    id: 1001,
    orderNumber: "SWN-2026-9901",
    buyerId: 201,
    buyerName: "El Amal Wholesale Traders",
    buyerNameAr: "محلات الأمل لتجارة الجملة",
    sellerId: 101,
    sellerName: "El Noor Garment Factory",
    sellerNameAr: "مصنع النور للملابس",
    date: "2026-06-18T10:30:00Z",
    subtotal: 50000,
    discount: 5000, // 10% volume discount for 1000 items
    shippingCost: 350,
    totalAmount: 45350,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "creditCard",
    shippingAddress: "50 El-Mosky St, Cairo, Egypt",
    shippingAddressAr: "50 شارع الموسكي، القاهرة، مصر",
    items: [
      {
        productId: 1,
        nameEn: "Cotton Crewneck T-Shirt (Bulk pack)",
        nameAr: "تيشيرت قطن رقبة دائرية (جملة)",
        quantity: 1000,
        price: 50,
        total: 50000
      }
    ],
    timeline: [
      { status: "pending", time: "2026-06-18T10:30:00Z" },
      { status: "confirmed", time: "2026-06-18T11:15:00Z" },
      { status: "preparing", time: "2026-06-18T14:00:00Z" },
      { status: "shipped", time: "2026-06-19T09:00:00Z" },
      { status: "delivered", time: "2026-06-20T12:00:00Z" }
    ]
  },
  {
    id: 1002,
    orderNumber: "SWN-2026-9902",
    buyerId: 201,
    buyerName: "El Amal Wholesale Traders",
    buyerNameAr: "محلات الأمل لتجارة الجملة",
    sellerId: 101,
    sellerName: "El Noor Garment Factory",
    sellerNameAr: "مصنع النور للملابس",
    date: "2026-06-19T14:22:00Z",
    subtotal: 24000,
    discount: 1920, // 8% volume discount for 200 items
    shippingCost: 200,
    totalAmount: 22280,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "bankTransfer",
    shippingAddress: "50 El-Mosky St, Cairo, Egypt",
    shippingAddressAr: "50 شارع الموسكي، القاهرة، مصر",
    items: [
      {
        productId: 2,
        nameEn: "Premium Slim-Fit Denim Jeans",
        nameAr: "بنطلون جينز سليم فيت فاخر",
        quantity: 200,
        price: 120,
        total: 24000
      }
    ],
    timeline: [
      { status: "pending", time: "2026-06-19T14:22:00Z" },
      { status: "confirmed", time: "2026-06-19T15:30:00Z" },
      { status: "preparing", time: "2026-06-20T08:00:00Z" },
      { status: "shipped", time: "2026-06-20T15:00:00Z" }
    ]
  },
  {
    id: 1003,
    orderNumber: "SWN-2026-9903",
    buyerId: 301,
    buyerName: "El Khair Retail Store",
    buyerNameAr: "سوبرماركت الخير بالمنصورة",
    sellerId: 201, // purchased from the Wholesaler
    sellerName: "El Amal Wholesale Traders",
    sellerNameAr: "محلات الأمل لتجارة الجملة",
    date: "2026-06-20T09:15:00Z",
    subtotal: 3500,
    discount: 0, // below discount tier
    shippingCost: 150,
    totalAmount: 3650,
    status: "preparing",
    paymentStatus: "pending",
    paymentMethod: "cod",
    shippingAddress: "El-Gesh St, Mansoura, Dakahlia, Egypt",
    shippingAddressAr: "شارع الجيش، المنصورة، الدقهلية، مصر",
    items: [
      {
        productId: 1, // Resold by Wholesaler at markup (e.g. 70 EGP)
        nameEn: "Cotton Crewneck T-Shirt (Retail resale)",
        nameAr: "تيشيرت قطن رقبة دائرية (إعادة بيع)",
        quantity: 50,
        price: 70,
        total: 3500
      }
    ],
    timeline: [
      { status: "pending", time: "2026-06-20T09:15:00Z" },
      { status: "confirmed", time: "2026-06-20T10:00:00Z" },
      { status: "preparing", time: "2026-06-20T13:30:00Z" }
    ]
  },
  {
    id: 1004,
    orderNumber: "SWN-2026-9904",
    buyerId: 201,
    buyerName: "El Amal Wholesale Traders",
    buyerNameAr: "محلات الأمل لتجارة الجملة",
    sellerId: 104,
    sellerName: "CleanMax Chemical Industries",
    sellerNameAr: "كلين ماكس للصناعات الكيماوية",
    date: "2026-06-20T17:45:00Z",
    subtotal: 22000,
    discount: 1980, // 9% discount for 2000 items
    shippingCost: 400,
    totalAmount: 20420,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "bankTransfer",
    shippingAddress: "50 El-Mosky St, Cairo, Egypt",
    shippingAddressAr: "50 شارع الموسكي، القاهرة، مصر",
    items: [
      {
        productId: 10,
        nameEn: "Moisturizing Aloe Vera Hand Wash (500ml)",
        nameAr: "غسول يدين مرطب بالألوفيرا (500 مل)",
        quantity: 2000,
        price: 28,
        total: 56000
      }
    ],
    timeline: [
      { status: "pending", time: "2026-06-20T17:45:00Z" }
    ]
  }
];
