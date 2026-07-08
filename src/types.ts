/**
 * Types & Interfaces for Premium PHP Digital Shop
 */

export interface Landmark {
  id: string;
  name: string;
  type: 'admin' | 'craft' | 'temple' | 'nature' | 'market';
  lat: number;
  lng: number;
  description: string;
  phone?: string;
  imageUrl: string;
}

export interface AppSettings {
  siteName: string;
  siteSubtitle: string;
  primaryColor: string; // e.g., 'crimson', 'cyan', 'indigo', 'emerald', 'yellow'
  themeMode: 'dark' | 'light';
  contactFacebook: string;
  contactDiscord: string;
  contactLine: string;
  truewalletPhone: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  qrSlipToken: string;
  botCfTurnstileKey: string;
  discordClientId: string;
  discordClientSecret: string;
  banners: string[]; // Carousel images
  allowAngpao: boolean;
  allowQr: boolean;
  siteLogoUrl?: string;
  siteBackgroundUrl?: string;
  announcementActive?: boolean;
  announcementTitle?: string;
  announcementBody?: string;
  announcementImageUrl?: string;
  announcementBarActive?: boolean;
  announcementBarText?: string;
  announcementBarBgColor?: string;
  announcementBarTextColor?: string;
  announcementBarSpeed?: number; // speed in seconds (duration of 1 complete marquee cycle)
  announcementBarStyle?: 'solid' | 'gradient-gold' | 'neon-glow' | 'glassmorphism';
  announcementBarPrefix?: string; // Static prefix tag text like "📢 ข่าวสาร" or "✨ SPECIAL"
  announcementFloatActive?: boolean;
  announcementFloatText?: string;
  announcementFloatStyle?: 'pastel-orange' | 'neon-cyan' | 'luxury-gold' | 'crimson-bold' | 'emerald-green';
  announcementFloatIcon?: 'broadcast' | 'welcome' | 'sale' | 'winner' | 'alert';
  announcementFloatPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  maintenanceActive?: boolean;
  maintenanceTitle?: string;
  maintenanceMessage?: string;
  maintenanceEstimatedTime?: string;
  maintenanceAutoOpenTime?: string; // ISO or YYYY-MM-DDTHH:MM datetime string when maintenance should automatically end
  serverTime?: number; // Server epoch timestamp to synchronize client clocks
  aboutUsTitle?: string;
  aboutUsBody?: string;
  aboutUsImageUrl?: string;
  portfolios?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
  }[];
  artisans?: {
    id: string;
    name: string;
    expertise: string;
    bio: string;
    imageUrl: string;
  }[];
  landmarks?: Landmark[];
  recommendActive?: boolean;
  recommendTitle?: string;
  recommendSubtitle?: string;
  recommendProductIds?: string[];
  seasonalEffect?: 'snow' | 'halloween' | 'valentine' | 'christmas' | 'songkran' | 'newyear' | 'goldenstar' | 'none';
  recentOrdersActive?: boolean;
  recentOrdersStyle?: 'violet-indigo' | 'sunset-orange' | 'emerald-green' | 'crimson-rose' | 'luxury-gold' | 'cyberpunk-neon' | 'glass-monochrome';
  recentOrdersSpeed?: 'slow' | 'normal' | 'fast' | 'vfast';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  imageUrl: string;
}

export interface BoxItem {
  id: string;
  name: string;
  rate: number; // percentage (e.g. 5, 10, 50, etc.)
  isJackpot: boolean;
  accountData: string; // The reward code / details
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: string[]; // Array of unique item details or CD keys (each buy removes one element, stock count is array.length)
  timesSold: number;
  details: string; // Markdown / extended specs
  type: 'normal' | 'box';
  videoUrl?: string; // YouTube video link for embed reviews
  boxItems?: BoxItem[]; // Available outcomes if type = 'box'
  sellerId?: string;
  sellerName?: string;
  sellerType?: 'internal' | 'external';
}

export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  role: 'user' | 'admin' | 'seller_internal' | 'seller_external';
  discordId?: string;
  avatarUrl?: string;
  password?: string;
  pendingBalance?: number;
  withdrawableBalance?: number;
}

export interface Coupon {
  code: string;
  discountPercent: number; // percentage discount (e.g., 10 for 10%)
  discountBaht: number; // flat discount (e.g., 50 THB)
  usesLeft: number;
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: 'topup_qr' | 'topup_angpao' | 'purchase_product' | 'purchase_box';
  amount: number;
  details: string;
  status: 'pending' | 'success' | 'failed';
  date: string;
  shippingDetails?: {
    name: string;
    phone: string;
    address: string;
    zip: string;
    method: string;
    fee: number;
  };
  orderStatus?: 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  trackingCarrier?: string;
  statusUpdates?: { status: string; date: string; note?: string }[];
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  rating: number; // 1 to 5
  productId: string;
  productName: string;
  comment: string;
  date: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  sellerId: string;
  shopId: string;
  lastMessage: string;
  lastMessageAt: string;
  status: 'active' | 'closed' | 'blocked';
  createdAt: string;
  isTypingSeller?: boolean; // temporary typing state
  isTypingCustomer?: boolean; // temporary typing state
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  messageType: 'text' | 'image' | 'product' | 'order' | 'paymentSlip' | 'location';
  image?: string;
  isRead: boolean;
  createdAt: string;
  replyToId?: string; // ID of message being replied to
  replyToMessage?: string; // Text content being replied to
  productInfo?: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    description: string;
  };
  orderInfo?: {
    id: string;
    productName: string;
    amount: number;
    status: string;
    date: string;
  };
  locationInfo?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

