import { prisma } from "./prisma.ts";

// Keep track of the last saved state representations as string maps to only execute queries on modified rows
const lastSavedCategories = new Map<string, string>();
const lastSavedProducts = new Map<string, string>();
const lastSavedUsers = new Map<string, string>();
const lastSavedCoupons = new Map<string, string>();
const lastSavedTransactions = new Map<string, string>();
const lastSavedReviews = new Map<string, string>();
const lastSavedSellerVerifications = new Map<string, string>();
const lastSavedWithdrawals = new Map<string, string>();
const lastSavedConversations = new Map<string, string>();
const lastSavedMessages = new Map<string, string>();
const lastSavedNotifications = new Map<string, string>();
const lastSavedSettingsStr = { val: "" };

// Settings Serializers
function serializeSettings(s: any) {
  return {
    siteName: s.siteName || "ชุมชนตำบลน้ำน้อย",
    siteSubtitle: s.siteSubtitle || "",
    primaryColor: s.primaryColor || "bronze",
    themeMode: s.themeMode || "light",
    contactFacebook: s.contactFacebook || "",
    contactDiscord: s.contactDiscord || "",
    contactLine: s.contactLine || "",
    truewalletPhone: s.truewalletPhone || "",
    bankAccountNumber: s.bankAccountNumber || "",
    bankAccountName: s.bankAccountName || "",
    bankName: s.bankName || "",
    qrSlipToken: s.qrSlipToken || "",
    botCfTurnstileKey: s.botCfTurnstileKey || "",
    discordClientId: s.discordClientId || "",
    discordClientSecret: s.discordClientSecret || "",
    banners: JSON.stringify(s.banners || []),
    allowAngpao: s.allowAngpao !== undefined ? !!s.allowAngpao : true,
    allowQr: s.allowQr !== undefined ? !!s.allowQr : true,
    siteLogoUrl: s.siteLogoUrl || null,
    siteBackgroundUrl: s.siteBackgroundUrl || null,
    announcementActive: s.announcementActive !== undefined ? !!s.announcementActive : null,
    announcementTitle: s.announcementTitle || null,
    announcementBody: s.announcementBody || null,
    announcementImageUrl: s.announcementImageUrl || null,
    announcementBarActive: s.announcementBarActive !== undefined ? !!s.announcementBarActive : null,
    announcementBarText: s.announcementBarText || null,
    announcementBarBgColor: s.announcementBarBgColor || null,
    announcementBarTextColor: s.announcementBarTextColor || null,
    announcementBarSpeed: s.announcementBarSpeed !== undefined ? Number(s.announcementBarSpeed) : null,
    announcementBarStyle: s.announcementBarStyle || null,
    announcementBarPrefix: s.announcementBarPrefix || null,
    announcementFloatActive: s.announcementFloatActive !== undefined ? !!s.announcementFloatActive : null,
    announcementFloatText: s.announcementFloatText || null,
    announcementFloatStyle: s.announcementFloatStyle || null,
    announcementFloatIcon: s.announcementFloatIcon || null,
    announcementFloatPosition: s.announcementFloatPosition || null,
    maintenanceActive: s.maintenanceActive !== undefined ? !!s.maintenanceActive : null,
    maintenanceTitle: s.maintenanceTitle || null,
    maintenanceMessage: s.maintenanceMessage || null,
    maintenanceEstimatedTime: s.maintenanceEstimatedTime || null,
    maintenanceAutoOpenTime: s.maintenanceAutoOpenTime || null,
    serverTime: s.serverTime !== undefined ? Number(s.serverTime) : null,
    aboutUsTitle: s.aboutUsTitle || null,
    aboutUsBody: s.aboutUsBody || null,
    aboutUsImageUrl: s.aboutUsImageUrl || null,
    portfolios: JSON.stringify(s.portfolios || []),
    artisans: JSON.stringify(s.artisans || []),
    landmarks: JSON.stringify(s.landmarks || []),
    recommendActive: s.recommendActive !== undefined ? !!s.recommendActive : null,
    recommendTitle: s.recommendTitle || null,
    recommendSubtitle: s.recommendSubtitle || null,
    recommendProductIds: JSON.stringify(s.recommendProductIds || []),
    seasonalEffect: s.seasonalEffect || null,
    recentOrdersActive: s.recentOrdersActive !== undefined ? !!s.recentOrdersActive : null,
    recentOrdersStyle: s.recentOrdersStyle || null,
    recentOrdersSpeed: s.recentOrdersSpeed || null,
  };
}

function deserializeSettings(s: any) {
  return {
    siteName: s.siteName,
    siteSubtitle: s.siteSubtitle,
    primaryColor: s.primaryColor,
    themeMode: s.themeMode,
    contactFacebook: s.contactFacebook,
    contactDiscord: s.contactDiscord,
    contactLine: s.contactLine,
    truewalletPhone: s.truewalletPhone,
    bankAccountNumber: s.bankAccountNumber,
    bankAccountName: s.bankAccountName,
    bankName: s.bankName,
    qrSlipToken: s.qrSlipToken,
    botCfTurnstileKey: s.botCfTurnstileKey,
    discordClientId: s.discordClientId,
    discordClientSecret: s.discordClientSecret,
    banners: JSON.parse(s.banners || "[]"),
    allowAngpao: !!s.allowAngpao,
    allowQr: !!s.allowQr,
    siteLogoUrl: s.siteLogoUrl,
    siteBackgroundUrl: s.siteBackgroundUrl,
    announcementActive: s.announcementActive,
    announcementTitle: s.announcementTitle,
    announcementBody: s.announcementBody,
    announcementImageUrl: s.announcementImageUrl,
    announcementBarActive: s.announcementBarActive,
    announcementBarText: s.announcementBarText,
    announcementBarBgColor: s.announcementBarBgColor,
    announcementBarTextColor: s.announcementBarTextColor,
    announcementBarSpeed: s.announcementBarSpeed,
    announcementBarStyle: s.announcementBarStyle,
    announcementBarPrefix: s.announcementBarPrefix,
    announcementFloatActive: s.announcementFloatActive,
    announcementFloatText: s.announcementFloatText,
    announcementFloatStyle: s.announcementFloatStyle,
    announcementFloatIcon: s.announcementFloatIcon,
    announcementFloatPosition: s.announcementFloatPosition,
    maintenanceActive: s.maintenanceActive,
    maintenanceTitle: s.maintenanceTitle,
    maintenanceMessage: s.maintenanceMessage,
    maintenanceEstimatedTime: s.maintenanceEstimatedTime,
    maintenanceAutoOpenTime: s.maintenanceAutoOpenTime,
    serverTime: s.serverTime,
    aboutUsTitle: s.aboutUsTitle,
    aboutUsBody: s.aboutUsBody,
    aboutUsImageUrl: s.aboutUsImageUrl,
    portfolios: JSON.parse(s.portfolios || "[]"),
    artisans: JSON.parse(s.artisans || "[]"),
    landmarks: JSON.parse(s.landmarks || "[]"),
    recommendActive: s.recommendActive,
    recommendTitle: s.recommendTitle,
    recommendSubtitle: s.recommendSubtitle,
    recommendProductIds: JSON.parse(s.recommendProductIds || "[]"),
    seasonalEffect: s.seasonalEffect,
    recentOrdersActive: s.recentOrdersActive,
    recentOrdersStyle: s.recentOrdersStyle,
    recentOrdersSpeed: s.recentOrdersSpeed,
  };
}

// Category Serializers
function serializeCategory(c: any) {
  return {
    id: c.id,
    name: c.name,
    description: c.description || "",
    icon: c.icon || "Palette",
    imageUrl: c.imageUrl || "",
  };
}

function deserializeCategory(c: any) {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    icon: c.icon,
    imageUrl: c.imageUrl,
  };
}

// Product Serializers
function serializeProduct(p: any) {
  return {
    id: p.id,
    categoryId: p.categoryId,
    name: p.name,
    price: Number(p.price || 0),
    description: p.description || "",
    imageUrl: p.imageUrl || "",
    stock: JSON.stringify(p.stock || []),
    timesSold: Number(p.timesSold || 0),
    details: p.details || "",
    type: p.type || "normal",
    videoUrl: p.videoUrl || null,
    boxItems: JSON.stringify(p.boxItems || []),
    sellerId: p.sellerId || null,
    sellerName: p.sellerName || null,
    sellerType: p.sellerType || null,
  };
}

function deserializeProduct(p: any) {
  return {
    id: p.id,
    categoryId: p.categoryId,
    name: p.name,
    price: p.price,
    description: p.description,
    imageUrl: p.imageUrl,
    stock: JSON.parse(p.stock || "[]"),
    timesSold: p.timesSold,
    details: p.details,
    type: p.type,
    videoUrl: p.videoUrl,
    boxItems: JSON.parse(p.boxItems || "[]"),
    sellerId: p.sellerId,
    sellerName: p.sellerName,
    sellerType: p.sellerType,
  };
}

// User Serializers
function serializeUser(u: any) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    balance: Number(u.balance || 0),
    role: u.role,
    discordId: u.discordId || null,
    avatarUrl: u.avatarUrl || null,
    password: u.password || null,
    pendingBalance: u.pendingBalance !== undefined ? Number(u.pendingBalance) : null,
    withdrawableBalance: u.withdrawableBalance !== undefined ? Number(u.withdrawableBalance) : null,
  };
}

function deserializeUser(u: any) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    balance: u.balance,
    role: u.role,
    discordId: u.discordId,
    avatarUrl: u.avatarUrl,
    password: u.password,
    pendingBalance: u.pendingBalance,
    withdrawableBalance: u.withdrawableBalance,
  };
}

// Coupon Serializers
function serializeCoupon(c: any) {
  return {
    code: c.code,
    discountPercent: Number(c.discountPercent || 0),
    discountBaht: Number(c.discountBaht || 0),
    usesLeft: Number(c.usesLeft || 0),
  };
}

function deserializeCoupon(c: any) {
  return {
    code: c.code,
    discountPercent: c.discountPercent,
    discountBaht: c.discountBaht,
    usesLeft: c.usesLeft,
  };
}

// Transaction Serializers
function serializeTransaction(t: any) {
  return {
    id: t.id,
    userId: t.userId,
    username: t.username,
    type: t.type,
    amount: Number(t.amount || 0),
    details: t.details || "",
    status: t.status,
    date: t.date,
    shippingDetails: t.shippingDetails ? JSON.stringify(t.shippingDetails) : null,
    orderStatus: t.orderStatus || null,
    trackingNumber: t.trackingNumber || null,
    trackingCarrier: t.trackingCarrier || null,
    statusUpdates: t.statusUpdates ? JSON.stringify(t.statusUpdates) : null,
  };
}

function deserializeTransaction(t: any) {
  return {
    id: t.id,
    userId: t.userId,
    username: t.username,
    type: t.type,
    amount: t.amount,
    details: t.details,
    status: t.status,
    date: t.date,
    shippingDetails: t.shippingDetails ? JSON.parse(t.shippingDetails) : undefined,
    orderStatus: t.orderStatus,
    trackingNumber: t.trackingNumber,
    trackingCarrier: t.trackingCarrier,
    statusUpdates: t.statusUpdates ? JSON.parse(t.statusUpdates) : undefined,
  };
}

// Review Serializers
function serializeReview(r: any) {
  return {
    id: r.id,
    userId: r.userId,
    username: r.username,
    rating: Number(r.rating || 5),
    productId: r.productId,
    productName: r.productName,
    comment: r.comment || "",
    date: r.date,
  };
}

function deserializeReview(r: any) {
  return {
    id: r.id,
    userId: r.userId,
    username: r.username,
    rating: r.rating,
    productId: r.productId,
    productName: r.productName,
    comment: r.comment,
    date: r.date,
  };
}

// SellerVerification Serializers
function serializeSellerVerification(s: any) {
  return {
    id: s.id,
    userId: s.userId,
    username: s.username,
    shopName: s.shopName,
    contactDetails: s.contactDetails,
    status: s.status,
    createdAt: s.createdAt,
    reviewedAt: s.reviewedAt || null,
    reviewerNotes: s.reviewerNotes || null,
  };
}

function deserializeSellerVerification(s: any) {
  return {
    id: s.id,
    userId: s.userId,
    username: s.username,
    shopName: s.shopName,
    contactDetails: s.contactDetails,
    status: s.status,
    createdAt: s.createdAt,
    reviewedAt: s.reviewedAt,
    reviewerNotes: s.reviewerNotes,
  };
}

// Withdrawal Serializers
function serializeWithdrawal(w: any) {
  return {
    id: w.id,
    userId: w.userId,
    username: w.username,
    amount: Number(w.amount || 0),
    bankName: w.bankName,
    bankAccount: w.bankAccount,
    bankAccountName: w.bankAccountName,
    status: w.status,
    createdAt: w.createdAt,
    reviewedAt: w.reviewedAt || null,
    reviewerNotes: w.reviewerNotes || null,
  };
}

function deserializeWithdrawal(w: any) {
  return {
    id: w.id,
    userId: w.userId,
    username: w.username,
    amount: w.amount,
    bankName: w.bankName,
    bankAccount: w.bankAccount,
    bankAccountName: w.bankAccountName,
    status: w.status,
    createdAt: w.createdAt,
    reviewedAt: w.reviewedAt,
    reviewerNotes: w.reviewerNotes,
  };
}

// Conversation Serializers
function serializeConversation(c: any) {
  return {
    id: c.id,
    customerId: c.customerId,
    sellerId: c.sellerId,
    shopId: c.shopId,
    lastMessage: c.lastMessage || "",
    lastMessageAt: c.lastMessageAt,
    status: c.status,
    createdAt: c.createdAt,
  };
}

function deserializeConversation(c: any) {
  return {
    id: c.id,
    customerId: c.customerId,
    sellerId: c.sellerId,
    shopId: c.shopId,
    lastMessage: c.lastMessage,
    lastMessageAt: c.lastMessageAt,
    status: c.status,
    createdAt: c.createdAt,
  };
}

// Message Serializers
function serializeMessage(m: any) {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    message: m.message || "",
    messageType: m.messageType,
    image: m.image || null,
    isRead: !!m.isRead,
    createdAt: m.createdAt,
    replyToId: m.replyToId || null,
    replyToMessage: m.replyToMessage || null,
    productInfo: m.productInfo ? JSON.stringify(m.productInfo) : null,
    orderInfo: m.orderInfo ? JSON.stringify(m.orderInfo) : null,
    locationInfo: m.locationInfo ? JSON.stringify(m.locationInfo) : null,
  };
}

function deserializeMessage(m: any) {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    message: m.message,
    messageType: m.messageType,
    image: m.image,
    isRead: m.isRead,
    createdAt: m.createdAt,
    replyToId: m.replyToId,
    replyToMessage: m.replyToMessage,
    productInfo: m.productInfo ? JSON.parse(m.productInfo) : undefined,
    orderInfo: m.orderInfo ? JSON.parse(m.orderInfo) : undefined,
    locationInfo: m.locationInfo ? JSON.parse(m.locationInfo) : undefined,
  };
}

// Notification Serializers
function serializeNotification(n: any) {
  return {
    id: n.id,
    userId: n.userId,
    title: n.title,
    body: n.body || "",
    isRead: !!n.isRead,
    createdAt: n.createdAt,
  };
}

function deserializeNotification(n: any) {
  return {
    id: n.id,
    userId: n.userId,
    title: n.title,
    body: n.body,
    isRead: n.isRead,
    createdAt: n.createdAt,
  };
}

// General collection synchronization helper
async function syncCollectionGeneric<T>(
  currentItems: T[],
  keyName: keyof T,
  prismaModel: any,
  serialize: (item: T) => any,
  lastSavedMap: Map<string, string>
) {
  const currentMap = new Map(currentItems.map((item) => [String(item[keyName]), item]));

  // Create or Update
  for (const item of currentItems) {
    const idValue = item[keyName];
    const idStr = String(idValue);
    const serialized = serialize(item);
    const serializedStr = JSON.stringify(serialized);

    if (!lastSavedMap.has(idStr) || lastSavedMap.get(idStr) !== serializedStr) {
      await prismaModel.upsert({
        where: { [keyName]: idValue },
        update: serialized,
        create: serialized,
      });
      lastSavedMap.set(idStr, serializedStr);
    }
  }

  // Delete missing
  for (const idStr of lastSavedMap.keys()) {
    if (!currentMap.has(idStr)) {
      await prismaModel.delete({
        where: { [keyName]: idStr },
      }).catch((e: any) => console.error(`Error deleting from ${prismaModel.name}:`, e));
      lastSavedMap.delete(idStr);
    }
  }
}

// MAIN DATABASE LOAD FUNCTION
export async function loadFromPrisma(defaultDB: any): Promise<any> {
  try {
    console.log("Loading data from MySQL via Prisma...");

    // Check if Setting exists, if not, write defaults
    let dbSettings = await prisma.setting.findFirst();
    if (!dbSettings) {
      console.log("No settings found in MySQL. Seeding default database...");
      await prisma.setting.create({
        data: serializeSettings(defaultDB.settings),
      });
      dbSettings = await prisma.setting.findFirst();

      // Seed other collections if empty
      for (const cat of defaultDB.categories) {
        await prisma.category.create({ data: serializeCategory(cat) });
      }
      for (const prod of defaultDB.products) {
        await prisma.product.create({ data: serializeProduct(prod) });
      }
      for (const user of defaultDB.users) {
        await prisma.user.create({ data: serializeUser(user) });
      }
      for (const coupon of defaultDB.coupons) {
        await prisma.coupon.create({ data: serializeCoupon(coupon) });
      }
      for (const tx of defaultDB.transactions) {
        await prisma.transaction.create({ data: serializeTransaction(tx) });
      }
      for (const rev of defaultDB.reviews) {
        await prisma.review.create({ data: serializeReview(rev) });
      }
    }

    // Load from Prisma tables
    const settingsRaw = await prisma.setting.findFirst();
    const categoriesRaw = await prisma.category.findMany();
    const productsRaw = await prisma.product.findMany();
    const usersRaw = await prisma.user.findMany();
    const couponsRaw = await prisma.coupon.findMany();
    const transactionsRaw = await prisma.transaction.findMany();
    const reviewsRaw = await prisma.review.findMany();
    const sellerVerificationsRaw = await prisma.sellerVerification.findMany();
    const withdrawalsRaw = await prisma.withdrawal.findMany();
    const conversationsRaw = await prisma.conversation.findMany();
    const messagesRaw = await prisma.message.findMany();
    const notificationsRaw = await prisma.notification.findMany();

    // Deserialize database state
    const settings = deserializeSettings(settingsRaw);
    const categories = categoriesRaw.map(deserializeCategory);
    const products = productsRaw.map(deserializeProduct);
    const users = usersRaw.map(deserializeUser);
    const coupons = couponsRaw.map(deserializeCoupon);
    const transactions = transactionsRaw.map(deserializeTransaction);
    const reviews = reviewsRaw.map(deserializeReview);
    const sellerVerifications = sellerVerificationsRaw.map(deserializeSellerVerification);
    const withdrawals = withdrawalsRaw.map(deserializeWithdrawal);
    const conversations = conversationsRaw.map(deserializeConversation);
    const messages = messagesRaw.map(deserializeMessage);
    const notifications = notificationsRaw.map(deserializeNotification);

    // Warm up the memory cache of last saved strings
    categories.forEach((c) => lastSavedCategories.set(c.id, JSON.stringify(serializeCategory(c))));
    products.forEach((p) => lastSavedProducts.set(p.id, JSON.stringify(serializeProduct(p))));
    users.forEach((u) => lastSavedUsers.set(u.id, JSON.stringify(serializeUser(u))));
    coupons.forEach((c) => lastSavedCoupons.set(c.code, JSON.stringify(serializeCoupon(c))));
    transactions.forEach((t) => lastSavedTransactions.set(t.id, JSON.stringify(serializeTransaction(t))));
    reviews.forEach((r) => lastSavedReviews.set(r.id, JSON.stringify(serializeReview(r))));
    sellerVerifications.forEach((s) => lastSavedSellerVerifications.set(s.id, JSON.stringify(serializeSellerVerification(s))));
    withdrawals.forEach((w) => lastSavedWithdrawals.set(w.id, JSON.stringify(serializeWithdrawal(w))));
    conversations.forEach((c) => lastSavedConversations.set(c.id, JSON.stringify(serializeConversation(c))));
    messages.forEach((m) => lastSavedMessages.set(m.id, JSON.stringify(serializeMessage(m))));
    notifications.forEach((n) => lastSavedNotifications.set(n.id, JSON.stringify(serializeNotification(n))));
    lastSavedSettingsStr.val = JSON.stringify(serializeSettings(settings));

    console.log("Database successfully loaded from MySQL!");

    return {
      settings,
      categories,
      products,
      users,
      coupons,
      transactions,
      reviews,
      sellerVerifications,
      withdrawals,
      conversations,
      messages,
      notifications,
    };
  } catch (err) {
    console.error("Failed to load from MySQL, falling back to JSON schema defaults:", err);
    return defaultDB;
  }
}

// MAIN DATABASE SAVE/SYNC FUNCTION
export async function saveToPrisma(data: any): Promise<void> {
  try {
    // 1. Sync Settings (singleton, ID = 1)
    if (data.settings) {
      const serialized = serializeSettings(data.settings);
      const serializedStr = JSON.stringify(serialized);
      if (lastSavedSettingsStr.val !== serializedStr) {
        await prisma.setting.upsert({
          where: { id: 1 },
          update: serialized,
          create: { id: 1, ...serialized },
        });
        lastSavedSettingsStr.val = serializedStr;
      }
    }

    // 2. Sync all other tables generic collections
    if (data.categories) {
      await syncCollectionGeneric(data.categories, "id", prisma.category, serializeCategory, lastSavedCategories);
    }
    if (data.products) {
      await syncCollectionGeneric(data.products, "id", prisma.product, serializeProduct, lastSavedProducts);
    }
    if (data.users) {
      await syncCollectionGeneric(data.users, "id", prisma.user, serializeUser, lastSavedUsers);
    }
    if (data.coupons) {
      await syncCollectionGeneric(data.coupons, "code", prisma.coupon, serializeCoupon, lastSavedCoupons);
    }
    if (data.transactions) {
      await syncCollectionGeneric(data.transactions, "id", prisma.transaction, serializeTransaction, lastSavedTransactions);
    }
    if (data.reviews) {
      await syncCollectionGeneric(data.reviews, "id", prisma.review, serializeReview, lastSavedReviews);
    }
    if (data.sellerVerifications) {
      await syncCollectionGeneric(data.sellerVerifications, "id", prisma.sellerVerification, serializeSellerVerification, lastSavedSellerVerifications);
    }
    if (data.withdrawals) {
      await syncCollectionGeneric(data.withdrawals, "id", prisma.withdrawal, serializeWithdrawal, lastSavedWithdrawals);
    }
    if (data.conversations) {
      await syncCollectionGeneric(data.conversations, "id", prisma.conversation, serializeConversation, lastSavedConversations);
    }
    if (data.messages) {
      await syncCollectionGeneric(data.messages, "id", prisma.message, serializeMessage, lastSavedMessages);
    }
    if (data.notifications) {
      await syncCollectionGeneric(data.notifications, "id", prisma.notification, serializeNotification, lastSavedNotifications);
    }
  } catch (err) {
    console.error("Failed to sync state changes to MySQL:", err);
  }
}
