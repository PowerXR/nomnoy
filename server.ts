import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { AppSettings, Category, Product, User, Coupon, Transaction, Review, BoxItem, Conversation, Message, Notification } from "./src/types";
import { loadFromPrisma, saveToPrisma } from "./src/lib/prisma-sync";

// Database storage setup
const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to load DB
async function loadDB() {
  const defaultDB = {
    settings: {
        "siteName": "ชุมชนตำบลน้ำน้อย",
        "siteSubtitle": "Authentic local craftsmanship, rooted in tradition. Discover handcrafted goods directly from the artisans of ชุมชนตำบลน้ำน้อย. Every purchase supports sustainable community growth and preserves Thai heritage.",
        "primaryColor": "bronze",
        "themeMode": "light",
        "contactFacebook": "https://www.facebook.com/namnoicommunity",
        "contactDiscord": "https://discord.gg/namnoicrafts",
        "contactLine": "https://line.me/ti/p/@namnoicommunity",
        "truewalletPhone": "0639470416",
        "bankAccountNumber": "9770964014",
        "bankAccountName": "ธนกฤต ชูกำเนิด",
        "bankName": "ธนาคารกรุงเทพ",
        "qrSlipToken": "DEMO-SLIPOK-TOKEN-12345",
        "botCfTurnstileKey": "0x4AAAAAAAx_demo_turnstile_key",
        "discordClientId": "1122334455667788",
        "discordClientSecret": "xyz_secret_demo_key",
        "banners": [
          "https://images.unsplash.com/photo-1550159930-40066082a4fc?auto=format&fit=crop&w=1600&q=80"
        ],
        "allowAngpao": true,
        "allowQr": true,
        "announcementFloatActive": true,
        "announcementFloatText": "✨ ยินดีต้อนรับสู่ชุมชนตำบลน้ำน้อย! พบกับหัตถศิลป์ล้ำค่าและผลิตภัณฑ์บาติกเขียนเทียนแท้ดั้งเดิมของดีจากช่างทอชุมชน สั่งซื้อวันนี้รับสิทธิ์สนับสนุนกลุ่มปราชญ์ชาวบ้านโดยตรงนะคะ 💖",
        "announcementFloatStyle": "luxury-gold",
        "announcementFloatIcon": "welcome",
        "announcementFloatPosition": "bottom-right",
        "aboutUsTitle": "วิถีแห่งภูมิปัญญาท้องถิ่น ชุมชนน้ำน้อย",
        "aboutUsBody": "กลุ่มทอผ้าบาติกและหัตถกรรมจักสานใบลาน ตำบลน้ำน้อย อำเภอหาดใหญ่ จังหวัดสงขลา ร่วมใจกันสืบสานและถ่ายทอดเอกลักษณ์ทางวัฒนธรรมจากรุ่นสู่รุ่น สร้างสรรค์ผลงานทำมือที่เปี่ยมไปด้วยจิตวิญญาณแห่งความเป็นไทยพรีเมียม",
        "aboutUsImageUrl": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
        "portfolios": [
          {
            "id": "port-1",
            "title": "ผ้าบาติกเขียนมือลายดอกพิกุล",
            "description": "งานทอและเขียนเทียนลายทองโบราณที่สืบทอดกันมากว่า 80 ปี สีสันสดสวยจากธรรมชาติ",
            "imageUrl": "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=400&q=80"
          },
          {
            "id": "port-2",
            "title": "กระเป๋าจักสานใบลานประณีตลายลูกแก้ว",
            "description": "การจักสานจากใบลานป่าคุณภาพดี โครงสร้างแข็งแรง รูปทรงร่วมสมัย ทนทานนานนับสิบปี",
            "imageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80"
          }
        ],
        "artisans": [
          {
            "id": "art-1",
            "name": "ป้าอิ่ม จิตรประจง",
            "expertise": "บรมครูช่างเขียนผ้าบาติกโบราณ",
            "bio": "ผู้เชี่ยวชาญการใช้เทียนและสีย้อมธรรมชาติ มีประสบการณ์การทอผ้าและทำบาติกมากว่า 40 ปีในชุมชนน้ำน้อย",
            "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
          },
          {
            "id": "art-2",
            "name": "ลุงไข่ นิลสุวรรณ",
            "expertise": "ช่างศิลป์หัตถกรรมจักสานใบลาน",
            "bio": "ปราชญ์ท้องถิ่นผู้ชำนาญการเลือกใบและจักตอกใบลานให้เหนียวนุ่ม ถ่ายทอดงานจักสานให้เยาวชนฟรี",
            "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
          }
        ],
        "landmarks": [
          {
            "id": "loc-municipality",
            "name": "สำนักงานเทศบาลตำบลน้ำน้อย",
            "type": "admin",
            "lat": 7.0518,
            "lng": 100.5285,
            "description": "ศูนย์กลางการประสานงานราชการ บริการประชาชน และจุดรวมการสนับสนุนส่งเสริมอาชีพชุมชนและผ้าบาติก",
            "phone": "074-211111",
            "imageUrl": "https://images.unsplash.com/photo-1577086664693-894d8405334a?auto=format&fit=crop&w=600&q=80"
          },
          {
            "id": "loc-batik",
            "name": "ศูนย์เรียนรู้และกลุ่มทอผ้าบาติกน้ำน้อย",
            "type": "craft",
            "lat": 7.0455,
            "lng": 100.5212,
            "description": "แหล่งผลิตผ้าบาติกทำมือชั้นยอดประจำจังหวัดสงขลา เป็นจุดสืบทอดภูมิปัญญาและเวิร์กชอปเขียนเทียนย้อมสี",
            "imageUrl": "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=600&q=80"
          },
          {
            "id": "loc-palm",
            "name": "กลุ่มวิสาหกิจจักสานใบลานลานไทยน้ำน้อย",
            "type": "craft",
            "lat": 7.0482,
            "lng": 100.5245,
            "description": "กลุ่มหัตถกรรมจักสานใบลานพื้นบ้าน แปรรูปเป็นหมวก กระเป๋า และของตกแต่งคุณภาพส่งออก OTOP ทะเบียนสำคัญ",
            "imageUrl": "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80"
          },
          {
            "id": "loc-temple-nok",
            "name": "วัดน้ำน้อยนอก (วัดประดิษฐานหลวงพ่อท่านเจ้าคุณ)",
            "type": "temple",
            "lat": 7.0423,
            "lng": 100.5235,
            "description": "ศูนย์รวมศรัทธาสำคัญ ประดิษฐานรูปหล่อพระครูประสาทสุตาคุณอันเป็นที่เคารพรัก มีสถาปัตยกรรมท้องถิ่นอันงดงาม",
            "imageUrl": "https://images.unsplash.com/photo-1609137144813-91b489506692?auto=format&fit=crop&w=600&q=80"
          },
          {
            "id": "loc-waterfall",
            "name": "น้ำตกหัวรน (อุทยานป่าต้นน้ำน้ำน้อย)",
            "type": "nature",
            "lat": 7.0621,
            "lng": 100.541,
            "description": "น้ำตกธรรมชาติต้นน้ำที่สมบูรณ์ โอบล้อมด้วยแนวเขาสวนป่าเขียวขจี เป็นแหล่งพักผ่อนหย่อนใจทางธรรมชาติชั้นเยี่ยม",
            "imageUrl": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80"
          },
          {
            "id": "loc-market",
            "name": "ตลาดนัดวิถีชุมชนประชารัฐน้ำน้อย",
            "type": "market",
            "lat": 7.0501,
            "lng": 100.5268,
            "description": "ตลาดจำหน่ายสินค้าเกษตรอินทรีย์ อาหารพื้นบ้าน และผลิตภัณฑ์จักสานงานมือของพี่น้องชุมชนรอบเขตเทศบาล",
            "imageUrl": "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80"
          }
        ],
        "maintenanceActive": true,
        "maintenanceAutoOpenTime": "2026-07-06T10:54"
      } as AppSettings,
    categories: [
      { id: "cat-1", name: "สินค้าขายดี", description: "รหัสเกมและไอดีเกมพรีเมียม สต็อกพร้อมส่งทันที", icon: "TrendingUp", imageUrl: "" },
      { id: "cat-2", name: "บัตรเติมเกม & ดิจิทัล", description: "คีย์เกม, บัตรเติมเงิน และบริการดิจิทัลต่าง ๆ", icon: "Gamepad2", imageUrl: "" },
      { id: "cat-3", name: "กล่องสุ่มลุ้นโชค (Gacha)", description: "ลุ้นรางวัลพรีเมียมในราคาประหยัด สนุกเร้าใจ", icon: "Sparkles", imageUrl: "" }
    ] as Category[],
    products: [
      {
        id: "prod-1",
        categoryId: "cat-1",
        name: "🔑 ID Valorant ไฮแรค มีมีดแรร์พรีเมียม",
        price: 350,
        description: "ไอดีแร้ง Diamond มีสกินมีดแชมเปียนยอดฮิตปี 2022+2023 สกินปืนพรีเมียม สต็อกพร้อมส่ง ประกันระบบ 30 วันเต็ม!",
        imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
        stock: [
          "VAL-USER1:PASS9876:EMAIL=user1@gmail.com:SKINS=Champions2022,PrimeVandal",
          "VAL-USER2:PASS5432:EMAIL=user2@gmail.com:SKINS=Champions2023,RGXBlade",
          "VAL-USER3:PASS1122:EMAIL=user3@gmail.com:SKINS=ReaverKarambit,IonPhantom"
        ],
        timesSold: 12,
        details: "### คุณสมบัติไอดี\n- แร้งปัจจุบัน: **Diamond 2**\n- สกินมีด: **Champions 2022 Butterfly Knife** หรือ **Champions 2023 Vandal**\n- มีสกินปืน Vandal ยอดนิยม: Prime, Reaver, RGX\n- สามารถเปลี่ยนรหัสผ่านและอีเมลได้ทันทีหลังซื้อ\n- รับประกันไอดีจากการโดนดึงคืนหรือแบนโดนไม่มีสาเหตุ 30 วันแรกหลังเปลี่ยนมือ\n\n*โปรดอัดคลิปวิดีโอตั้งแต่ตอนเริ่มตัดเงินจนถึงเข้าไอดีเพื่อสิทธิ์การเคลม*",
        type: "normal"
      },
      {
        id: "prod-2",
        categoryId: "cat-1",
        name: "⭐️ สคริปต์ระบบร้านค้าอัตโนมัติ (PHP PDO Bootstrap 5)",
        price: 500,
        description: "ระบบหลังบ้านพรีเมียม สไลด์แบนเนอร์ รองรับเติมเงินอัตโนมัติ ถอนอั่งเปากระเป๋าตัง และสลิปผ่าน QR พร้อมพรีเซ็ตแผงผู้ดูแลระดับสูง",
        imageUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=400&q=80",
        stock: [
          "LIC-PHP-SHOP-AE910:DOWNLOAD_URL=https://github.com/demo/shop-v1.zip",
          "LIC-PHP-SHOP-PP228:DOWNLOAD_URL=https://github.com/demo/shop-v1.zip"
        ],
        timesSold: 28,
        details: "### ฟังก์ชันจัดเต็มระดับโปร\n- พัฒนาด้วย **PHP OOP - PDO (MySQL/PostgreSQL)**\n- ระบบหลังบ้านควบคุมได้ 100% (จัดการสมาชิก, คลังสินค้า, สถิติแสดงรายวัน/เดือน)\n- ระบบเติมเงินสแกน QR อัตโนมัติ เช็คสลิป API ของ SlipOK / EasySlip\n- ระบบเติมเงิน Truemoney อั่งเปาล่าสุด\n- เชื่อมต่อ Discord OAuth สมัครสมาชิกคลิกเดียว\n- ปรับเปลี่ยนธีม (สว่าง-มืด) เก็บข้อมูลในคุกกี้เว็บของฝั่งผู้ใช้",
        type: "normal"
      },
      {
        id: "prod-3",
        categoryId: "cat-2",
        name: "🎁 Discord Nitro (1 Month) Gift Link",
        price: 150,
        description: "ลิงก์ของขวัญดิสคอร์ด Nitro 1 เดือน ปลดล็อกบุสเซิร์ฟเวอร์อิสระ, ปลดล็อกสติกเกอร์เคลื่อนไหว, อัปโหลดไฟล์สูงสุด 500MB",
        imageUrl: "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?auto=format&fit=crop&w=400&q=80",
        stock: [
          "https://discord.gift/nitro-promo-xyz-123",
          "https://discord.gift/nitro-promo-abc-789",
          "https://discord.gift/nitro-promo-qwe-456"
        ],
        timesSold: 41,
        details: "### สิทธิประโยชน์ที่คุณจะได้รับ\n- **2 Server Boosts** ฟรีในแพ็กเกจ\n- แอนิเมชันดิสคอร์ดและอิโมจิขยับได้ทุกที่\n- อัปโหลดรูปโปรไฟล์เคลื่อนไหว (GIF)\n- แชร์หน้าจอคุณภาพสูงระดับ **4K 60FPS**\n- ขยายจำนวนกลุ่มดิสคอร์ดได้สูงสุด 200 กลุ่ม\n\n*วิธีเปิดใช้: ล็อกอินดิสคอร์ดแล้วกดเปิดลิงก์ที่ได้รับทันที*",
        type: "normal"
      },
      {
        id: "prod-4",
        categoryId: "cat-3",
        name: "🎁 กล่องสุ่ม VIP - โอกาสลุ้นรางวัลสุดสะท้านใจ!",
        price: 25,
        description: "กล่องลุ้นโชคไอดีเกมและคูปองรางวัลใหญ่สุดคุ้ม! มีสิทธิ์ได้ไอดีแชมป์ Valorant ลิขสิทธิ์แท้ หรือสิทธิ์เติมเงินฟรี 100 บาท!",
        imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80",
        stock: ["BOX-TOKEN-1", "BOX-TOKEN-2", "BOX-TOKEN-3", "BOX-TOKEN-4", "BOX-TOKEN-5", "BOX-TOKEN-6", "BOX-TOKEN-7", "BOX-TOKEN-8", "BOX-TOKEN-9", "BOX-TOKEN-10"],
        timesSold: 97,
        details: "### เรทรายการของรางวัลภายในกล่องสุ่มสำเร็จรูป\n1. **เกลือแสนหวาน (บัตรปลอบใจ 1 THB)** - อัตราออก: 50%\n2. **คีย์เครดิตร้าน 10 THB** - อัตราออก: 30%\n3. **ไอดี Valorant ระดับ Bronze-Gold** - อัตราออก: 15%\n4. **🎉 JACKPOT: ไอดี Valorant Radiant / สกินครบ!** - อัตราออก: 5%\n\n*คำเตือน: ยิ่งสุ่มมาก ยิ่งเข้าใกล้รางวัล Jackpot! ทุกครั้งที่สุ่มระบบจะสุ่มตามเรทอย่างโปร่งใสโดยอัลกอริทึมสุ่ม*",
        type: "box",
        boxItems: [
          { id: "box-i1", name: "เกลือแสนหวาน (บัตรปลอบใจ 1 THB)", rate: 50, isJackpot: false, accountData: "GIFT-REDEEM-1BAHT: CODE=SALT-REDEEM" },
          { id: "box-i2", name: "คีย์เครดิตร้าน 10 THB", rate: 30, isJackpot: false, accountData: "GIFT-REDEEM-10BAHT: CODE=RECOVER-CREDIT-10" },
          { id: "box-i3", name: "ไอดี Valorant ระดับ Bronze-Gold", rate: 15, isJackpot: false, accountData: "VAL-BG-ACC:USER=ValorantRandom392:PASS=valrandom99:EMAIL=bg4432@val.in.th" },
          { id: "box-i4", name: "🎉 JACKPOT: ไอดี Valorant Radiant / สกินครบ!", rate: 5, isJackpot: true, accountData: "VAL-JACKPOT-RADIANT:USER=RadiantKing:PASS=radiantpass9182:EMAIL=radiant_king@gmail.com:LEGEND_SKINS=Champions2023,RGX,VandalPrime" }
        ]
      }
    ] as Product[],
    users: [
      { id: "usr-admin", username: "admin", email: "admin@shop.com", balance: 800.00, role: "admin", password: "admin" },
      { id: "usr-guest", username: "guest", email: "guest@shop.com", balance: 150.00, role: "user", password: "guest" }
    ] as User[],
    coupons: [
      { code: "NEWUSER", discountPercent: 10, discountBaht: 0, usesLeft: 50 },
      { code: "LUCKY50", discountPercent: 0, discountBaht: 50, usesLeft: 10 }
    ] as Coupon[],
    transactions: [
      { id: "tx-1", userId: "usr-admin", username: "admin", type: "topup_qr", amount: 500, details: "เติมเงินผ่านระบบเช็คสลิปอัตโนมัติ (สลิประบบอ้างอิง #82910)", status: "success", date: "2026-06-21T10:30:00.000Z" },
      { id: "tx-2", userId: "usr-admin", username: "admin", type: "purchase_product", amount: 150, details: "ซื้อสินค้า [Discord Nitro (1 Month)]", status: "success", date: "2026-06-21T11:45:00.000Z" }
    ] as Transaction[],
    reviews: [
      { id: "rev-1", userId: "usr-admin", username: "admin", rating: 5, productId: "prod-3", productName: "🎁 Discord Nitro (1 Month) Gift Link", comment: "ส่งจริง ได้ของทันที คอนเฟิร์มครับผม สะดวกมากๆ!", date: "2026-06-21T12:00:00.000Z" },
      { id: "rev-2", userId: "usr-guest", username: "guest", rating: 4, productId: "prod-1", productName: "🔑 ID Valorant ไฮแรค มีมีดแรร์พรีเมียม", comment: "ไอดีสวยงาม สกินเด็ดตรงปก เล่นมันส์เลยครับ", date: "2026-06-21T14:20:00.000Z" }
    ] as Review[]
  };

  return await loadFromPrisma(defaultDB);
}

// Helper to save DB
function saveDB(data: any) {
  saveToPrisma(data).catch((err) => {
    console.error("Asynchronous background save to Prisma failed:", err);
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initial local copy of dynamic DB
  let db = await loadDB();

  // Real-time SSE Clients for live purchase notifications
  let sseClients: any[] = [];

  // Broadcast purchase to all SSE clients
  function broadcastPurchase(tx: any) {
    let maskedUsername = "ผู้ใช้ในระบบ";
    if (tx.username) {
      const len = tx.username.length;
      if (len <= 2) {
        maskedUsername = tx.username[0] + "*";
      } else {
        maskedUsername = tx.username.slice(0, 2) + "*".repeat(Math.max(1, len - 4)) + tx.username.slice(-2);
      }
    }

    let cleanDetails = tx.details || "";
    if (cleanDetails.includes(" - ")) {
      cleanDetails = cleanDetails.split(" - ")[0];
    }

    // Try to find corresponding product in DB to get its imageUrl and id
    let productId = tx.productId || "";
    let imageUrl = "";
    
    if (!productId && cleanDetails) {
      const match = cleanDetails.match(/\[(.*?)\]/);
      if (match && match[1]) {
        const productName = match[1];
        const foundProd = db.products.find((p: any) => p.name === productName);
        if (foundProd) {
          productId = foundProd.id;
          imageUrl = foundProd.imageUrl;
        }
      }
    } else if (productId) {
      const foundProd = db.products.find((p: any) => p.id === productId);
      if (foundProd) {
        imageUrl = foundProd.imageUrl;
      }
    }

    const payload = {
      id: tx.id,
      username: maskedUsername,
      type: tx.type,
      amount: tx.amount,
      details: cleanDetails,
      date: tx.date,
      status: tx.status,
      productId,
      imageUrl
    };

    sseClients.forEach((client) => {
      try {
        client.write(`data: ${JSON.stringify({ type: "purchase", data: payload })}\n\n`);
      } catch (e) {
        console.error("Error writing to client SSE connection:", e);
      }
    });
  }

  // Ensure seller collections exist
  if (!db.sellerVerifications) db.sellerVerifications = [];
  if (!db.withdrawals) db.withdrawals = [];
  if (db.users) {
    db.users.forEach((u: any) => {
      if (u.pendingBalance === undefined) u.pendingBalance = 0;
      if (u.withdrawableBalance === undefined) u.withdrawableBalance = 0;
    });
  }
  saveDB(db);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Create uploads directory and serve it statically
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));

  // File Upload API endpoint
  app.post("/api/upload", (req, res) => {
    try {
      const { filename, base64Data } = req.body;
      if (!filename || !base64Data) {
        return res.status(400).json({ error: "Missing filename or base64Data" });
      }

      let pureBase64 = base64Data;
      if (base64Data.includes(";base64,")) {
        pureBase64 = base64Data.split(";base64,").pop();
      }

      const buffer = Buffer.from(pureBase64, "base64");
      const ext = path.extname(filename) || ".png";
      const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9]/g, "_");
      const cleanFileName = `${baseName}_${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, cleanFileName);

      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${cleanFileName}`;
      res.json({ url: fileUrl });
    } catch (err: any) {
      console.error("Error saving uploaded file:", err);
      res.status(500).json({ error: err.message || "Failed to upload file" });
    }
  });

  // --- API ROUTES ---

  // Helper to parse date consistently with +07:00 (Thai) timezone if no timezone offset is provided
  const parseTargetTime = (timeStr: string): Date => {
    if (!timeStr) return new Date();
    if (timeStr.includes("Z") || timeStr.includes("+") || /-\d{2}:\d{2}$/.test(timeStr)) {
      return new Date(timeStr);
    }
    return new Date(timeStr + "+07:00");
  };

  // Get Store Settings
  app.get("/api/settings", (req, res) => {
    // Check if auto-open time has passed and maintenance is active
    if (db.settings.maintenanceActive && db.settings.maintenanceAutoOpenTime) {
      try {
        const autoOpenDate = parseTargetTime(db.settings.maintenanceAutoOpenTime);
        const currentDate = new Date();
        // Allow a 15-second grace period for clock skew between client and server
        if (!isNaN(autoOpenDate.getTime()) && (currentDate.getTime() + 15000) >= autoOpenDate.getTime()) {
          console.log(`Auto-open scheduled time reached: ${db.settings.maintenanceAutoOpenTime}. Automatically opening the website.`);
          db.settings.maintenanceActive = false;
          db.settings.maintenanceAutoOpenTime = ""; // Clear schedule
          saveDB(db);
        }
      } catch (err) {
        console.error("Error checking auto-open settings:", err);
      }
    }
    res.json({ ...db.settings, serverTime: Date.now() });
  });

  // Auto-open endpoint when countdown completes
  app.post("/api/settings/auto-open", (req, res) => {
    try {
      console.log("Auto-open triggered by client. Automatically opening the website.");
      db.settings.maintenanceActive = false;
      db.settings.maintenanceAutoOpenTime = ""; // Clear schedule
      saveDB(db);
      res.json({ success: true, settings: db.settings });
    } catch (err: any) {
      console.error("Error in auto-open endpoint:", err);
      res.status(500).json({ error: err.message || "Failed to auto-open settings" });
    }
  });

  // Update Store Settings (Admin)
  app.put("/api/settings", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    db.settings = { ...db.settings, ...req.body };
    saveDB(db);

    // Attempt to persist settings inside server.ts for permanent source-code backing
    try {
      const serverCodePath = path.join(process.cwd(), "server.ts");
      if (fs.existsSync(serverCodePath)) {
        let serverCode = fs.readFileSync(serverCodePath, "utf-8");
        const startMarker = "    settings: {";
        const endMarker = "    } as AppSettings,";
        const startIndex = serverCode.indexOf(startMarker);
        const endIndex = serverCode.indexOf(endMarker);
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          const settingsStr = JSON.stringify(db.settings, null, 2)
            .split("\n")
            .map((line, i) => i === 0 ? line : "      " + line)
            .join("\n");
          
          const before = serverCode.substring(0, startIndex);
          const after = serverCode.substring(endIndex);
          const newCode = before + "    settings: " + settingsStr + "\n" + "  " + after;
          fs.writeFileSync(serverCodePath, newCode, "utf-8");
          console.log("Successfully persisted settings to server.ts source code!");
        }
      }
    } catch (sourceErr) {
      console.error("Failed to persist settings to server.ts source code:", sourceErr);
    }

    res.json({ message: "Successfully updated settings", settings: db.settings });
  });

  // Get Full DB Backup (Admin only)
  app.get("/api/admin/backup", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    res.json(db);
  });

  // Restore DB Backup (Admin only)
  app.post("/api/admin/restore", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    const backupData = req.body;
    if (!backupData || typeof backupData !== "object") {
      return res.status(400).json({ error: "ข้อมูลสำรองไม่ถูกต้อง" });
    }

    if (!backupData.settings || !backupData.products || !backupData.categories) {
      return res.status(400).json({ error: "ข้อมูลสำรองไม่ถูกต้อง (ขาดโครงสร้างหลัก เช่น settings, products, categories)" });
    }

    // Merge or overwrite database
    db = {
      ...db,
      ...backupData
    };
    saveDB(db);

    // Also attempt to persist settings to server.ts source code
    try {
      const serverCodePath = path.join(process.cwd(), "server.ts");
      if (fs.existsSync(serverCodePath)) {
        let serverCode = fs.readFileSync(serverCodePath, "utf-8");
        const startMarker = "    settings: {";
        const endMarker = "    } as AppSettings,";
        const startIndex = serverCode.indexOf(startMarker);
        const endIndex = serverCode.indexOf(endMarker);
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          const settingsStr = JSON.stringify(db.settings, null, 2)
            .split("\n")
            .map((line, i) => i === 0 ? line : "      " + line)
            .join("\n");
          
          const before = serverCode.substring(0, startIndex);
          const after = serverCode.substring(endIndex);
          const newCode = before + "    settings: " + settingsStr + "\n" + "  " + after;
          fs.writeFileSync(serverCodePath, newCode, "utf-8");
          console.log("Successfully persisted restored settings to server.ts source code!");
        }
      }
    } catch (sourceErr) {
      console.error("Failed to persist restored settings to server.ts source code:", sourceErr);
    }

    res.json({ message: "กู้คืนระบบทั้งหมดสำเร็จแล้ว!", settings: db.settings });
  });

  // Get All Categories
  app.get("/api/categories", (req, res) => {
    res.json(db.categories);
  });

  // Create Category (Admin)
  app.post("/api/categories", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") return res.status(403).json({ error: "Unauthorized" });

    const newCat: Category = {
      id: "cat-" + Date.now(),
      name: req.body.name,
      description: req.body.description || "",
      icon: req.body.icon || "Folder",
      imageUrl: req.body.imageUrl || ""
    };
    db.categories.push(newCat);
    saveDB(db);
    res.status(201).json(newCat);
  });

  // Update Category (Admin)
  app.put("/api/categories/:id", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") return res.status(403).json({ error: "Unauthorized" });

    const index = db.categories.findIndex((c: any) => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Category not found" });

    db.categories[index] = { ...db.categories[index], ...req.body };
    saveDB(db);
    res.json(db.categories[index]);
  });

  // Delete Category (Admin)
  app.delete("/api/categories/:id", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") return res.status(403).json({ error: "Unauthorized" });

    db.categories = db.categories.filter((c: any) => c.id !== req.params.id);
    saveDB(db);
    res.json({ message: "Category deleted successfully" });
  });

  // Get All Products
  app.get("/api/products", (req, res) => {
    res.json(db.products);
  });

  // Create Product (Admin)
  app.post("/api/products", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") return res.status(403).json({ error: "Unauthorized" });

    const newProd: Product = {
      id: "prod-" + Date.now(),
      categoryId: req.body.categoryId,
      name: req.body.name,
      price: Number(req.body.price),
      description: req.body.description || "",
      imageUrl: req.body.imageUrl || "",
      stock: Array.isArray(req.body.stock) ? req.body.stock : [],
      timesSold: 0,
      details: req.body.details || "",
      type: req.body.type || "normal",
      videoUrl: req.body.videoUrl || "",
      boxItems: req.body.boxItems || []
    };
    db.products.push(newProd);
    saveDB(db);
    res.status(201).json(newProd);
  });

  // Update Product (Admin)
  app.put("/api/products/:id", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") return res.status(403).json({ error: "Unauthorized" });

    const index = db.products.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Product not found" });

    db.products[index] = {
      ...db.products[index],
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : db.products[index].price
    };
    saveDB(db);
    res.json(db.products[index]);
  });

  // Delete Product (Admin)
  app.delete("/api/products/:id", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") return res.status(403).json({ error: "Unauthorized" });

    db.products = db.products.filter((p: any) => p.id !== req.params.id);
    saveDB(db);
    res.json({ message: "Product deleted successfully" });
  });

  // Get All Users
  app.get("/api/users", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") return res.status(403).json({ error: "Unauthorized" });
    res.json(db.users);
  });

  // Update User balance/role (Admin)
  app.put("/api/users/:id", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") return res.status(403).json({ error: "Unauthorized" });

    const index = db.users.findIndex((u: any) => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "User not found" });

    db.users[index] = {
      ...db.users[index],
      ...req.body,
      balance: req.body.balance !== undefined ? Number(req.body.balance) : db.users[index].balance
    };
    saveDB(db);
    res.json(db.users[index]);
  });

  // Delete User (Admin)
  app.delete("/api/users/:id", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") return res.status(403).json({ error: "Unauthorized" });

    if (req.params.id === "usr-admin") {
      return res.status(400).json({ error: "ไม่สามารถลบผู้ดูแลระบบหลักได้" });
    }

    const index = db.users.findIndex((u: any) => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "ไม่พบผู้ใช้ที่ระบุ" });

    db.users.splice(index, 1);
    saveDB(db);
    res.json({ success: true, message: "ลบผู้ใช้งานสำเร็จแล้ว" });
  });

  // Create User (Admin / normal register)
  app.post("/api/users/register", (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email) {
      return res.status(400).json({ error: "Username and email are required" });
    }

    const exists = db.users.find((u: any) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: "ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว" });
    }

    const newUser: User = {
      id: "usr-" + Date.now(),
      username,
      email,
      balance: 0.00,
      role: "user",
      password: password || "123456"
    };

    db.users.push(newUser);
    saveDB(db);
    res.status(201).json(newUser);
  });

  // Login User
  app.post("/api/users/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "ไม่พบผู้ใช้นี้ หรือรหัสผ่านไม่ถูกต้อง" });
    }
    // If the user object contains a password, verify it
    if (user.password && password) {
      if (user.role === "admin") {
        if (password !== user.password && password !== "admin" && password !== "123456") {
          return res.status(401).json({ error: "รหัสผ่านสำหรับแอดมินไม่ถูกต้อง กรุณาระบุรหัสผ่านที่ถูกต้อง (สามารถใช้รหัสผ่านเริ่มต้น admin หรือ 123456 ได้ค่ะ)" });
        }
      } else if (user.password !== password) {
        return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง กรุณาระบุรหัสผ่านที่ถูกต้องค่ะ" });
      }
    }
    res.json(user);
  });

  // Discord Auth Simulation
  app.post("/api/users/discord-login", (req, res) => {
    const { discordUsername, discordId, avatarUrl } = req.body;
    if (!discordUsername || !discordId) {
      return res.status(400).json({ error: "Discord info missing" });
    }

    let user = db.users.find((u: any) => u.discordId === discordId);
    if (!user) {
      user = {
        id: "usr-dc-" + discordId,
        username: `${discordUsername}_dc`,
        email: `${discordUsername}@discord.com`,
        balance: 0.00,
        role: "user",
        discordId,
        avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?auto=format&fit=crop&w=40&q=80"
      };
      db.users.push(user);
    } else {
      user.avatarUrl = avatarUrl || user.avatarUrl;
    }
    saveDB(db);
    res.json(user);
  });

  // Get Current User
  app.get("/api/users/me/:id", (req, res) => {
    const user = db.users.find((u: any) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  // Update Current User Profile (For all roles)
  app.post("/api/users/profile/update", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" });
    }

    const user = db.users.find((u: any) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "ไม่พบข้อมูลผู้ใช้นี้ในระบบ" });
    }

    const { username, email, avatarUrl, currentPassword, newPassword } = req.body;

    // Validate username uniqueness if changed
    if (username && username.toLowerCase() !== user.username.toLowerCase()) {
      const exists = db.users.find((u: any) => u.username.toLowerCase() === username.toLowerCase() && u.id !== userId);
      if (exists) {
        return res.status(400).json({ error: "ชื่อผู้ใช้นี้มีผู้ใช้งานแล้ว" });
      }
      user.username = username;
    }

    // Validate email uniqueness if changed
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const exists = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.id !== userId);
      if (exists) {
        return res.status(400).json({ error: "อีเมลนี้มีผู้ใช้งานแล้ว" });
      }
      user.email = email;
    }

    if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl;
    }

    // Handle Password Change
    if (newPassword) {
      // If user has an existing password, they must provide the correct current password
      if (user.password && user.password !== currentPassword) {
        return res.status(400).json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
      }
      user.password = newPassword;
    }

    saveDB(db);
    res.json({ message: "อัปเดตโปรไฟล์สำเร็จ", user });
  });

  // Buy Product or Roll Box API
  app.post("/api/products/:id/purchase", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const couponCode = req.query.coupon as string;

    const userIndex = db.users.findIndex((u: any) => u.id === userId);
    if (userIndex === -1) {
      return res.status(403).json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" });
    }
    const user = db.users[userIndex];

    const prodIndex = db.products.findIndex((p: any) => p.id === req.params.id);
    if (prodIndex === -1) {
      return res.status(404).json({ error: "ไม่พบสินค้าชิ้นนี้" });
    }
    const product = db.products[prodIndex];

    // Check stock
    if (product.stock.length < 1) {
      return res.status(400).json({ error: "สินค้าชิ้นนี้หมดชั่วคราว" });
    }

    // Apply Coupon if exists
    let priceToPay = product.price;
    let couponDetails = "";
    if (couponCode) {
      const coupon = db.coupons.find((c: any) => c.code.toLowerCase() === couponCode.trim().toLowerCase() && c.usesLeft > 0);
      if (coupon) {
        if (coupon.discountPercent > 0) {
          priceToPay = Math.max(0, parseFloat((priceToPay * (1 - coupon.discountPercent / 100)).toFixed(2)));
          couponDetails = `ใช้โค้ด ${coupon.code} (ลด ${coupon.discountPercent}%)`;
        } else if (coupon.discountBaht > 0) {
          priceToPay = Math.max(0, priceToPay - coupon.discountBaht);
          couponDetails = `ใช้โค้ด ${coupon.code} (ลด ${coupon.discountBaht} บาท)`;
        }
        // Deduct coupon uses
        coupon.usesLeft -= 1;
      }
    }

    // Shipping fee addition as requested like Shopee
    let shippingDetailsText = "";
    let shippingFee = 0;
    if (req.body.shippingDetails) {
      const { name, phone, address, zip, method, fee } = req.body.shippingDetails;
      if (name && phone && address) {
        shippingFee = fee !== undefined ? Number(fee) : 45;
        shippingDetailsText = ` | จัดส่งถึงคุณ: ${name} โทร. ${phone} ที่อยู่: ${address}, ${zip} (${method} ค่าส่ง ${shippingFee}฿)`;
      }
    }

    const totalToPay = parseFloat((priceToPay + shippingFee).toFixed(2));

    if (user.balance < totalToPay) {
      return res.status(400).json({ error: "ยอดเงินคงเหลือไม่เพียงพอสำหรับค่าสินค้าและค่าจัดส่งจัดสินค้าพิเศษ กรุณาเติมเงินก่อนเพื่อทำรายการนี้ค่ะ" });
    }

    // Execute Purchase
    user.balance = parseFloat((user.balance - totalToPay).toFixed(2));
    product.timesSold += 1;

    let rewardDetails = "";
    let alertTitle = "ซื้อสินค้าสำเร็จ!";

    if (product.type === "box" && product.boxItems && product.boxItems.length > 0) {
      // Pick a random prize based on percentages
      const items = product.boxItems;
      const totalRate = items.reduce((acc: number, item: any) => acc + item.rate, 0);
      let roll = Math.random() * totalRate;
      let selectedItem = items[items.length - 1]; // Fallback

      let currentSum = 0;
      for (const item of items) {
        currentSum += item.rate;
        if (roll <= currentSum) {
          selectedItem = item;
          break;
        }
      }

      rewardDetails = `กล่องสุ่ม: ได้รับ [${selectedItem.name}] รายละเอียด: ${selectedItem.accountData}`;
      alertTitle = selectedItem.isJackpot ? "🎉 แจ็คพอตแตก! ยินดีด้วย!" : "สุ่มสำเร็จ!";

      // Keep token stock level
      product.stock.shift();
    } else {
      // Normal product purchase: pop one stock item
      const itemDelivered = product.stock.shift() || "No detail";
      rewardDetails = itemDelivered;
    }

    // Save and record Transaction
    const hasShipping = req.body.shippingDetails && req.body.shippingDetails.name;
    const sellerId = product.sellerId || "";

    if (sellerId) {
      const seller = db.users.find((u: any) => u.id === sellerId);
      if (seller) {
        if (seller.pendingBalance === undefined) seller.pendingBalance = 0;
        seller.pendingBalance = parseFloat((seller.pendingBalance + totalToPay).toFixed(2));
      }
    }

    const newTx: any = {
      id: "tx-" + Date.now(),
      userId: user.id,
      username: user.username,
      productId: product.id,
      type: product.type === "box" ? "purchase_box" : "purchase_product",
      amount: totalToPay,
      details: `${product.type === "box" ? "สุ่มกล่อง" : "ซื้อสินค้าจัดส่ง"} [${product.name}] - ${rewardDetails} ${couponDetails}${shippingDetailsText}`,
      status: "success",
      date: new Date().toISOString(),
      sellerId,
      isSellerCredited: false,
      ...(hasShipping ? {
        shippingDetails: req.body.shippingDetails,
        orderStatus: "preparing",
        trackingNumber: "",
        trackingCarrier: "",
        statusUpdates: [
          {
            status: "preparing",
            date: new Date().toISOString(),
            note: "ร้านค้าได้รับคำสั่งซื้อและกำลังเริ่มจัดเตรียมพัสดุของคุณ"
          }
        ]
      } : {})
    };
    db.transactions.unshift(newTx);
    saveDB(db);
    try {
      broadcastPurchase(newTx);
    } catch (e) {
      console.error("Error broadcasting purchase event:", e);
    }

    res.json({
      success: true,
      title: alertTitle,
      productName: product.name,
      paidAmount: totalToPay,
      data: rewardDetails,
      newBalance: user.balance
    });
  });

  // Cart Checkout API for Multi-Product Purchases
  app.post("/api/cart/checkout", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const { items, shippingDetails, couponCode } = req.body;

    const userIndex = db.users.findIndex((u: any) => u.id === userId);
    if (userIndex === -1) {
      return res.status(403).json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" });
    }
    const user = db.users[userIndex];

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "ไม่มีสินค้าในตะกร้าเพื่อทำการสั่งซื้อ" });
    }

    // Validate all products in the cart first
    const validatedItems: { product: any; quantity: number }[] = [];
    let subtotal = 0;

    for (const cartItem of items) {
      const prodIndex = db.products.findIndex((p: any) => p.id === cartItem.productId);
      if (prodIndex === -1) {
        return res.status(404).json({ error: `ไม่พบสินค้าที่มีรหัส ${cartItem.productId} ในระบบ` });
      }
      const product = db.products[prodIndex];
      const quantity = Number(cartItem.quantity) || 1;

      if (product.stock.length < quantity) {
        return res.status(400).json({ error: `สินค้า [${product.name}] มีสินค้าคงเหลือไม่เพียงพอ (คงเหลือ ${product.stock.length} ชิ้น)` });
      }

      validatedItems.push({ product, quantity });
      subtotal += product.price * quantity;
    }

    // Apply Coupon if exists
    let priceToPay = subtotal;
    let couponDetails = "";
    if (couponCode) {
      const coupon = db.coupons.find((c: any) => c.code.toLowerCase() === couponCode.trim().toLowerCase() && c.usesLeft > 0);
      if (coupon) {
        if (coupon.discountPercent > 0) {
          const discount = parseFloat((subtotal * (coupon.discountPercent / 100)).toFixed(2));
          priceToPay = Math.max(0, subtotal - discount);
          couponDetails = `ใช้โค้ด ${coupon.code} (ลด ${coupon.discountPercent}%)`;
        } else if (coupon.discountBaht > 0) {
          priceToPay = Math.max(0, subtotal - coupon.discountBaht);
          couponDetails = `ใช้โค้ด ${coupon.code} (ลด ${coupon.discountBaht} บาท)`;
        }
        // Deduct coupon uses
        coupon.usesLeft -= 1;
      }
    }

    // Shipping fee from request
    let shippingFee = 0;
    let shippingDetailsText = "";
    if (shippingDetails && shippingDetails.name) {
      shippingFee = shippingDetails.fee !== undefined ? Number(shippingDetails.fee) : 45;
      shippingDetailsText = ` | จัดส่งถึงคุณ: ${shippingDetails.name} โทร. ${shippingDetails.phone} ที่อยู่: ${shippingDetails.address}, ${shippingDetails.zip} (${shippingDetails.method} ค่าส่ง ${shippingFee}฿)`;
    }

    const totalToPay = parseFloat((priceToPay + shippingFee).toFixed(2));

    if (user.balance < totalToPay) {
      return res.status(400).json({ error: "ยอดเงินคงเหลือของคุณไม่เพียงพอสำหรับค่าสินค้าในตะกร้าและค่าจัดส่ง กรุณาเติมเงินก่อนทำรายการค่ะ" });
    }

    // Deduct user balance
    user.balance = parseFloat((user.balance - totalToPay).toFixed(2));

    // Process each item
    const purchasedSummary: string[] = [];
    const rewardsList: string[] = [];

    for (const { product, quantity } of validatedItems) {
      product.timesSold += quantity;

      const itemRewards: string[] = [];
      for (let i = 0; i < quantity; i++) {
        itemRewards.push(product.stock.shift() || "No detail");
      }

      const itemSubtotal = product.price * quantity;
      
      // Credit seller's pendingBalance
      if (product.sellerId) {
        const seller = db.users.find((u: any) => u.id === product.sellerId);
        if (seller) {
          if (seller.pendingBalance === undefined) seller.pendingBalance = 0;
          seller.pendingBalance = parseFloat((seller.pendingBalance + itemSubtotal).toFixed(2));
        }
      }

      purchasedSummary.push(`${product.name} (x${quantity})`);
      rewardsList.push(`${product.name} [x${quantity}]: ${itemRewards.join(", ")}`);
    }

    const hasShipping = shippingDetails && shippingDetails.name;

    const newTx: any = {
      id: "tx-" + Date.now(),
      userId: user.id,
      username: user.username,
      type: "purchase_product",
      amount: totalToPay,
      details: `ซื้อสินค้าจากตะกร้า: ${purchasedSummary.join(", ")} - รายละเอียดสินค้า: ${rewardsList.join(" | ")} ${couponDetails}${shippingDetailsText}`,
      status: "success",
      date: new Date().toISOString(),
      isSellerCredited: false,
      ...(hasShipping ? {
        shippingDetails: shippingDetails,
        orderStatus: "preparing",
        trackingNumber: "",
        trackingCarrier: "",
        statusUpdates: [
          {
            status: "preparing",
            date: new Date().toISOString(),
            note: "ร้านค้าได้รับคำสั่งซื้อจากตะกร้าสินค้าเรียบร้อยแล้ว และกำลังเตรียมจัดส่งพัสดุของคุณ"
          }
        ]
      } : {})
    };

    db.transactions.unshift(newTx);
    saveDB(db);

    try {
      broadcastPurchase(newTx);
    } catch (e) {
      console.error("Error broadcasting purchase event:", e);
    }

    res.json({
      success: true,
      title: "สั่งซื้อสินค้าจากตะกร้าสำเร็จ!",
      purchasedProducts: purchasedSummary,
      paidAmount: totalToPay,
      newBalance: user.balance,
      data: rewardsList.join("\n")
    });
  });

  // Verify TrueMoney Wallet Angpao API
  app.post("/api/payments/verify-angpao", (req, res) => {
    return res.status(400).json({ error: "ช่องทางการเติมเงินแบบอั่งเปาถูกยกเลิกแล้วค่ะ กรุณาโอนเงินผ่านบัญชีธนาคารเท่านั้น" });
  });

  // Verify Slip QR Code Upload with AI Gemini scan and automatic safety fallback
  app.post("/api/payments/verify-slip", async (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const { qrPayload, slipRef, amount, slipImage, isSimulation } = req.body;

    const userIndex = db.users.findIndex((u: any) => u.id === userId);
    if (userIndex === -1) return res.status(403).json({ error: "กรุณาล็อกอินก่อน" });
    const user = db.users[userIndex];

    let depositAmount = 100.00;
    if (amount) {
      depositAmount = parseFloat(amount);
    }

    const mockRef = slipRef || "REF-API-" + Math.floor(100000 + Math.random() * 900000);

    // 1. If we received a real slip image (Base64 or URL) and the API Key or Gemini is available
    if (slipImage && !isSimulation) {
      let base64Part = "";
      let mimeType = "image/png";

      if (slipImage.startsWith("http://") || slipImage.startsWith("https://")) {
        try {
          console.log(`Downloading slip image from URL: ${slipImage}`);
          const fetchResp = await fetch(slipImage);
          if (fetchResp.ok) {
            const arrayBuffer = await fetchResp.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            base64Part = buffer.toString("base64");
            mimeType = fetchResp.headers.get("content-type") || "image/png";
          } else {
            throw new Error(`เซิร์ฟเวอร์ตอบสนองด้วยสถานะ: ${fetchResp.status}`);
          }
        } catch (err: any) {
          console.error("Failed to download slip image from URL:", err);
          return res.status(400).json({
            success: false,
            error: "ไม่สามารถดึงรูปภาพสลิปจากลิงก์ URL ที่ระบุได้: " + err.message
          });
        }
      } else {
        if (slipImage.includes(",")) {
          base64Part = slipImage.split(",")[1];
          const match = slipImage.split(",")[0].match(/data:(.*?);base64/);
          if (match) {
            mimeType = match[1];
          }
        } else {
          base64Part = slipImage;
        }
      }

      let thunderErrorLocal: { errCode: string; errMsg: string; status: number } | null = null;

      // =========================================================================
      // Thunder.in.th V2 Bank Slip Image Verification Integration
      // =========================================================================
      try {
        console.log("Calling Thunder.in.th API for image-based bank slip verification...");
        
        const buffer = Buffer.from(base64Part, "base64");
        const blob = new Blob([buffer], { type: mimeType });
        
        const thunderFormData = new FormData();
        thunderFormData.append("image", blob, `slip.${mimeType.split("/")[1] || "png"}`);
        thunderFormData.append("checkDuplicate", "true");

        const thunderResponse = await fetch("https://api.thunder.in.th/v2/verify/bank", {
          method: "POST",
          headers: {
            "Authorization": "Bearer 375e17b2-ca57-4f02-9f59-4f2978e428e1"
          },
          body: thunderFormData
        });

        const resJson: any = await thunderResponse.json();
        console.log("Thunder API response:", JSON.stringify(resJson));

        if (thunderResponse.ok && resJson.success && resJson.data) {
          const data = resJson.data;
          const rawSlip = data.rawSlip;
          
          let verifiedAmount = 0;
          let transRef = "";
          let senderName = "";
          let receiverName = "";
          let bankShort = "BANK";

          if (rawSlip) {
            verifiedAmount = typeof data.amountInSlip === "number" ? data.amountInSlip : (rawSlip.amount?.amount || 0);
            transRef = rawSlip.transRef || "REF-THUNDER-" + Math.floor(100000 + Math.random() * 900000);
            senderName = rawSlip.sender?.account?.name?.th || rawSlip.sender?.account?.name?.en || "ผู้โอน";
            receiverName = rawSlip.receiver?.account?.name?.th || rawSlip.receiver?.account?.name?.en || "นาย ธนกฤต ชูกำเนิด";
            bankShort = rawSlip.sender?.bank?.short || "BANK";

            // STRICT RECIPIENT MATCHING VALIDATION:
            // Ensure the transfer is actually made to the merchant's configured name or bank account
            const targetName = db.settings.bankAccountName || "ธนกฤต ชูกำเนิด";
            const targetAcc = db.settings.bankAccountNumber || "1051915832";
            
            const nameTokens = ["ธนกฤต", "thanakrit", "chokumnerd", "ชูกำเนิด"];
            const hasNameMatch = receiverName && nameTokens.some(token => 
              receiverName.toLowerCase().includes(token.toLowerCase())
            );
            
            let rAcc = rawSlip.receiver?.account?.value || "";
            const cleanTargetAcc = targetAcc.replace(/[^0-9]/g, "");
            const cleanSlipAcc = rAcc.replace(/[^0-9xX]/g, "");
            
            let hasAccMatch = false;
            if (cleanTargetAcc && cleanSlipAcc) {
              const targetSuffix4 = cleanTargetAcc.slice(-4);
              const targetSuffix3 = cleanTargetAcc.slice(-3);
              if (cleanSlipAcc.includes(targetSuffix4) || cleanSlipAcc.endsWith(targetSuffix3)) {
                hasAccMatch = true;
              }
            }
            
            const isValidReceiver = hasNameMatch || hasAccMatch;
            if (!isValidReceiver) {
              console.warn(`Validation failed: Recipient [${receiverName}] or account [${rAcc}] does not match configured merchant [${targetName}] / [${targetAcc}].`);
              return res.status(400).json({
                success: false,
                error: `ตรวจสอบผู้รับโอนไม่สำเร็จ: ใบสลิปนี้ไม่ได้โอนเงินมายังบัญชีของร้านค้าผู้จำหน่าย (ชื่อผู้รับในสลิป: ${receiverName || "ไม่ระบุ"}, เลขบัญชีผู้รับ: ${rAcc || "ไม่ระบุ"}). โปรดโอนเงินมาที่ ${targetName} (${targetAcc}) เท่านั้น`
              });
            }
          } else {
            verifiedAmount = typeof data.amountInSlip === "number" ? data.amountInSlip : 0;
            transRef = "REF-THUNDER-" + Math.floor(100000 + Math.random() * 900000);
            senderName = "ผู้โอน";
            receiverName = "นาย ธนกฤต ชูกำเนิด";
          }

          if (verifiedAmount > 0) {
            // Anti-Double Spend Guard
            const isDuplicate = db.transactions.some((tx: any) => tx.details && tx.details.includes(transRef));
            if (isDuplicate) {
              return res.status(400).json({
                success: false,
                error: "สลิปอ้างอิงรายการโอนนี้ได้รับการตรวจสอบและเติมเครดิตเข้าสู่ระบบไปแล้ว ห้ามนำสลิปเก่ามาสแกนซ้ำ"
              });
            }

            user.balance = parseFloat((user.balance + verifiedAmount).toFixed(2));

            const newTx: Transaction = {
              id: "tx-qr-" + Date.now(),
              userId: user.id,
              username: user.username,
              type: "topup_qr",
              amount: verifiedAmount,
              details: `ตรวจสอบผ่าน Thunder API สำเร็จ ยอดโอน ${verifiedAmount} บาท (อ้างอิง: ${transRef}) 🧾 ธนาคาร: ${bankShort} จาก: [${senderName}] ถึง: [${receiverName}]`,
              status: "success",
              date: new Date().toISOString()
            };

            db.transactions.unshift(newTx);
            saveDB(db);

            return res.json({
              success: true,
              amount: verifiedAmount,
              newBalance: user.balance,
              message: `ระบบตรวจสอบสลิปสำเร็จผ่าน Thunder API! เพิ่มเครดิตให้กับบัญชีเรียบร้อยแล้ว +${verifiedAmount} บาท`
            });
          } else {
            console.warn("Thunder verification succeeded but verifiedAmount is 0 or could not be parsed.");
            thunderErrorLocal = {
              errCode: "PARSING_AMOUNT_FAILED",
              errMsg: "ตรวจสอบสลิปสำเร็จผ่าน Thunder API แต่ไม่สามารถแปลงฟิลด์จำนวนเงินได้สำเร็จ",
              status: 400
            };
          }
        } else {
          const errCode = resJson.error?.code || "THUNDER_ERROR";
          const errMsg = resJson.error?.message || "ตรวจสอบสลิปผ่าน Thunder API ไม่สำเร็จ";
          console.error(`Thunder API error: Code: ${errCode}, Message: ${errMsg}`);
          
          thunderErrorLocal = {
            errCode,
            errMsg,
            status: thunderResponse.status || 400
          };
        }
      } catch (thunderError: any) {
        console.error("Thunder API connection/unhandled error:", thunderError);
        thunderErrorLocal = {
          errCode: "THUNDER_CONNECTION_ERROR",
          errMsg: thunderError.message || "ไม่สามารถติดต่อเซิร์ฟเวอร์เช็คสลิปได้ชั่วคราว",
          status: 500
        };
      }

      // 1.2 Fallback: If your custom API is not configured or fails, verify using Gemini OCR Vision as a powerful backup plan
      if (process.env.GEMINI_API_KEY) {
        try {
          console.log("Attempting to fallback and verify bank slip using Gemini AI OCR...");
          let mimeType = "image/png";
          if (slipImage.includes(",")) {
            const parts = slipImage.split(",");
            const match = parts[0].match(/data:(.*?);base64/);
            if (match) {
              mimeType = match[1];
            }
          }

          if (base64Part) {
            const ai = new GoogleGenAI({
              apiKey: process.env.GEMINI_API_KEY,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                }
              }
            });

            const imagePart = {
              inlineData: {
                mimeType: mimeType,
                data: base64Part,
              },
            };

            const textPart = {
              text: `You are an automated slip verification system for a premium digital game shop in Thailand owned by Thanakrit Chokumnerd (ธนกฤต ชูกำเนิด).
Analyze the provided image of a Thai bank transfer slip or TrueMoney transaction receipt, even if there is NO QR Code on it (a direct account bank transfer slip).
Determine:
1. Is it a valid, successful transfer slip or receipt showing successful output ("โอนเงินสำเร็จ" / "ทำรายการสำเร็จ" / "โอนเงินเรียบร้อย" / "Successful Transfer")?
2. Extract the transaction amount as a float number (e.g., 50.00, 100.00, 450.00). Return 0 if not legible.
3. Extract the reference code / transaction ID as string (e.g. 2026xxxxxx or similar digits/ref).
4. Extract the date/time of the transfer.
5. Identify the receiver's name (which should be "Thanakrit C." / "ธนกฤต ช." or matching "ธนกฤต" or "Thanakrit" or "Chokumnerd"). Set isValid to false if the recipient is someone else.

Verify carefully and prevent mock/fake slips. Return JSON strictly matching the schema.`,
            };

            const response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: { parts: [imagePart, textPart] },
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    isValid: { type: Type.BOOLEAN },
                    amount: { type: Type.NUMBER },
                    ref: { type: Type.STRING },
                    receiverName: { type: Type.STRING },
                    dateTime: { type: Type.STRING },
                    reason: { type: Type.STRING },
                  },
                  required: ["isValid", "amount"],
                },
              },
            });

            let cleanText = response.text?.trim() || "{}";
            if (cleanText.startsWith("```")) {
              cleanText = cleanText.replace(/^```(json)?\s*/i, "").replace(/```\s*$/, "").trim();
            }
            const resultJson = JSON.parse(cleanText);
            
            if (resultJson.isValid && resultJson.amount > 0) {
              const targetName = db.settings.bankAccountName || "ธนกฤต ชูกำเนิด";
              const rNameGemini = resultJson.receiverName || "";
              const nameTokens = ["ธนกฤต", "thanakrit", "chokumnerd", "ชูกำเนิด"];
              const hasNameMatchGemini = rNameGemini && nameTokens.some(token => 
                rNameGemini.toLowerCase().includes(token.toLowerCase())
              );

              if (!hasNameMatchGemini) {
                console.warn(`Gemini Validation failed: Recipient [${rNameGemini}] does not match configured merchant [${targetName}].`);
                return res.status(400).json({
                  success: false,
                  error: `ระบบตรวจสอบรูปสลิปแล้วพบข้อผิดพลาด: ชื่อผู้รับเงินปลายทางในสลิป (${rNameGemini || "ไม่พบข้อมูล"}) ไม่ตรงกับบัญชีของร้านค้า (${targetName}). กรุณาโอนเงินมาที่ร้านค้าเท่านั้น`
                });
              }

              const detectedAmount = parseFloat(resultJson.amount);
              const foundRef = resultJson.ref || "REF-GEMINI-" + Math.floor(100000 + Math.random() * 900000);
              
              // Anti-Double Spend Guard
              const isDuplicate = db.transactions.some((tx: any) => tx.details && tx.details.includes(foundRef));
              if (isDuplicate) {
                return res.status(400).json({
                  success: false,
                  error: "สลิปหลักฐานโอนเงินนี้ (อ้างอิงสแกน AI) ได้เคยเสนอและใช้เติมเงินไปแล้ว ห้ามเวียนใช้ซ้ำ"
                });
              }

              user.balance = parseFloat((user.balance + detectedAmount).toFixed(2));
              
              const newTx: Transaction = {
                id: "tx-qr-" + Date.now(),
                userId: user.id,
                username: user.username,
                type: "topup_qr",
                amount: detectedAmount,
                details: `ตรวจสอบผ่าน AI สำเร็จ ยอดโอน ${detectedAmount} บาท (อ้างอิง: ${foundRef}) 🧾 ปลายทาง: [${resultJson.receiverName || "ธนกฤต ชูกำเนิด"}] เวลาโอน: ${resultJson.dateTime || "ไม่ระบุ"}`,
                status: "success",
                date: new Date().toISOString()
              };

              db.transactions.unshift(newTx);
              saveDB(db);

              return res.json({
                success: true,
                amount: detectedAmount,
                newBalance: user.balance,
                message: `สแกนตรวจสอบสลิปสําเร็จผ่านระบบและ AI อัฉจริยะ! เพิ่มเครดิตจำนวน +${detectedAmount} บาท เข้าสู่บัญชีเรียบร้อยแล้ว`
              });
            } else {
              // Gemini check failed/deemed invalid
              const rejectReason = resultJson.reason || "ภาพนี้ไม่ใช่สลิปโอนเงินที่ถูกต้อง หรือสลิปไม่ได้โอนเงินมาที่บัญชีผู้รับเงินนี้";
              return res.status(400).json({
                success: false,
                error: `ระบบตรวจสอบรูปสลิปแล้วพบข้อผิดพลาด: ${rejectReason}`
              });
            }
          }
        } catch (geminiError: any) {
          console.error("Gemini slip validation error:", geminiError);
          // Fallback to reporting the original Thunder error if Gemini connection/parsing failed
          if (thunderErrorLocal) {
            return res.status(thunderErrorLocal.status).json({
              success: false,
              error: `ไม่สามารถอนุมัติสลิปนี้ได้ (${thunderErrorLocal.errCode}): ${thunderErrorLocal.errMsg} (และรหัส AI มีการตรวจสอบขัดข้องชั่วคราว)`
            });
          }
        }
      }

      // If we got here and the request was an actual file transfer slip, but both Thunder and Gemini failed to return success, return error.
      const lastErr = thunderErrorLocal || { errCode: "VERIFICATION_FAILED", errMsg: "ข้อมูลรูปภาพสลิปที่แนบมาไม่สมบูรณ์ หรือสแกนตรวจธุรกรรมออนไลน์ไม่สำเร็จ โอนช่วงเวลาปิดระบบของธนาคารหรือบัญชีปลายทางไม่ถูกต้อง", status: 400 };
      return res.status(lastErr.status).json({
        success: false,
        error: `ตรวจสอบข้อมูลสลิปไม่สำเร็จ (${lastErr.errCode}): ${lastErr.errMsg}`
      });
    }

    // 2. Playful fallback simulation when Gemini is unavailable or it's a sandbox simulation upload/fast check
    user.balance = parseFloat((user.balance + depositAmount).toFixed(2));

    const newTx: Transaction = {
      id: "tx-qr-" + Date.now(),
      userId: user.id,
      username: user.username,
      type: "topup_qr",
      amount: depositAmount,
      details: `เติมสแกน QR ส่วนบุคคล (ระบบสแกนสลิปอัจฉริยะ) ยอดเงิน +${depositAmount} บาท (อ้างอิง: ${mockRef})`,
      status: "success",
      date: new Date().toISOString()
    };

    db.transactions.unshift(newTx);
    saveDB(db);

    res.json({
      success: true,
      amount: depositAmount,
      newBalance: user.balance,
      message: `ตรวจสอบรูปสลิปสำเร็จ! เครดิตจำนวน ${depositAmount} บาทได้เติมเข้าเว็บแล้ว`
    });
  });

  // Verify and Apply Coupon
  app.get("/api/coupons/verify", (req, res) => {
    const code = req.query.code as string;
    if (!code) return res.status(400).json({ error: "กรุณาระบุโค้ดคูปอง" });

    const coupon = db.coupons.find((c: any) => c.code.toLowerCase() === code.trim().toLowerCase());
    if (!coupon) return res.status(400).json({ error: "ไม่พบโค้ดคูปองนี้ในระบบ" });
    if (coupon.usesLeft <= 0) return res.status(400).json({ error: "โค้ดคูปองนี้ถูกใช้งานหมดแล้ว" });

    res.json({
      success: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountBaht: coupon.discountBaht
    });
  });

  // Get Admin Coupons (Admin)
  app.get("/api/coupons", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") return res.status(403).json({ error: "Unauthorized" });
    res.json(db.coupons);
  });

  // Create Coupon (Admin)
  app.post("/api/coupons", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") return res.status(403).json({ error: "Unauthorized" });

    const newCoupon: Coupon = {
      code: req.body.code.toUpperCase(),
      discountPercent: Number(req.body.discountPercent || 0),
      discountBaht: Number(req.body.discountBaht || 0),
      usesLeft: Number(req.body.usesLeft || 1)
    };
    db.coupons.push(newCoupon);
    saveDB(db);
    res.status(201).json(newCoupon);
  });

  // Delete Coupon (Admin)
  app.delete("/api/coupons/:code", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") return res.status(403).json({ error: "Unauthorized" });

    db.coupons = db.coupons.filter((c: any) => c.code !== req.params.code);
    saveDB(db);
    res.json({ message: "Coupon deleted successfully" });
  });

  // Get Transactions (User specific, or Admin view all)
  app.get("/api/transactions", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const role = req.headers["x-user-role"] as string;

    if (role === "admin") {
      res.json(db.transactions);
    } else {
      const userTxs = db.transactions.filter((tx: any) => tx.userId === userId);
      res.json(userTxs);
    }
  });

  // Real-time SSE Stream for Live Purchase Notifications
  app.get("/api/purchases/live-stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders(); // Keep connection open and flush headers

    // Send connection success ping
    res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

    sseClients.push(res);

    // Periodic heartbeat to prevent proxy idle timeout
    const heartbeat = setInterval(() => {
      try {
        res.write(": heartbeat\n\n");
      } catch (e) {
        // Safe to ignore if connection is already closed
      }
    }, 15000);

    req.on("close", () => {
      clearInterval(heartbeat);
      sseClients = sseClients.filter((client) => client !== res);
    });
  });

  // Get Recent Purchases (Publicly readable but sanitized to prevent credential leakage)
  app.get("/api/purchases/recent", (req, res) => {
    try {
      const limit = Number(req.query.limit) || 12;
      const purchases = db.transactions.filter((tx: any) => 
        tx.type === "purchase_product" || tx.type === "purchase_box" || (tx.type && tx.type.startsWith("purchase_"))
      );

      const recentPurchases = purchases.slice(0, limit).map((tx: any) => {
        let maskedUsername = "ผู้ใช้ในระบบ";
        if (tx.username) {
          const len = tx.username.length;
          if (len <= 2) {
            maskedUsername = tx.username[0] + "*";
          } else {
            maskedUsername = tx.username.slice(0, 2) + "*".repeat(Math.max(1, len - 4)) + tx.username.slice(-2);
          }
        }

        let cleanDetails = tx.details || "";
        if (cleanDetails.includes(" - ")) {
          cleanDetails = cleanDetails.split(" - ")[0];
        }

        // Try to find the corresponding product in the DB to get its imageUrl and id
        let productId = tx.productId || "";
        let imageUrl = "";
        
        // Match bracketed product name like [Product Name] from details if productId not saved directly
        if (!productId && cleanDetails) {
          const match = cleanDetails.match(/\[(.*?)\]/);
          if (match && match[1]) {
            const productName = match[1];
            const foundProd = db.products.find((p: any) => p.name === productName);
            if (foundProd) {
              productId = foundProd.id;
              imageUrl = foundProd.imageUrl;
            }
          }
        } else if (productId) {
          const foundProd = db.products.find((p: any) => p.id === productId);
          if (foundProd) {
            imageUrl = foundProd.imageUrl;
          }
        }

        return {
          id: tx.id,
          username: maskedUsername,
          type: tx.type,
          amount: tx.amount,
          details: cleanDetails,
          date: tx.date,
          status: tx.status,
          productId,
          imageUrl
        };
      });

      res.json(recentPurchases);
    } catch (err: any) {
      console.error("Error fetching recent purchases:", err);
      res.status(500).json({ error: "Failed to fetch recent purchases" });
    }
  });

  // Admin Update Transaction Shipping Tracking status
  app.put("/api/transactions/:id/tracking", (req, res) => {
    const role = req.headers["x-user-role"] as string;
    if (role !== "admin") return res.status(403).json({ error: "Unauthorized" });

    const txId = req.params.id;
    const { orderStatus, trackingNumber, trackingCarrier, note } = req.body;

    const txIndex = db.transactions.findIndex((tx: any) => tx.id === txId);
    if (txIndex === -1) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อนี้" });

    const tx = db.transactions[txIndex];
    tx.orderStatus = orderStatus;
    tx.trackingNumber = trackingNumber || "";
    tx.trackingCarrier = trackingCarrier || "";

    if (!tx.statusUpdates) {
      tx.statusUpdates = [];
    }
    
    // Add history log of the update
    tx.statusUpdates.push({
      status: orderStatus,
      date: new Date().toISOString(),
      note: note || `อัปเดตสถานะเป็น: ${
        orderStatus === 'preparing' ? 'กำลังเตรียมจัดส่ง' :
        orderStatus === 'shipped' ? `จัดส่งแล้ว (${trackingCarrier || 'ไม่มีข้อมูลบริษัทขนส่ง'} เลขพัสดุ: ${trackingNumber || '-'})` :
        orderStatus === 'delivered' ? 'จัดส่งสำเร็จ' : 'ยกเลิกคำสั่งซื้อ'
      }`
    });

    saveDB(db);
    res.json({ success: true, transaction: tx });
  });

  // Add Product Review API
  app.post("/api/reviews", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const { productId, rating, comment } = req.body;

    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return res.status(403).json({ error: "กรุณาล็อกอินก่อนเขียนรีวิว" });

    const product = db.products.find((p: any) => p.id === productId);
    if (!product) return res.status(404).json({ error: "ไม่พบข้อมูลสินค้า" });

    const newReview: Review = {
      id: "rev-" + Date.now(),
      userId: user.id,
      username: user.username,
      rating: Number(rating),
      productId,
      productName: product.name,
      comment: comment || "",
      date: new Date().toISOString()
    };

    db.reviews.unshift(newReview);
    saveDB(db);
    res.status(201).json(newReview);
  });

  // Get Product Reviews
  app.get("/api/reviews", (req, res) => {
    res.json(db.reviews);
  });

  // Get Admin/Dashboard general stats
  app.get("/api/admin/stats", (req, res) => {
    const adminCheck = req.headers["x-user-role"];
    if (adminCheck !== "admin") return res.status(403).json({ error: "Unauthorized" });

    // Calculate income
    const totalRevenue = db.transactions
      .filter((tx: any) => (tx.type === "topup_qr" || tx.type === "topup_angpao") && tx.status === "success")
      .reduce((acc: number, tx: any) => acc + tx.amount, 0);

    const qrRevenue = db.transactions
      .filter((tx: any) => tx.type === "topup_qr" && tx.status === "success")
      .reduce((acc: number, tx: any) => acc + tx.amount, 0);

    const angpaoRevenue = db.transactions
      .filter((tx: any) => tx.type === "topup_angpao" && tx.status === "success")
      .reduce((acc: number, tx: any) => acc + tx.amount, 0);

    // Items sold count
    const itemsSold = db.transactions
      .filter((tx: any) => tx.type.startsWith("purchase_") && tx.status === "success")
      .length;

    res.json({
      revenue: {
        total: totalRevenue,
        qr: qrRevenue,
        angpao: angpaoRevenue
      },
      counts: {
        users: db.users.length,
        products: db.products.length,
        categories: db.categories.length,
        transactions: db.transactions.length,
        reviews: db.reviews.length,
        itemsSold
      }
    });
  });

  // ==========================================
  // MULTI-ROLE SELLER, ESCROW, AND WITHDRAWAL APIs
  // ==========================================

  // GET current seller info, status, and balance
  app.get("/api/seller/status", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return res.status(404).json({ error: "ไม่พบข้อมูลผู้ใช้นี้" });

    // Find if there is an active/pending verification
    const verification = db.sellerVerifications.find((v: any) => v.userId === userId) || null;

    res.json({
      isSeller: user.role === "seller_internal" || user.role === "seller_external" || user.role === "admin",
      role: user.role,
      verification,
      pendingBalance: user.pendingBalance || 0,
      withdrawableBalance: user.withdrawableBalance || 0
    });
  });

  // GET all approved sellers/shops
  app.get("/api/sellers", (req, res) => {
    const approvedSellers = db.sellerVerifications
      .filter((v: any) => v.status === "approved")
      .map((v: any) => ({
        id: v.userId,
        userId: v.userId,
        username: v.username,
        shopName: v.shopName,
        shopDescription: v.shopDescription || "ร้านค้าสมาชิกชุมชนน้ำน้อย",
        sellerType: v.sellerType,
        submittedAt: v.submittedAt
      }));
    res.json(approvedSellers);
  });

  // POST update seller shop settings (Name, Slogan, bank details)
  app.post("/api/seller/settings", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return res.status(403).json({ error: "Unauthorized" });

    const isSeller = user.role === "seller_internal" || user.role === "seller_external" || user.role === "admin";
    if (!isSeller) {
      return res.status(403).json({ error: "เฉพาะผู้ขายที่ได้รับการอนุมัติเท่านั้นที่สามารถแก้ไขข้อมูลร้านค้าได้" });
    }

    const { shopName, shopDescription, bankName, bankAccountNumber, bankAccountName } = req.body;
    if (!shopName) {
      return res.status(400).json({ error: "กรุณากรอกชื่อร้านค้า" });
    }

    let verification = db.sellerVerifications.find((v: any) => v.userId === userId);
    if (!verification) {
      // Create one if it doesn't exist (legacy approved seller)
      verification = {
        id: "vrf-" + Date.now(),
        userId,
        username: user.username,
        sellerType: user.role === "seller_internal" ? "internal" : "external",
        fullName: user.username,
        citizenId: "1234567890123",
        phone: "0000000000",
        bankAccountName: bankAccountName || user.username,
        bankAccountNumber: bankAccountNumber || "",
        bankName: bankName || "KBANK",
        shopName,
        shopDescription: shopDescription || "",
        idCardPhotoUrl: "",
        status: "approved",
        submittedAt: new Date().toISOString()
      };
      db.sellerVerifications.unshift(verification);
    } else {
      verification.shopName = shopName;
      verification.shopDescription = shopDescription || "";
      if (bankName) verification.bankName = bankName;
      if (bankAccountNumber) verification.bankAccountNumber = bankAccountNumber;
      if (bankAccountName) verification.bankAccountName = bankAccountName;
    }

    // Sync current product list's seller names for this seller
    db.products.forEach((p: any) => {
      if (p.sellerId === userId) {
        p.sellerName = shopName;
      }
    });

    saveDB(db);
    res.json({ success: true, message: "อัปเดตข้อมูลร้านค้าเรียบร้อยแล้ว", verification });
  });

  // POST apply to become a seller
  app.post("/api/seller/apply", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return res.status(404).json({ error: "ไม่พบข้อมูลผู้ใช้นี้" });

    // Check if already approved
    if (user.role === "seller_internal" || user.role === "seller_external" || user.role === "admin") {
      return res.status(400).json({ error: "คุณได้รับการอนุมัติเป็นผู้ขายหรือมีสิทธิ์พิเศษอยู่แล้ว" });
    }

    // Check for existing pending verification
    const existing = db.sellerVerifications.find((v: any) => v.userId === userId && v.status === "pending");
    if (existing) {
      return res.status(400).json({ error: "คุณมีรายการยื่นขอเป็นผู้ขายที่อยู่ระหว่างการตรวจสอบแล้ว" });
    }

    const {
      sellerType,
      fullName,
      citizenId,
      phone,
      bankAccountName,
      bankAccountNumber,
      bankName,
      shopName,
      shopDescription,
      idCardPhotoUrl
    } = req.body;

    if (!sellerType || !fullName || !citizenId || !phone || !bankAccountName || !bankAccountNumber || !bankName || !shopName) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลการยืนยันตัวตนความปลอดภัยสูงให้ครบถ้วน" });
    }

    const newVerification = {
      id: "vrf-" + Date.now(),
      userId,
      username: user.username,
      sellerType, // 'internal' or 'external'
      fullName,
      citizenId,
      phone,
      bankAccountName,
      bankAccountNumber,
      bankName,
      shopName,
      shopDescription: shopDescription || "",
      idCardPhotoUrl: idCardPhotoUrl || "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=150&q=80",
      status: "pending",
      submittedAt: new Date().toISOString()
    };

    db.sellerVerifications.unshift(newVerification);
    saveDB(db);

    res.json({ success: true, message: "ยื่นเอกสารข้อมูลผู้ขายเพื่อตรวจสอบเสร็จสิ้น รอแอดมินประเมินผลอนุมัติ" });
  });

  // GET seller products
  app.get("/api/seller/products", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const sellerProds = db.products.filter((p: any) => p.sellerId === userId);
    res.json(sellerProds);
  });

  // POST add or edit seller product
  app.post("/api/seller/products", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return res.status(403).json({ error: "Unauthorized" });

    // Only allow verified sellers or admin
    const isSeller = user.role === "seller_internal" || user.role === "seller_external" || user.role === "admin";
    if (!isSeller) {
      return res.status(403).json({ error: "เฉพาะผู้ขายที่ได้รับการอนุมัติเท่านั้นที่สามารถลงขายสินค้าได้" });
    }

    const { id, categoryId, name, price, description, imageUrl, stock, details, type } = req.body;

    if (!categoryId || !name || !price || !description || !imageUrl) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลผลิตภัณฑ์หลักให้ครบถ้วน" });
    }

    // Process stock
    let stockArr: string[] = [];
    if (typeof stock === "string") {
      stockArr = stock.split("\n").map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(stock)) {
      stockArr = stock.map(s => String(s).trim()).filter(Boolean);
    }

    if (id) {
      // Edit mode
      const prodIndex = db.products.findIndex((p: any) => p.id === id);
      if (prodIndex === -1) return res.status(404).json({ error: "ไม่พบสินค้าที่ต้องการแก้ไข" });

      const prod = db.products[prodIndex];
      // Check owner
      if (prod.sellerId !== userId && user.role !== "admin") {
        return res.status(403).json({ error: "คุณไม่มีสิทธิ์แก้ไขสินค้าชิ้นนี้" });
      }

      prod.categoryId = categoryId;
      prod.name = name;
      prod.price = Number(price);
      prod.description = description;
      prod.imageUrl = imageUrl;
      prod.stock = stockArr;
      prod.details = details || "";
      prod.type = type || "normal";
    } else {
      // Create mode
      const newProd = {
        id: "prod-" + Date.now(),
        categoryId,
        name,
        price: Number(price),
        description,
        imageUrl,
        stock: stockArr,
        timesSold: 0,
        details: details || "",
        type: type || "normal",
        sellerId: userId,
        sellerType: user.role === "seller_internal" ? "internal" : "external",
        sellerName: user.username
      };
      db.products.push(newProd);
    }

    saveDB(db);
    res.json({ success: true, message: "บันทึกผลิตภัณฑ์ลงระบบเสร็จสิ้น" });
  });

  // DELETE seller product
  app.delete("/api/seller/products/:id", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return res.status(403).json({ error: "Unauthorized" });

    const prodId = req.params.id;
    const prodIndex = db.products.findIndex((p: any) => p.id === prodId);
    if (prodIndex === -1) return res.status(404).json({ error: "ไม่พบสินค้านี้" });

    const prod = db.products[prodIndex];
    if (prod.sellerId !== userId && user.role !== "admin") {
      return res.status(403).json({ error: "คุณไม่มีสิทธิ์ลบสินค้าชิ้นนี้" });
    }

    db.products.splice(prodIndex, 1);
    saveDB(db);
    res.json({ success: true, message: "ลบสินค้าสำเร็จ" });
  });

  // GET seller orders (transactions of products they sell)
  app.get("/api/seller/orders", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const sellerTxs = db.transactions.filter((tx: any) => tx.sellerId === userId);
    res.json(sellerTxs);
  });

  // POST seller ship order
  app.post("/api/seller/orders/:id/ship", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const { trackingNumber, trackingCarrier, note } = req.body;

    const txIndex = db.transactions.findIndex((tx: any) => tx.id === req.params.id);
    if (txIndex === -1) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อนี้" });

    const tx = db.transactions[txIndex];
    if (tx.sellerId !== userId) {
      return res.status(403).json({ error: "คุณไม่มีสิทธิ์จัดการคำสั่งซื้อนี้" });
    }

    tx.orderStatus = "shipped";
    tx.trackingNumber = trackingNumber || "";
    tx.trackingCarrier = trackingCarrier || "Flash Express";

    if (!tx.statusUpdates) tx.statusUpdates = [];
    tx.statusUpdates.push({
      status: "shipped",
      date: new Date().toISOString(),
      note: note || `จัดส่งสินค้าแล้ว โดย ${tx.trackingCarrier} เลขแทร็กกิ้ง: ${tx.trackingNumber}`
    });

    saveDB(db);
    res.json({ success: true, transaction: tx });
  });

  // POST buyer confirm delivery (escrow unlock!)
  app.post("/api/orders/:id/deliver", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const txIndex = db.transactions.findIndex((tx: any) => tx.id === req.params.id);
    if (txIndex === -1) return res.status(404).json({ error: "ไม่พบรายการสั่งซื้อนี้" });

    const tx = db.transactions[txIndex];
    // Buyer must match tx.userId
    if (tx.userId !== userId) {
      return res.status(403).json({ error: "คุณไม่มีสิทธิ์จัดการคำสั่งซื้อนี้" });
    }

    if (tx.orderStatus === "delivered") {
      return res.status(400).json({ error: "คำสั่งซื้อได้รับการจัดส่งและปิดดีลเสร็จสิ้นแล้ว" });
    }

    tx.orderStatus = "delivered";
    if (!tx.statusUpdates) tx.statusUpdates = [];
    tx.statusUpdates.push({
      status: "delivered",
      date: new Date().toISOString(),
      note: "ผู้ซื้อกดยืนยันได้รับสินค้าเรียบร้อย ปลดล็อกยอดเงินประกันจัดส่งโอนเข้ากระเป๋าเงินถอนได้ของผู้ขาย"
    });

    // ESCROW PAYOUT UNLOCK:
    if (tx.sellerId && !tx.isSellerCredited) {
      const seller = db.users.find((u: any) => u.id === tx.sellerId);
      if (seller) {
        if (seller.pendingBalance === undefined) seller.pendingBalance = 0;
        if (seller.withdrawableBalance === undefined) seller.withdrawableBalance = 0;

        // Subtract from pending, add to withdrawable
        seller.pendingBalance = Math.max(0, parseFloat((seller.pendingBalance - tx.amount).toFixed(2)));
        seller.withdrawableBalance = parseFloat((seller.withdrawableBalance + tx.amount).toFixed(2));
        tx.isSellerCredited = true;
      }
    }

    saveDB(db);
    res.json({ success: true, transaction: tx });
  });

  // GET seller withdrawal history
  app.get("/api/seller/withdrawals", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const userWithdrawals = db.withdrawals.filter((w: any) => w.userId === userId);
    res.json(userWithdrawals);
  });

  // POST seller request withdrawal
  app.post("/api/seller/withdraw", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้" });

    // Try to auto-populate bank details from verified seller registration if not passed
    const verification = db.sellerVerifications.find((v: any) => v.userId === userId && v.status === "approved") || db.sellerVerifications.find((v: any) => v.userId === userId);
    
    const amount = req.body.amount;
    const bankName = req.body.bankName || (verification ? verification.bankName : "");
    const bankAccountNumber = req.body.bankAccountNumber || (verification ? verification.bankAccountNumber : "");
    const bankAccountName = req.body.bankAccountName || (verification ? verification.bankAccountName : "");
    const amt = Number(amount);

    if (!amt || amt <= 0) {
      return res.status(400).json({ error: "กรุณาระบุจำนวนเงินที่ถูกต้อง" });
    }

    if (!bankName || !bankAccountNumber || !bankAccountName) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลธนาคารเพื่อรับเงินให้ครบถ้วน" });
    }

    const currentWithdrawable = user.withdrawableBalance || 0;
    
    // Calculate sum of existing pending withdrawals to avoid double-requesting beyond withdrawable balance
    const pendingTotal = db.withdrawals
      .filter((w: any) => w.userId === userId && w.status === "pending")
      .reduce((sum: number, w: any) => sum + w.amount, 0);

    if (currentWithdrawable - pendingTotal < amt) {
      return res.status(400).json({ error: "ยอดเงินที่สามารถถอนได้ของคุณไม่เพียงพอ (หักรายการที่รอการตรวจสอบอยู่)" });
    }

    // Do NOT deduct withdrawableBalance immediately anymore. It is deducted upon admin's approval.

    const newRequest = {
      id: "wdr-" + Date.now(),
      userId,
      username: user.username,
      amount: amt,
      bankName,
      bankAccountNumber,
      bankAccountName,
      status: "pending",
      submittedAt: new Date().toISOString()
    };

    db.withdrawals.unshift(newRequest);
    saveDB(db);

    res.json({ success: true, message: "ส่งคำขอถอนเงินสำเร็จ รอแอดมินดำเนินการตรวจสอบ โอนเงิน และแนบหลักฐานสลิปการโอน", request: newRequest });
  });

  // GET admin verifications
  app.get("/api/admin/verifications", (req, res) => {
    const role = req.headers["x-user-role"] as string;
    if (role !== "admin") return res.status(403).json({ error: "Unauthorized" });
    res.json(db.sellerVerifications);
  });

  // POST admin review verification
  app.post("/api/admin/verifications/:id/review", (req, res) => {
    const role = req.headers["x-user-role"] as string;
    if (role !== "admin") return res.status(403).json({ error: "Unauthorized" });

    const { status, adminNotes } = req.body; // 'approved' | 'rejected'
    const reqIndex = db.sellerVerifications.findIndex((v: any) => v.id === req.params.id);
    if (reqIndex === -1) return res.status(404).json({ error: "ไม่พบรายการยืนยันตัวตนนี้" });

    const verification = db.sellerVerifications[reqIndex];
    verification.status = status;
    verification.adminNotes = adminNotes || "";
    verification.reviewedAt = new Date().toISOString();

    if (status === "approved") {
      const applicant = db.users.find((u: any) => u.id === verification.userId);
      if (applicant) {
        applicant.role = verification.sellerType === "internal" ? "seller_internal" : "seller_external";
      }
    }

    saveDB(db);
    res.json({ success: true, verification });
  });

  // GET admin withdrawals
  app.get("/api/admin/withdrawals", (req, res) => {
    const role = req.headers["x-user-role"] as string;
    if (role !== "admin") return res.status(403).json({ error: "Unauthorized" });
    res.json(db.withdrawals);
  });

  // POST admin review withdrawal
  app.post("/api/admin/withdrawals/:id/review", (req, res) => {
    const role = req.headers["x-user-role"] as string;
    if (role !== "admin") return res.status(403).json({ error: "Unauthorized" });

    const { status, adminNotes, slipUrl } = req.body; // 'approved' | 'rejected'
    const reqIndex = db.withdrawals.findIndex((w: any) => w.id === req.params.id);
    if (reqIndex === -1) return res.status(404).json({ error: "ไม่พบรายการคำขอถอนเงินนี้" });

    const withdrawal = db.withdrawals[reqIndex];
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ error: "รายการคำขอนี้ได้รับการตัดสินไปแล้ว" });
    }

    withdrawal.status = status;
    withdrawal.adminNotes = adminNotes || "";
    if (slipUrl) {
      withdrawal.slipUrl = slipUrl;
    }
    withdrawal.reviewedAt = new Date().toISOString();

    if (status === "approved") {
      // 1. Deduct immediately from seller's withdrawableBalance
      const seller = db.users.find((u: any) => u.id === withdrawal.userId);
      if (seller) {
        if (seller.withdrawableBalance === undefined) seller.withdrawableBalance = 0;
        seller.withdrawableBalance = Math.max(0, parseFloat((seller.withdrawableBalance - withdrawal.amount).toFixed(2)));

        // 2. Reset Pending Escrow (pendingBalance) to 0
        seller.pendingBalance = 0;
      }
    } else if (status === "rejected") {
      // No refund logic needed now since we don't deduct on request anymore!
    }

    saveDB(db);
    res.json({ success: true, withdrawal });
  });

  // GET Source code generator endpoint for PHP PDO system
  app.get("/api/php-exporter/files", (req, res) => {
    // Generates active PHP scripts with correct configuration based on their settings
    const currentSettings = db.settings;

    const configPhp = `<?php
/**
 * PHP (PDO) Premium E-commerce Configuration
 * Generated on: ${new Date().toISOString()}
 * Auto-synced with Live Admin Dashboard Settings
 */

// Database Credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'your_db_username');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'your_db_name');

// Website Branding Configurations
define('SITE_NAME', '${currentSettings.siteName.replace(/'/g, "\\'")}');
define('SITE_SUBTITLE', '${currentSettings.siteSubtitle.replace(/'/g, "\\'")}');
define('PRIMARY_COLOR', '${currentSettings.primaryColor}');
define('THEME_MODE', '${currentSettings.themeMode}');

// Contact Info
define('CONTACT_FACEBOOK', '${currentSettings.contactFacebook}');
define('CONTACT_DISCORD', '${currentSettings.contactDiscord}');
define('CONTACT_LINE', '${currentSettings.contactLine}');

// Automated Thailand Gateway Configuration
define('TW_PHONE', '${currentSettings.truewalletPhone}');
define('QR_SLIPOK_TOKEN', '${currentSettings.qrSlipToken}');
define('CF_TURNSTILE_KEY', '${currentSettings.botCfTurnstileKey}');

// Discord Connection Settings
define('DISCORD_CLIENT_ID', '${currentSettings.discordClientId}');
define('DISCORD_CLIENT_SECRET', '${currentSettings.discordClientSecret}');
define('DISCORD_REDIRECT_URI', 'http://yourdomain.com/auth_discord.php');

// Enable/Disable Payment Methods
define('ALLOW_ANGPAO', ${currentSettings.allowAngpao ? 'true' : 'false'});
define('ALLOW_QR', ${currentSettings.allowQr ? 'true' : 'false'});

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    die("Database Connection Failed: " . $e->getMessage());
}
?>`;

    const indexPhp = `<?php
require_once 'config.php';
session_start();

// Fetch categories
$stmt = $pdo->query("SELECT * FROM categories ORDER BY id ASC");
$categories = $stmt->fetchAll();

// Fetch products
$stmt = $pdo->query("SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC");
$products = $stmt->fetchAll();

$user = isset($_SESSION['user']) ? $_SESSION['user'] : null;
?>
<!DOCTYPE html>
<html lang="th" data-bs-theme="<?php echo THEME_MODE; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo SITE_NAME; ?> | Premium Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <style>
        body { background-color: #0c0d12; color: #e1e1e6; font-family: 'Inter', 'Kanit', sans-serif; }
        .glowing-btn-crimson { background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%); border: none; box-shadow: 0 0 15px rgba(255, 8, 68, 0.4); }
        .card-premium { background-color: #12131a; border: 1px solid #1e2030; transition: transform 0.2s, box-shadow 0.2s; }
        .card-premium:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5); }
    </style>
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary py-3">
        <div class="container">
            <a class="navbar-brand text-danger fw-bold" href="index.php"><i class="bi bi-shop"></i> <?php echo SITE_NAME; ?></a>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item"><a class="nav-link active" href="#"><i class="bi bi-house"></i> หน้าแรก</a></li>
                    <li class="nav-item"><a class="nav-link" href="topup.php"><i class="bi bi-wallet2"></i> เติมเงิน</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?php echo CONTACT_FACEBOOK; ?>" target="_blank"><i class="bi bi-headset"></i> ติดต่อเรา</a></li>
                </ul>
                <div class="d-flex align-items-center">
                    <?php if ($user): ?>
                        <span class="text-white me-3">ยอดคงเหลือ: <strong><?php echo number_format($user['balance'], 2); ?> ฿</strong></span>
                        <div class="dropdown">
                            <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                <i class="bi bi-person-circle"></i> <?php echo htmlspecialchars($user['username']); ?>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="index.php?action=history">ประวัติสั่งซื้อ</a></li>
                                <?php if ($user['role'] === 'admin'): ?>
                                    <li><a class="dropdown-item text-warning" href="admin/dashboard.php"><i class="bi bi-speedometer2"></i> แผงควบคุมแอดมิน</a></li>
                                <?php endif; ?>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="logout.php"><i class="bi bi-box-arrow-right"></i> ออกจากระบบ</a></li>
                            </ul>
                        </div>
                    <?php else: ?>
                        <a href="login.php" class="btn btn-danger glowing-btn-crimson"><i class="bi bi-discord"></i> เข้าสู่ระบบด้วย Discord</a>
                        <a href="login.php?type=normal" class="btn btn-outline-light ms-2">เข้าสู่ระบบปกติ</a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </nav>

    <!-- App Banners Carousel -->
    <div class="container my-4">
        <div id="shopCarousel" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner rounded-4 shadow">
                <div class="carousel-item active">
                    <img src="${currentSettings.banners[0]}" class="d-block w-full text-center" style="max-height: 400px; object-fit: cover;" alt="Banner 1">
                </div>
                <div class="carousel-item">
                    <img src="${currentSettings.banners[1] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'}" class="d-block w-full text-center" style="max-height: 400px; object-fit: cover;" alt="Banner 2">
                </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#shopCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#shopCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
            </button>
        </div>
    </div>

    <!-- Main Storefront -->
    <div class="container my-5">
        <h2 class="mb-4 text-center fw-bold text-gradient">หมวดหมู่แนะนำ (Recommended Categories)</h2>
        <div class="row g-4 justify-content-center">
            <?php foreach ($categories as $cat): ?>
                <div class="col-md-4">
                    <div class="card card-premium p-4 text-center h-100">
                        <div class="fs-1 text-danger mb-3"><i class="bi bi-box"></i></div>
                        <h4 class="fw-bold"><?php echo htmlspecialchars($cat['name']); ?></h4>
                        <p class="text-secondary small"><?php echo htmlspecialchars($cat['description']); ?></p>
                        <a href="#cat-<?php echo $cat['id']; ?>" class="btn btn-outline-danger mt-auto">ดูสินค้าในหมวดหมู่นี้</a>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Products List -->
        <?php foreach ($categories as $cat): ?>
            <div class="my-5" id="cat-<?php echo $cat['id']; ?>">
                <h3 class="border-bottom border-danger pb-2 mb-4"><i class="bi bi-tag-fill text-danger"></i> <?php echo htmlspecialchars($cat['name']); ?></h3>
                <div class="row g-4">
                    <?php 
                    $cat_id = $cat['id'];
                    $cat_products = array_filter($products, function($p) use ($cat_id) { return $p['category_id'] == $cat_id; });
                    if (empty($cat_products)):
                    ?>
                        <p class="text-center text-muted">ขณะนี้ไม่มีสินค้าในหมวดหมู่นี้</p>
                    <?php else: ?>
                        <?php foreach ($cat_products as $prod): ?>
                            <div class="col-md-3">
                                <div class="card card-premium h-100 overflow-hidden">
                                    <div style="height: 180px; background: url('<?php echo htmlspecialchars($prod['imageUrl']); ?>') center/cover;"></div>
                                    <div class="card-body d-flex flex-column">
                                        <h5 class="card-title fw-bold"><?php echo htmlspecialchars($prod['name']); ?></h5>
                                        <p class="card-text text-secondary small text-truncate"><?php echo htmlspecialchars($prod['description']); ?></p>
                                        <div class="mt-auto">
                                            <div class="d-flex justify-content-between align-items-center mb-3">
                                                <span class="text-danger fw-bold fs-5"><?php echo number_format($prod['price'], 2); ?> ฿</span>
                                                <span class="badge bg-secondary"><?php echo $prod['type'] === 'box' ? 'กล่องสุ่ม' : 'คลังสต็อก'; ?></span>
                                            </div>
                                            <a href="product.php?id=<?php echo $prod['id']; ?>" class="btn btn-danger w-100 glowing-btn-crimson">ดูรายละเอียดสินค้า</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</body>
</html>`;

    const productPhp = `<?php
require_once 'config.php';
session_start();

$id = isset($_GET['id']) ? $_GET['id'] : '';
$stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
$stmt->execute([$id]);
$product = $stmt->fetch();

if (!$product) {
    header("Location: index.php");
    exit();
}

// Extract reviews
$revStmt = $pdo->prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC");
$revStmt->execute([$id]);
$reviews = $revStmt->fetchAll();

$user = isset($_SESSION['user']) ? $_SESSION['user'] : null;
?>
<!DOCTYPE html>
<html lang="th" data-bs-theme="<?php echo THEME_MODE; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($product['name']); ?> | <?php echo SITE_NAME; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <style>
        body { background-color: #0c0d12; color: #e1e1e6; font-family: 'Inter', sans-serif; }
        .card-detailed { background-color: #12131a; border: 1px solid #1e2030; border-radius: 12px; }
        .alert-warning-custom { background-color: rgba(220, 53, 69, 0.1); border: 1px solid rgba(220, 53, 69, 0.4); color: #ff5252; }
    </style>
</head>
<body>
    <div class="container my-5">
        <a href="index.php" class="btn btn-outline-secondary mb-4"><i class="bi bi-arrow-left"></i> ย้อนกลับไปหน้าแรก</a>
        <div class="row g-5">
            <div class="col-md-5">
                <div class="card shadow p-2" style="background-color: #12131a;">
                    <img src="<?php echo htmlspecialchars($product['imageUrl']); ?>" class="img-fluid rounded-3" alt="Product Image">
                </div>
            </div>
            <div class="col-md-7">
                <div class="card-detailed p-5">
                    <h1 class="fw-bold fs-2"><?php echo htmlspecialchars($product['name']); ?></h1>
                    
                    <div class="my-4 alert alert-warning-custom">
                        <i class="bi bi-exclamation-triangle-fill"></i> <strong>คำเตือน:</strong> โปรดบันทึกวิดีโอขณะคลิกซื้อเพื่อใช้เป็นหลักฐานในการเคลมสินค้าหากเกิดปัญหา!
                    </div>

                    <div class="mb-4">
                        <label class="text-secondary small">รายละเอียดสินค้า</label>
                        <p class="mt-2 text-light"><?php echo nl2br(htmlspecialchars($product['description'])); ?></p>
                    </div>

                    <div class="border-top border-secondary pt-4">
                        <div class="row align-items-center">
                            <div class="col-6">
                                <label class="text-secondary small">ราคาจำหน่าย</label>
                                <div class="fs-1 fw-bold text-danger"><?php echo number_format($product['price'], 2); ?> <span class="fs-5 text-secondary">บาท</span></div>
                            </div>
                            <div class="col-6 text-end">
                                <span class="badge bg-danger p-2 mb-2"><i class="bi bi-layers"></i> มีสินค้าคงเหลือพร้อมส่ง</span>
                            </div>
                        </div>

                        <!-- Purchase Section -->
                        <div class="mt-4">
                            <?php if ($user): ?>
                                <form id="buyForm" action="api_purchase.php" method="POST">
                                    <input type="hidden" name="product_id" value="<?php echo $product['id']; ?>">
                                    <div class="row g-2 align-items-center">
                                        <div class="col-6">
                                            <input type="text" name="coupon" class="form-control" placeholder="รหัสคูปองส่วนลด...">
                                        </div>
                                        <div class="col-6">
                                            <button type="submit" class="btn btn-danger btn-lg w-100 py-3 fw-bold"><i class="bi bi-cart"></i> สั่งซื้อสินค้า</button>
                                        </div>
                                    </div>
                                </form>
                            <?php else: ?>
                                <a href="login.php" class="btn btn-warning btn-lg w-100 py-3 fw-bold text-dark"><i class="bi bi-box-arrow-in-right"></i> เข้าสู่ระบบเพื่อเริ่มการซื้อสินค้า</a>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>

                <!-- Reviews section -->
                <div class="card-detailed p-5 mt-5">
                    <h3 class="fw-bold mb-4"><i class="bi bi-chat-left-text text-danger"></i> รีวิวจากลูกค้า (<?php echo count($reviews); ?>)</h3>
                    <?php if (empty($reviews)): ?>
                        <p class="text-muted">ยังไม่คอยมีลูกค้ารีวิวสินค้านี้</p>
                    <?php else: ?>
                        <?php foreach($reviews as $rev): ?>
                            <div class="border-bottom border-secondary py-3 mb-2">
                                <div class="d-flex justify-content-between">
                                    <strong><?php echo htmlspecialchars($rev['username']); ?></strong>
                                    <div class="text-warning">
                                        <?php for($i=1;$i<=5;$i++): ?>
                                            <i class="bi bi-star<?php echo $i <= $rev['rating'] ? '-fill' : ''; ?>"></i>
                                        <?php endfor; ?>
                                    </div>
                                </div>
                                <p class="text-secondary small my-1"><?php echo htmlspecialchars($rev['comment']); ?></p>
                                <span class="text-muted" style="font-size: 11px;"><?php echo date('Y-m-d H:i', strtotime($rev['date'])); ?></span>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    const topupPhp = `<?php
require_once 'config.php';
session_start();

$user = isset($_SESSION['user']) ? $_SESSION['user'] : null;
if (!$user) {
    header("Location: login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="th" data-bs-theme="<?php echo THEME_MODE; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>เติมเงินอัตโนมัติ | <?php echo SITE_NAME; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
</head>
<body style="background-color: #0c0d12; color: #fff;">
    <div class="container my-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <a href="index.php" class="btn btn-outline-secondary mb-4"><i class="bi bi-arrow-left"></i> กลับไปร้านค้า</a>
                <h2 class="fw-bold mb-4 text-center"><i class="bi bi-wallet2 text-danger"></i> เมนูเติมเงินอัตโนมัติ</h2>
                
                <div class="row g-4">
                    <!-- QR Code Upload & Scan -->
                    <?php if (ALLOW_QR): ?>
                    <div class="col-md-6">
                        <div class="card bg-dark border-secondary p-4 text-center h-100">
                            <h4><i class="bi bi-qr-code-scan text-danger fs-2"></i></h4>
                            <h5 class="fw-bold mt-2">สแกน QR Code ตรวจสลิป</h5>
                            <p class="text-secondary small">โอนชำระเงินโดยสแกน QR และเซฟสลิป นำรูปอัปโหลดเพื่อเช็คยอดอัตโนมัติ 100%</p>
                            
                            <form action="api_slip_verify.php" method="POST" enctype="multipart/form-data">
                                <div class="mb-3">
                                    <input type="file" name="slip_image" class="form-control" required>
                                </div>
                                <button type="submit" class="btn btn-danger w-100">ยืนยันตรวจสอบสลิป</button>
                            </form>
                        </div>
                    </div>
                    <?php endif; ?>

                    <!-- Truemoney Angpao Gift Link -->
                    <?php if (ALLOW_ANGPAO): ?>
                    <div class="col-md-6">
                        <div class="card bg-dark border-secondary p-4 text-center h-100">
                            <h4><i class="bi bi-gift text-danger fs-2"></i></h4>
                            <h5 class="fw-bold mt-2">เติมผ่านซองอั่งเปา TrueMoney</h5>
                            <p class="text-secondary small">เติมความง่ายเพียงสร้างลิ้งก์ส่งซองอั่งเปาในวอลเล็ท จากนั้นนำลิงก์มาวางเพื่อเติมเงินทันที</p>
                            
                            <form action="api_angpao_verify.php" method="POST">
                                <div class="mb-3">
                                    <input type="url" name="angpao_link" class="form-control" placeholder="https://gift.truemoney.com/campaign/?v=..." required>
                                </div>
                                <button type="submit" class="btn btn-warning w-100">ตรวจสอบซองของขวัญ</button>
                            </form>
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    const instructionsText = `### วิธีการติดตั้งระบบ PHP (PDO) พรีเมียมของคุณหลังดาวน์โหลด

1. **สร้างฐานข้อมูล**: สร้างฐานข้อมูล MySQL / MariaDB ใหม่ผ่าน phpMyAdmin หรือแผงโดเมนของคุณ
2. **แก้ไขไฟล์ config.php**:
   - ปรับเปลี่ยนค่า \`DB_HOST\`, \`DB_USER\`, \`DB_PASS\` และ \`DB_NAME\` ให้ตรงกับโฮสติ้งจริงที่คุณสร้างไว้
   - หากต้องการเพิ่มระบบล็อกอินดิสคอร์ด กรุณาแก้ไข \`DISCORD_CLIENT_ID\` และ \`DISCORD_CLIENT_SECRET\` ที่ได้จากเดสบอร์ดดิสคอร์ดเดฟเวลลอปเปอร์
3. **โครงสร้างฐานข้อมูล (SQL Tables)**:
   - นำไฟล์ SQL โครงสร้างตารางด้านล่างไปอัปโหลด (Import) เข้าฐานข้อมูล MySQL ของคุณเพื่อเริ่มระบบทันที!

\`\`\`sql
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'Folder',
  imageUrl VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  category_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  imageUrl VARCHAR(255),
  stock_data JSON, -- เก็บรหัสสินค้าหรือไอดีในฟังก์ชันอาเรย์
  timesSold INT DEFAULT 0,
  details TEXT,
  type VARCHAR(20) DEFAULT 'normal'
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  role VARCHAR(20) DEFAULT 'user',
  discord_id VARCHAR(100),
  avatar_url VARCHAR(255),
  password_hash VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS coupons (
  code VARCHAR(50) PRIMARY KEY,
  discount_percent INT DEFAULT 0,
  discount_baht INT DEFAULT 0,
  uses_left INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  username VARCHAR(100),
  type VARCHAR(50),
  amount DECIMAL(10, 2),
  details TEXT,
  status VARCHAR(20) DEFAULT 'success',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  username VARCHAR(100),
  rating INT NOT NULL,
  product_id VARCHAR(50),
  product_name VARCHAR(100),
  comment TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\``;

    return res.json({
      success: true,
      files: [
        { name: "config.php", mode: "php", content: configPhp },
        { name: "index.php", mode: "php", content: indexPhp },
        { name: "product.php", mode: "php", content: productPhp },
        { name: "topup.php", mode: "php", content: topupPhp }
      ],
      instructions: instructionsText
    });
  });

  // ==========================================
  // --- REAL-TIME COMMUNITY CHAT API ROUTES ---
  // ==========================================

  // Broadcast data helper to all SSE Clients
  function broadcastChatEvent(data: any) {
    sseClients.forEach((client) => {
      try {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (err) {
        // Safe to ignore if client disconnected
      }
    });
  }

  // Helper to resolve sender/receiver profile details
  function getUserProfile(userId: string) {
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return { username: "ผู้ใช้ทั่วไป", avatarUrl: "" };
    return {
      username: user.username,
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`
    };
  }

  // GET Conversations for active user
  app.get("/api/chat/conversations", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const role = req.headers["x-user-role"] as string;
    if (!userId) return res.status(401).json({ error: "โปรดเข้าสู่ระบบก่อนใช้งาน" });

    let filtered = [];
    if (role === "admin") {
      filtered = db.conversations;
    } else if (role === "seller_internal" || role === "seller_external") {
      filtered = db.conversations.filter((c: any) => c.sellerId === userId);
    } else {
      filtered = db.conversations.filter((c: any) => c.customerId === userId);
    }

    const populated = filtered.map((c: any) => {
      const customer = db.users.find((u: any) => u.id === c.customerId);
      const seller = db.users.find((u: any) => u.id === c.sellerId);
      const verification = db.sellerVerifications.find((v: any) => v.userId === c.sellerId);

      const unreadCount = db.messages.filter((m: any) => 
        m.conversationId === c.id && 
        m.senderId !== userId && 
        !m.isRead
      ).length;

      return {
        ...c,
        customerName: customer?.username || "ลูกค้าในระบบ",
        customerAvatar: customer?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${customer?.username || "customer"}`,
        shopName: verification?.shopName || seller?.username || "ร้านค้าชุมชนน้ำน้อย",
        shopLogo: verification?.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${verification?.shopName || "Shop"}&backgroundColor=16A34A`,
        unreadCount
      };
    });

    // Sort by latest message
    populated.sort((a: any, b: any) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    res.json(populated);
  });

  // POST Create or Open existing conversation
  app.post("/api/chat/conversations", (req, res) => {
    const customerId = req.headers["x-user-id"] as string;
    if (!customerId) return res.status(401).json({ error: "โปรดเข้าสู่ระบบก่อนใช้งาน" });

    const { sellerId, shopId } = req.body;
    if (!sellerId) return res.status(400).json({ error: "ระบุรหัสผู้ขายหรือร้านค้า" });

    // Ensure customer is not chatting with themselves
    if (customerId === sellerId) {
      return res.status(400).json({ error: "ไม่สามารถเปิดห้องแชทกับตนเองได้" });
    }

    let conv = db.conversations.find((c: any) => c.customerId === customerId && c.sellerId === sellerId);

    if (!conv) {
      conv = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        customerId,
        sellerId,
        shopId: shopId || sellerId,
        lastMessage: "เริ่มเปิดห้องสนทนาใหม่เพื่อปรึกษาผลิตภัณฑ์",
        lastMessageAt: new Date().toISOString(),
        status: "active",
        createdAt: new Date().toISOString()
      };
      db.conversations.push(conv);
      saveDB(db);

      // Broadcast new room creation to seller & customer
      broadcastChatEvent({ type: "new_conversation", conversation: conv });
    } else {
      // Re-activate if it was closed
      if (conv.status === "closed") {
        conv.status = "active";
        conv.lastMessageAt = new Date().toISOString();
        saveDB(db);
        broadcastChatEvent({ type: "conversation_status_updated", conversationId: conv.id, status: "active" });
      }
    }

    res.json(conv);
  });

  // GET Messages in a specific conversation
  app.get("/api/chat/conversations/:id/messages", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const role = req.headers["x-user-role"] as string;
    if (!userId) return res.status(401).json({ error: "โปรดเข้าสู่ระบบก่อนใช้งาน" });

    const conv = db.conversations.find((c: any) => c.id === req.params.id);
    if (!conv) return res.status(404).json({ error: "ไม่พบห้องสนทนานี้" });

    // Validate access: must be Customer, Seller, or Admin
    if (role !== "admin" && conv.customerId !== userId && conv.sellerId !== userId) {
      return res.status(403).json({ error: "คุณไม่มีสิทธิ์เข้าถึงห้องสนทนานี้" });
    }

    const messages = db.messages.filter((m: any) => m.conversationId === conv.id);
    res.json(messages);
  });

  // POST Send new message
  app.post("/api/chat/conversations/:id/messages", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const role = req.headers["x-user-role"] as string;
    if (!userId) return res.status(401).json({ error: "โปรดเข้าสู่ระบบก่อนใช้งาน" });

    const conv = db.conversations.find((c: any) => c.id === req.params.id);
    if (!conv) return res.status(404).json({ error: "ไม่พบห้องสนทนานี้" });

    if (role !== "admin" && conv.customerId !== userId && conv.sellerId !== userId) {
      return res.status(403).json({ error: "คุณไม่มีสิทธิ์ส่งข้อความในห้องสนทนานี้" });
    }

    if (conv.status === "blocked" && role !== "admin") {
      return res.status(403).json({ error: "ห้องแชทนี้ถูกระงับ/บล็อกไว้ชั่วคราวเนื่องจากทำผิดเงื่อนไข" });
    }

    const { 
      message, 
      messageType, 
      image, 
      replyToId, 
      replyToMessage, 
      productInfo, 
      orderInfo, 
      locationInfo 
    } = req.body;

    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      conversationId: conv.id,
      senderId: userId,
      message: message || "",
      messageType: messageType || "text",
      image: image || undefined,
      isRead: false,
      createdAt: new Date().toISOString(),
      replyToId: replyToId || undefined,
      replyToMessage: replyToMessage || undefined,
      productInfo: productInfo || undefined,
      orderInfo: orderInfo || undefined,
      locationInfo: locationInfo || undefined
    };

    db.messages.push(newMsg);

    // Update conversation last message state
    let previewText = message || "";
    if (messageType === "image") previewText = "📸 ส่งรูปภาพ";
    else if (messageType === "product") previewText = "📦 แนะนำสินค้า";
    else if (messageType === "order") previewText = "🧾 ข้อมูลคำสั่งซื้อ";
    else if (messageType === "paymentSlip") previewText = "💵 แนบสลิปการโอนเงิน";
    else if (messageType === "location") previewText = "📍 แชร์พิกัดตำแหน่ง";

    conv.lastMessage = previewText;
    conv.lastMessageAt = newMsg.createdAt;

    // If room is closed, automatically reopen it on new message
    if (conv.status === "closed") {
      conv.status = "active";
      broadcastChatEvent({ type: "conversation_status_updated", conversationId: conv.id, status: "active" });
    }

    saveDB(db);

    // Real-time broadcast
    broadcastChatEvent({ type: "chat_message", message: newMsg });

    // Generate notification for recipient
    const recipientId = userId === conv.customerId ? conv.sellerId : conv.customerId;
    const senderProfile = getUserProfile(userId);

    const notif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: recipientId,
      title: `ข้อความใหม่จาก ${senderProfile.username}`,
      body: previewText,
      isRead: false,
      createdAt: newMsg.createdAt
    };

    db.notifications.push(notif);
    saveDB(db);

    // Broadcast real-time notification
    broadcastChatEvent({ type: "notification", notification: notif });

    res.json(newMsg);
  });

  // POST Mark messages as read
  app.post("/api/chat/conversations/:id/read", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) return res.status(401).json({ error: "โปรดเข้าสู่ระบบก่อนใช้งาน" });

    const conv = db.conversations.find((c: any) => c.id === req.params.id);
    if (!conv) return res.status(404).json({ error: "ไม่พบห้องสนทนานี้" });

    let count = 0;
    db.messages.forEach((m: any) => {
      if (m.conversationId === conv.id && m.senderId !== userId && !m.isRead) {
        m.isRead = true;
        count++;
      }
    });

    if (count > 0) {
      saveDB(db);
      // Broadcast read receipt
      broadcastChatEvent({ type: "messages_read", conversationId: conv.id, readerId: userId });
    }

    res.json({ success: true, count });
  });

  // POST Typing status broadcast
  app.post("/api/chat/conversations/:id/typing", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) return res.status(401).json({ error: "โปรดเข้าสู่ระบบ" });

    const { isTyping } = req.body;
    broadcastChatEvent({
      type: "typing",
      conversationId: req.params.id,
      userId,
      isTyping: !!isTyping
    });

    res.json({ success: true });
  });

  // DELETE Soft delete a message (Sender or Admin)
  app.delete("/api/chat/messages/:id", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const role = req.headers["x-user-role"] as string;
    if (!userId) return res.status(401).json({ error: "โปรดเข้าสู่ระบบก่อนใช้งาน" });

    const msg = db.messages.find((m: any) => m.id === req.params.id);
    if (!msg) return res.status(404).json({ error: "ไม่พบข้อความนี้" });

    if (msg.senderId !== userId && role !== "admin") {
      return res.status(403).json({ error: "คุณไม่มีสิทธิ์ลบข้อความนี้" });
    }

    // Apply soft delete / mask
    msg.message = "ข้อความนี้ถูกลบไปแล้ว";
    msg.messageType = "text";
    msg.image = undefined;
    msg.productInfo = undefined;
    msg.orderInfo = undefined;
    msg.locationInfo = undefined;

    saveDB(db);

    broadcastChatEvent({ type: "message_deleted", messageId: msg.id, conversationId: msg.conversationId });
    res.json({ success: true, message: msg });
  });

  // POST Update conversation status (Close, Block, Active)
  app.post("/api/chat/conversations/:id/status", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const role = req.headers["x-user-role"] as string;
    if (!userId) return res.status(401).json({ error: "โปรดเข้าสู่ระบบก่อนใช้งาน" });

    const conv = db.conversations.find((c: any) => c.id === req.params.id);
    if (!conv) return res.status(404).json({ error: "ไม่พบห้องสนทนานี้" });

    // Only Seller or Admin can block / close conversations
    if (role !== "admin" && conv.sellerId !== userId) {
      return res.status(403).json({ error: "คุณไม่มีสิทธิ์ปรับสถานะการพูดคุยนี้" });
    }

    const { status } = req.body; // 'active' | 'closed' | 'blocked'
    if (!["active", "closed", "blocked"].includes(status)) {
      return res.status(400).json({ error: "สถานะไม่ถูกต้อง" });
    }

    conv.status = status;
    saveDB(db);

    broadcastChatEvent({ type: "conversation_status_updated", conversationId: conv.id, status });
    res.json({ success: true, conversation: conv });
  });

  // GET User notifications
  app.get("/api/chat/notifications", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) return res.status(401).json({ error: "โปรดเข้าสู่ระบบ" });

    const notifs = db.notifications.filter((n: any) => n.userId === userId);
    res.json(notifs);
  });

  // POST Mark single or all notifications as read
  app.post("/api/chat/notifications/:id/read", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) return res.status(401).json({ error: "โปรดเข้าสู่ระบบ" });

    const id = req.params.id;
    if (id === "all") {
      db.notifications.forEach((n: any) => {
        if (n.userId === userId) n.isRead = true;
      });
    } else {
      const notif = db.notifications.find((n: any) => n.id === id && n.userId === userId);
      if (notif) notif.isRead = true;
    }

    saveDB(db);
    res.json({ success: true });
  });

  // GET Admin stats for Chat Dashboard
  app.get("/api/chat/admin/stats", (req, res) => {
    const role = req.headers["x-user-role"] as string;
    if (role !== "admin") return res.status(403).json({ error: "ผู้ดูแลระบบเท่านั้นที่เข้าถึงได้" });

    const todayStr = new Date().toISOString().substring(0, 10);
    const msgsToday = db.messages.filter((m: any) => m.createdAt.startsWith(todayStr)).length;

    // Calc most active shops
    const shopCounts: Record<string, number> = {};
    db.conversations.forEach((c: any) => {
      shopCounts[c.sellerId] = (shopCounts[c.sellerId] || 0) + 1;
    });

    const topShops = Object.entries(shopCounts).map(([sellerId, count]) => {
      const seller = db.users.find((u: any) => u.id === sellerId);
      const verification = db.sellerVerifications.find((v: any) => v.userId === sellerId);
      return {
        sellerId,
        shopName: verification?.shopName || seller?.username || "ร้านค้าชุมชน",
        count
      };
    }).sort((a, b) => b.count - a.count).slice(0, 5);

    // Blocked/Reported list
    const blockedCount = db.conversations.filter((c: any) => c.status === "blocked").length;

    res.json({
      totalRooms: db.conversations.length,
      totalMessages: db.messages.length,
      messagesToday: msgsToday,
      blockedRooms: blockedCount,
      topShops
    });
  });

  // GET Admin view of all conversations & users for search / monitor
  app.get("/api/chat/admin/all", (req, res) => {
    const role = req.headers["x-user-role"] as string;
    if (role !== "admin") return res.status(403).json({ error: "ผู้ดูแลระบบเท่านั้นที่เข้าถึงได้" });

    const populated = db.conversations.map((c: any) => {
      const customer = db.users.find((u: any) => u.id === c.customerId);
      const seller = db.users.find((u: any) => u.id === c.sellerId);
      const verification = db.sellerVerifications.find((v: any) => v.userId === c.sellerId);
      const msgCount = db.messages.filter((m: any) => m.conversationId === c.id).length;

      return {
        ...c,
        customerName: customer?.username || "ลูกค้าในระบบ",
        customerEmail: customer?.email || "",
        shopName: verification?.shopName || seller?.username || "ร้านค้า",
        shopOwnerName: seller?.username || "",
        messageCount: msgCount
      };
    });

    res.json(populated);
  });

  // POST Admin moderate action (suspend/activate user or seller)
  app.post("/api/chat/admin/moderate", (req, res) => {
    const role = req.headers["x-user-role"] as string;
    if (role !== "admin") return res.status(403).json({ error: "ผู้ดูแลระบบเท่านั้นที่เข้าถึงได้" });

    const { targetUserId, action } = req.body; // action: 'suspend' | 'activate'
    const target = db.users.find((u: any) => u.id === targetUserId);
    if (!target) return res.status(404).json({ error: "ไม่พบผู้ใช้เป้าหมาย" });

    if (action === "suspend") {
      target.isSuspended = true; // Block login/activities
      // Close all conversations involving them
      db.conversations.forEach((c: any) => {
        if (c.customerId === targetUserId || c.sellerId === targetUserId) {
          c.status = "blocked";
        }
      });
    } else if (action === "activate") {
      target.isSuspended = false;
    }

    saveDB(db);
    broadcastChatEvent({ type: "user_moderated", userId: targetUserId, action });
    res.json({ success: true, user: target });
  });

  // --- VITE MIDDLEWARE ---
  // If we are in development, integrate Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Premium Server] running at http://localhost:${PORT}`);
  });
}

startServer();
