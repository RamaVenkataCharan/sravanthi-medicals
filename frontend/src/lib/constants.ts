export const STORE_INFO = {
  name: 'Sravanthi Medical Stores',
  tagline: 'Your Trusted Pharmacy Partner',
  address: 'Near Sivalayam, Bustand Road',
  city: 'NUZVID',
  pincode: '521201',
  state: 'Andhra Pradesh',
  fullAddress: 'Near Sivalayam, Bustand Road, NUZVID - 521201',
  phone: '',
  licenses: {
    form20: 'Form 20 - K.R. 118',
    form21: 'Form 21 - K.R. 118',
  },
};

export const STOCK_ALERT_THRESHOLD = 10;
export const EXPIRY_ALERT_DAYS = 90;
export const EXPIRY_WARNING_DAYS = 30;

export const BILL_FOOTER = {
  scheduleH:
    'Caution: Schedule H Drug — Warning: To be sold by retail on the prescription of a Registered Medical Practitioner only.',
  taxNote: 'Prices inclusive of all Taxes.',
  signature: 'Signature of Qualified Person',
  thankYou: 'Thank you for your business!',
};

export const MEDICINE_CATEGORIES = ['Regular', 'Schedule H', 'Schedule X', 'OTC', 'Ayurvedic'];

export const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',         icon: 'LayoutDashboard' },
  { id: 'billing',    label: 'Billing POS',        icon: 'ShoppingCart'    },
  { id: 'inventory',  label: 'Inventory',          icon: 'Package'         },
  { id: 'history',    label: 'Bill History',       icon: 'History'         },
  { id: 'customers',  label: 'Customers',          icon: 'Users'           },
  { id: 'doctors',    label: 'Doctors',            icon: 'Stethoscope'     },
  { id: 'reports',    label: 'Reports',            icon: 'BarChart2'       },
  { id: 'expiry',     label: 'Expiry Management',  icon: 'AlertTriangle'   },
] as const;

export type PageId = typeof NAV_ITEMS[number]['id'];
