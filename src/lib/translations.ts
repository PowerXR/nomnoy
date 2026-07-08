// Translation dictionaries for Thai, English, and Chinese
export type Language = "th" | "en" | "zh";

export const translations = {
  th: {
    // Nav
    home: "หน้าแรก",
    aboutUs: "เกี่ยวกับเรา",
    portfolios: "ผลงานมรดก",
    artisans: "ช่างฝีมือ",
    products: "ผลิตภัณฑ์สินค้า",
    contactUs: "ติดต่อเรา",
    mapTitle: "แผนที่นำเที่ยววัฒนธรรมตำบลน้ำน้อย",
    mapSub: "เลือกพิกัดสถานที่ท่องเที่ยวและจุดเรียนรู้ภูมิปัญญาเพื่อดูรายละเอียดเชิงลึกและทิศทาง",

    // Header & User Menu
    login: "เข้าสู่ระบบ",
    register: "สมัครผู้ร่วมทาง",
    logout: "ออกจากระบบ",
    support: "สนับสนุนเติมเงิน",
    adminDashboard: "ระบบสารสนเทศหลังบ้าน",
    purchaseHistory: "ประวัติการสั่งซื้อทั้งหมด",
    rolePanel: "แผงควบคุมบทบาท",
    adminRole: "🛡️ ผู้ปกครองตำบล (แอดมิน)",
    memberRole: "👤 สมาชิกชุมชน",
    balance: "เครดิตสะสม",
    supportBtn: "สนับสนุน",

    // Main titles
    artisansTitle: "บรมครูช่างฝีมือผู้รักษามรดก",
    artisansSub: "บุคคลสำคัญปราชญ์ชาวบ้านผู้สืบทอดจิตวิญญาณแห่งลุ่มน้ำและผืนดินตำบลน้ำน้อย",
    portfoliosTitle: "คลังภาพผลงานหัตถศิลป์มงคล",
    portfoliosSub: "ความภาคภูมิใจและอัตลักษณ์ทางวัฒนธรรมที่ถูกถ่ายทอดผ่านงานฝีมืออันประณีต",
    productsTitle: "ผลิตภัณฑ์มงคลและผ้าบาติกชุมชน",
    productsSub: "สนับสนุนฝีมือชุมชนเพื่อการพัฒนาและรักษารากเหง้าวัฒนธรรมวิถีชีวิตชาวน้ำน้อยอย่างยั่งยืน",
    aboutUsTitle: "วิถีหัตถศิลป์ ชุมชนตำบลน้ำน้อย",
    aboutUsBody: "ตำบลน้ำน้อย อำเภอหาดใหญ่ จังหวัดสงขลา เป็นดินแดนที่มีประวัติศาสตร์และภูมิปัญญาพื้นบ้านที่สืบทอดกันมาหลายชั่วอายุคน โดยเฉพาะกลุ่มงานหัตถศิลป์ทอผ้าบาติกเขียนลายโบราณ และการจักสานใบลานที่มีความโดดเด่นเป็นเอกลักษณ์ ผลิตภัณฑ์ทุกชิ้นของเราไม่ได้เป็นเพียงสินค้าทั่วไป แต่เป็นตัวแทนความภาคภูมิใจ ความประณีต และการรักษามรดกทางวัฒนธรรมท้องถิ่นให้อยู่คู่วิถีไทยสืบไป",

    // Map markers translations
    categoryAdmin: "🏛️ สถานที่ราชการ",
    categoryCraft: "✨ งานหัตถกรรม/ฝีมือ",
    categoryTemple: "🙏 โบราณสถาน/วัด",
    categoryNature: "🌳 แหล่งธรรมชาติ",
    categoryMarket: "🛒 ร้านค้าชุมชน",
    phoneContact: "📞 โทรติดต่อ:",
    directionBtn: "🧭 นำทาง (Google Maps)",
    noImg: "ไม่มีรูปภาพ",

    // Products & Actions
    buyNow: "สั่งซื้อทันที",
    viewDetails: "ดูรายละเอียด",
    categoryAll: "ทั้งหมด",
    stock: "คงเหลือ",
    items: "ชิ้น",
    price: "ราคา",
    noProducts: "ไม่พบสินค้าในหมวดหมู่นี้",
    couponCode: "รหัสคูปองส่วนลด",
    applyCoupon: "ใช้งานคูปอง",
    successBuy: "การสั่งซื้อสำเร็จ",
    insufficientFunds: "เครดิตของคุณไม่เพียงพอ กรุณาสนับสนุนเติมเงินก่อนทำรายการค่ะ",
    quantity: "จำนวนที่ต้องการสั่งซื้อ",
    totalPrice: "ราคารวมทั้งหมด",

    // Footer
    footerRights: "สงวนลิขสิทธิ์ข้อมูลสาธารณประโยชน์เชิงวัฒนธรรม วิสาหกิจรวมกลุ่มตำบลน้ำน้อย",
    footerAddress: "ตำบลน้ำน้อย อำเภอหาดใหญ่ จังหวัดสงขลา ประเทศไทย",

    // UI Buttons
    close: "ปิดหน้าต่าง",
    save: "บันทึกข้อมูล",
    cancel: "ยกเลิก",

    // Artisans section in products list
    meetArtisans: "🏛️ หัตถกรรมผู้ทรงภูมิปัญญาตำบลน้ำน้อย",
    artisansSectionTitle: "ทำความรู้จักกับ",
    artisansSectionHighlight: "ช่างฝีมือชุมชน",
    artisansSectionBio: "เราเล็งเห็นคุณค่าของการสืบทอดมรดกทางวัฒนธรรมและร่วมเคียงคู่กับภูมิปัญญาชาวบ้านตำบลน้ำน้อย อำเภอหาดใหญ่ จังหวัดสงขลา ผลิตภัณฑ์ OTOP และอาหารทุกชิ้นที่โชว์บนเว็ปไซต์นี้รังสรรค์ด้วยประณีตศิลป์แห่งวิถีชาวใต้จากฝีมือของศิลปินชุมชนน้ำน้อยตัวจริง เสียงจริง ทุกๆ ชิ้นงานล้วนใส่หัวใจและจิตวิญญาณแห่งความเป็นไทยร่วมสมัยไว้ครบถ้วน",
    sustainDirect: "สนับสนุนความยั่งยืน กระจายรายได้สู่ชุมชนโดยตรง 100%",
    featuredArtisanTag: "★ FEATURED ARTISAN / ปราชญ์ผู้สร้างสรรค์",
    featuredArtisanName: "กลุ่มทอและเขียนลายบาติกบ้านน้ำน้อย",
    featuredArtisanQuote: "การเขียนเทียนลงบนผืนผ้าบาติกคือการบันทึกธรรมชาติรอบตัวเรา ลายคลื่นของแม่น้ำน้ำน้อยอันหล่อเลี้ยงชีวิต คือหัวใจที่เราคราฟต์ลงบนผ้าครามธรรมชาติผืนทองนี้ด้วยใจภักดิ์",
    curatedArtistryTag: "✨ หัตถกรรมคัดสรรระดับพรีเมียม (CURATED ARTISTRY)",
    curatedArtistryTitle: "เลือกสรรผลงานศิลปะอันล้ำค่า",
    searchPlaceholder: "ค้นหาผลงานและภูมิปัญญาล้ำค่า...",
    allProductsTab: "ผลงานทั้งหมด",
    allProductsDesc: "เลือกชมทุกชิ้นงาน",
    countItems: "ชิ้นงาน",
    noCuratedProducts: "ไม่พบผลงานศิลป์ในหมวดหมู่นี้ หรือการค้นหาไม่พบข้อมูลผลิตภัณฑ์ใดๆ",
    communityCraft: "งานชุมชน",
    preOrder: "สั่งพรีออเดอร์",
    readyToShip: "พร้อมส่ง",
    contributionVal: "มูลค่าสนับสนุน",
    baht: "บาท",
    viewDetailsBtn: "ชมรายละเอียด",

    // Alerts and notifications
    loginWelcome: "ยินดีต้อนรับกลับคุณ {username}!",
    loginSuccessMsg: "เข้าสู่ระบบด้วยบทบาท {role} สำเร็จเรียบร้อย มุ่งสู่การเลือกซื้อคีย์ไอเท็ม",
    roleAdmin: "🛡️ ผู้ดูแลร้าน",
    roleMember: "👤 สมาชิกปกติ",
    logoutSuccess: "ออกจากระบบเรียบร้อย",
    logoutMsg: "หวังว่าคุณจะกลับมาใช้บริการร้านเราอีกในเร็วๆ นี้!",
    errorTitle: "ขัดข้อง!",
    errorHtmlResp: "เซิร์ฟเวอร์ส่งการตอบสนองที่ไม่ถูกต้อง (HTML)",
    errorPost: "เกิดความผิดพลาดในการส่งถ่ายข้อมูลซื้อ",
    purchaseFailed: "รายการล้มเหลว!",
    purchaseFailedDesc: "ไม่สามารถทำรายการได้",
    purchaseSuccess: "ชำระเงินสำเร็จ!",
    purchaseSuccessMsg: "คุณได้สั่งซื้อและตัดยอดเงิน {amount} บาท คงเหลือคงคลังปรับลดแล้ว รายการสต็อกที่รับจัดส่ง:",
    topupSuccessTitle: "เติมเครดิตเสร็จสมบูรณ์! 🎉",
    topupSuccessMsg: "ขอบคุณที่เติมเงินกับร้านค้า ยอดโอนส่งตรวจ +${amount} ฿ ได้รับการเพิ่มเข้ากระเป๋าตังเรียบร้อย ยอดคงเหลือปัจจุบัน: ${newBalance} ฿",
    copiedNotify: "คัดลอกรหัสสินค้าไปใช้เสร็จสมบูรณ์!",

    // Portfolio and Artisans additions
    emptyPortfolios: "ยังไม่มีข้อมูลแฟ้มผลงานศิลปหัตถกรรมในขณะนี้",
    emptyArtisans: "ยังไม่มีข้อมูลในทำเนียบช่างฝีมือขณะนี้",
    statsSystem: "ระบบวิสาหกิจและภูมิปัญญาสัมมาชีพ",
    statsQuestion: "ต้องการร่วมสัมผัสและสืบสานวิถีชุมชนน้ำน้อยด้วยตนเอง?",
    statsBody: "ตำบลน้ำน้อย อำเภอหาดใหญ่ เปิดต้อนรับการศึกษาดูงานจากโรงเรียน สถาบันอุดมศึกษา และนักท่องเที่ยวเชิงอนุรักษ์ทุกท่าน โดยกลุ่มทอผ้าบาติกและจักสานใบลานของเราจัดคลาสเวิร์กชอปสาธิตฟรีโดยไม่มีค่าใช้จ่ายเพิ่มเติม",
    statsReserveBtn: "จองคิวศึกษาดูงานฟรี",
    statsLocBtn: "แชร์พิกัดนำทางตำบล",

    // Product Detail and Checkout Form Additions
    valFineCraft: "หัตถศิลป์ล้ำค่าชุมชนน้ำน้อย",
    stockCount: "คงเหลือในคลัง: {count} ชิ้น",
    certGenuine: "การรับรองงานฝีมือแท้ 100%",
    certDesc: "ผลิตภัณฑ์ชิ้นนี้เขียนลายและถักทอด้วยมือจากช่างท้องถิ่นน้ำน้อย หากพบตำหนิชำรุดจากการผลิตใดๆ ชุมชนยินดีเปลี่ยนชิ้นใหม่ในเงื่อนไข 7 วัน เพื่อพิทักษ์ความพึงพอใจของท่านผู้มีอุปการคุณสูงสุด",
    productSpecsTab: "รายละเอียดผลิตภัณฑ์",
    reviewsTab: "รีวิวการใช้งานคัดสรร ({count})",
    noReviewsYet: "ขณะนี้ยังไม่มีรีวิวเพิ่มเติมสำหรับการสั่งสินค้ารอบนี้ อุดหนุนแล้วมาเขียนรีวิวท่านแรกได้เลยค่ะ!",
    couponFormTitle: "กรอกรหัสส่วนลดพิเศษชุมชน (Coupon Code)",
    couponPlaceholder: "รหัสลดพิเศษ เช่น SUPPORTNAMNOI, MUNICIPAL100...",
    couponVerifyBtn: "ตรวจบิล...",
    couponApplyBtn: "ใช้รหัส",
    shippingTitle: "ข้อมูลที่อยู่จัดส่งสินค้าชุมชน (Shopee Delivery Service)",
    shippingNameLabel: "ชื่อ-นามสกุล ผู้รับสินค้า *",
    shippingNamePlaceholder: "เช่น นายแสนดี พรมิ่งมงคล",
    shippingPhoneLabel: "เบอร์โทรศัพท์ติดต่อ *",
    shippingPhonePlaceholder: "เช่น 081-234-5678",
    shippingAddressLabel: "ที่อยู่นำส่งโดยละเอียด (เลขที่รหัส, ถนน, ซอย, ตำบล/อำเภอ, จังหวัด) *",
    shippingAddressPlaceholder: "เช่น 99/9 หมู่ 2 ต.ปาดังเบซาร์ อ.สะเดา จ.สงขลา",
    shippingZipLabel: "รหัสไปรษณีย์ *",
    shippingZipPlaceholder: "เช่น 90110",
    shippingMethodLabel: "ตัวเลือกช่องทางส่งพัสดุ *",
    totalSupportLabel: "มูลค่าสนับสนุนรวมค่าจัดส่งสุทธิ",
    itemPriceLabel: "ค่าสินค้า",
    shippingFeeLabel: "พัสดุ",
    outOfStockBtn: "สินค้าหมด",
    buyNowBtn: "สนับสนุนซื้อสินค้านี้",
    loginFirstAlert: "กรุณาเข้าสู่ระบบก่อนอุดหนุนสินค้าสิ่งวิเศษของชุมชน",
    exceededStockAlert: "ความต้องการซื้อเกินจำนวนที่มีในคลังขณะนี้",
    completeShippingAlert: "⚠️ กรุณากรอกข้อมูลจัดส่งและระบุเบอร์ติดต่อให้ครบถ้วนก่อนส่งใบสั่งซื้อนะคะ (ระบบจัดส่ง Shopee Delivery)",
    benefitCharity: "สิทธิประโยชน์ร่วมทอดกฐินและส่งเสริมสัมมาชีพรายย่อยประจำปี",
    benefitEco: "หีบห่อด้วยวัสดุธรรมชาติรักสิ่งแวดล้อมเพื่อลดขยะพลาสติก",
    benefitTrack: "ยินดีเปลี่ยนรหัสจัดส่งหรือตรวจสอบสินค้าได้อย่างสะดวกรวดเร็วทางหน้าประวัติ"
  },
  en: {
    // Nav
    home: "Home",
    aboutUs: "About Us",
    portfolios: "Heritage Works",
    artisans: "Artisans",
    products: "Shop Products",
    contactUs: "Contact",
    mapTitle: "Nam Noi Cultural Tourism Interactive Map",
    mapSub: "Select location coordinates and local wisdom learning points to explore detailed history and directions.",

    // Header & User Menu
    login: "Log In",
    register: "Register",
    logout: "Log Out",
    support: "Top up Credits",
    adminDashboard: "Admin Information System",
    purchaseHistory: "All Purchase History",
    rolePanel: "Account Role Control",
    adminRole: "🛡️ Admin User",
    memberRole: "👤 Regular Member",
    balance: "Total Credits",
    supportBtn: "Support",

    // Main titles
    artisansTitle: "Master Artisans & Wisdom Keepers",
    artisansSub: "Local sages and master craftspersons keeping the spirit and soil of Nam Noi alive.",
    portfoliosTitle: "Auspicious Crafts Portfolio",
    portfoliosSub: "Local pride and cultural identity conveyed through extremely fine craftsmanship.",
    productsTitle: "Blessed Local Crafts & Batik Shop",
    productsSub: "Support our local community to preserve roots and foster sustainable livelihood in Nam Noi.",
    aboutUsTitle: "Socio-Cultural Ways of Nam Noi Community",
    aboutUsBody: "Nam Noi subdistrict, Hat Yai district, Songkhla province, is a land of rich history and local wisdom inherited over generations. Particularly renowned for ancient batik drawing patterns and palm-leaf weaving. Every item is not just a standard product, but a symbol of pride, precision, and cultural preservation keeping local heritage alive.",

    // Map markers translations
    categoryAdmin: "🏛️ Government / Admin",
    categoryCraft: "✨ Crafts & Sages Workshop",
    categoryTemple: "🙏 Temples & Historic Sites",
    categoryNature: "🌳 Natural Sights",
    categoryMarket: "🛒 Community Markets",
    phoneContact: "📞 Contact Phone:",
    directionBtn: "🧭 Navigate (Google Maps)",
    noImg: "No image",

    // Products & Actions
    buyNow: "Purchase Now",
    viewDetails: "View Details",
    categoryAll: "All Categories",
    stock: "In Stock",
    items: "items",
    price: "Price",
    noProducts: "No products found in this category",
    couponCode: "Coupon discount code",
    applyCoupon: "Apply Discount",
    successBuy: "Purchase Completed Successfully",
    insufficientFunds: "Insufficient funds. Please support/top-up credits before continuing.",
    quantity: "Quantity to buy",
    totalPrice: "Grand Total",

    // Footer
    footerRights: "All Rights Reserved. Public Cultural Benefit, Nam Noi Community Enterprise Group.",
    footerAddress: "Nam Noi Subdistrict, Hat Yai, Songkhla, Thailand",

    // UI Buttons
    close: "Close Window",
    save: "Save Changes",
    cancel: "Cancel",

    // Artisans section in products list
    meetArtisans: "🏛️ Wise Craftsmen of Nam Noi Subdistrict",
    artisansSectionTitle: "Meet Our",
    artisansSectionHighlight: "Local Artisans",
    artisansSectionBio: "We cherish the inheritance of local cultural heritage, partnering with local sages of Nam Noi Subdistrict, Hat Yai District, Songkhla. Every OTOP craft and delicacy listed here is painstakingly crafted by local community artists. Every piece carries our heart, dedication, and contemporary local spirit.",
    sustainDirect: "Support Sustainability - 100% direct community income distribution",
    featuredArtisanTag: "★ FEATURED ARTISAN / Local Wisdom",
    featuredArtisanName: "Nam Noi Batik Drawing & Weaving Guild",
    featuredArtisanQuote: "Drawing hot wax on batik cloth is recording the natural rhythm around us. The river waves of Nam Noi are the heartbeat we lovingly capture on this natural indigo craft.",
    curatedArtistryTag: "✨ CURATED ARTISTRY / Premium Selects",
    curatedArtistryTitle: "Discover Valuable Cultural Handcrafts",
    searchPlaceholder: "Search fine crafts & local products...",
    allProductsTab: "All Masterpieces",
    allProductsDesc: "Browse entire collection",
    countItems: "masterpieces",
    noCuratedProducts: "No masterpieces found matching your search query or selected category.",
    communityCraft: "Community Craft",
    preOrder: "Pre-order",
    readyToShip: "Ready to ship",
    contributionVal: "Contribution",
    baht: "฿",
    viewDetailsBtn: "View Details",

    // Alerts and notifications
    loginWelcome: "Welcome back, {username}!",
    loginSuccessMsg: "Logged in as {role} successfully. Happy heritage shopping!",
    roleAdmin: "🛡️ Administrator",
    roleMember: "👤 Community Member",
    logoutSuccess: "Logged Out Successfully",
    logoutMsg: "Thank you for visiting! We hope to see you back soon.",
    errorTitle: "System Error!",
    errorHtmlResp: "Server sent invalid HTML response",
    errorPost: "Failed to transmit purchase transaction data.",
    purchaseFailed: "Purchase Failed!",
    purchaseFailedDesc: "Unable to process payment order.",
    purchaseSuccess: "Purchase Successful!",
    purchaseSuccessMsg: "Successfully purchased and debited {amount} ฿. Store stock updated. Your delivery code packages:",
    topupSuccessTitle: "Top-up Completed Successfully! 🎉",
    topupSuccessMsg: "Thank you for supporting our community! Your pending deposit +{amount} ฿ was credited. Current wallet balance: {balance} ฿",
    copiedNotify: "Product code copied successfully!",

    // Portfolio and Artisans additions
    emptyPortfolios: "No portfolio items available at this moment.",
    emptyArtisans: "No artisans listed on the registry at this moment.",
    statsSystem: "Community Enterprise & Local Wisdom System",
    statsQuestion: "Want to experience and preserve the Nam Noi way of life yourself?",
    statsBody: "Nam Noi Subdistrict, Hat Yai District welcomes study tours, educational institutions, and eco-tourists. Our local batik and palm weaving guilds organize free demonstration workshops.",
    statsReserveBtn: "Book Free Study Tour",
    statsLocBtn: "Share Subdistrict Coordinates",

    // Product Detail and Checkout Form Additions
    valFineCraft: "Nam Noi Valuable Local Crafts",
    stockCount: "In stock: {count} items",
    certGenuine: "100% Authentic Handcraft Guarantee",
    certDesc: "This item is handdrawn and handwoven by local artisans of Nam Noi. In case of any production defect, the community is happy to exchange it within 7 days to protect your utmost satisfaction.",
    productSpecsTab: "Product Specifications",
    reviewsTab: "Customer Reviews ({count})",
    noReviewsYet: "There are no reviews for this product yet. Be the first to share your experience after purchasing!",
    couponFormTitle: "Enter Community Discount Coupon Code",
    couponPlaceholder: "e.g., NEWUSER, LUCKY50...",
    couponVerifyBtn: "Check...",
    couponApplyBtn: "Apply",
    shippingTitle: "Shipping Address Details (Shopee Delivery Service)",
    shippingNameLabel: "Recipient Name *",
    shippingNamePlaceholder: "e.g., John Doe",
    shippingPhoneLabel: "Contact Phone *",
    shippingPhonePlaceholder: "e.g., 081-234-5678",
    shippingAddressLabel: "Detailed Shipping Address (House No, Street, Sub-district, District, Province) *",
    shippingAddressPlaceholder: "e.g., 99/9 Moo 2, Padang Besar, Sadao, Songkhla",
    shippingZipLabel: "Postal Code *",
    shippingZipPlaceholder: "e.g., 90110",
    shippingMethodLabel: "Select Delivery Service Option *",
    totalSupportLabel: "Grand Total Support (Including Shipping)",
    itemPriceLabel: "Item Price",
    shippingFeeLabel: "Delivery",
    outOfStockBtn: "Out of Stock",
    buyNowBtn: "Purchase & Support",
    loginFirstAlert: "Please login to your account before purchasing community crafts.",
    exceededStockAlert: "Requested quantity exceeds available stock.",
    completeShippingAlert: "⚠️ Please fill in all shipping details and contact phone number before placing your order.",
    benefitCharity: "Support annual charity contributions and micro-entrepreneurs.",
    benefitEco: "Eco-friendly packaging using natural organic materials to reduce plastic waste.",
    benefitTrack: "Track and verify shipment code status easily from your history page."
  },
  zh: {
    // Nav
    home: "首页",
    aboutUs: "关于我们",
    portfolios: "非遗作品",
    artisans: "手艺大师",
    products: "文创特色商城",
    contactUs: "联系我们",
    mapTitle: "喃内区文化与智慧旅游交互地图",
    mapSub: "选择地图上的文化坐标和非遗智慧学习点，获取深度历史底蕴和导航路线。",

    // Header & User Menu
    login: "登录",
    register: "注册",
    logout: "退出登录",
    support: "支持充值",
    adminDashboard: "后台管理系统",
    purchaseHistory: "我的订单记录",
    rolePanel: "账户角色面板",
    adminRole: "🛡️ 系统超级管理员",
    memberRole: "👤 社区普通会员",
    balance: "账户额度",
    supportBtn: "支持充值",

    // Main titles
    artisansTitle: "非物质文化遗产传承人",
    artisansSub: "致力于传承宋卡府喃内区非遗文化、融汇自然与匠心之魂的民间贤达。",
    portfoliosTitle: "吉祥文创非遗作品集",
    portfoliosSub: "通过极致精细的手工技艺，传递当地对文化身份的自豪感与独特色彩。",
    productsTitle: "吉祥文创与非遗手绘巴迪克",
    productsSub: "支持手艺人以促进社区的可持续发展，悉心守护喃内人世代相传的文化根基。",
    aboutUsTitle: "喃内社区的非遗匠心传承",
    aboutUsBody: "泰国宋卡府合艾郡喃内区是一片拥有深厚历史积淀和民俗智慧的福地。尤其是这里古老的巴迪克蜡染技术和手编扇、蒲草编织品，独具地域艺术魅力。这里的每一件作品都不只是普通商品，更是传承人的骄傲与温度，以及永不褪色的文化记忆。",

    // Map markers translations
    categoryAdmin: "🏛️ 政府及市政机构",
    categoryCraft: "✨ 匠人手工作坊",
    categoryTemple: "🙏 古刹名胜与寺庙",
    categoryNature: "🌳 绿色生态景区",
    categoryMarket: "🛒 社区特色市集",
    phoneContact: "📞 联系电话:",
    directionBtn: "🧭 开启地图导航 (Google 地图)",
    noImg: "无预览图",

    // Products & Actions
    buyNow: "立即订购",
    viewDetails: "查看详情",
    categoryAll: "全部分类",
    stock: "剩余库存",
    items: "件",
    price: "价格",
    noProducts: "此分类下暂无任何商品",
    couponCode: "请输入优惠券代码",
    applyCoupon: "使用优惠券",
    successBuy: "商品订购成功",
    insufficientFunds: "您的信用点数不足。请先支持并充值账户以完成订购。",
    quantity: "购买数量",
    totalPrice: "总计价格",

    // Footer
    footerRights: "版权所有 © 喃内区文化发展公共福利及社区企业联盟",
    footerAddress: "泰国宋卡府合艾郡喃内区",

    // UI Buttons
    close: "关闭窗口",
    save: "保存更改",
    cancel: "取消",

    // Artisans section in products list
    meetArtisans: "🏛️ 喃内区德艺双馨手工艺传承人",
    artisansSectionTitle: "了解我们的",
    artisansSectionHighlight: "非遗传承人",
    artisansSectionBio: "我们珍视宋卡府合艾郡喃内区地方传统文化遗产的保护，与非遗传承人和民间匠人携手共进。此处的每一款手工艺品和特色美食皆由喃内社区匠人倾注心血制成，蕴含传统神韵与现代审美的碰撞。",
    sustainDirect: "支持可持续发展，100% 的收入直达手艺人家庭",
    featuredArtisanTag: "★ FEATURED ARTISAN / 喃内非遗之光",
    featuredArtisanName: "喃内手工巴迪克与织造行会",
    featuredArtisanQuote: "蜡染染布是在记录我们身边大自然的节律。喃内母亲河的水波，便是我们倾注热忱、悉心绣刻在天然靛蓝画卷之上的艺术脉搏。",
    curatedArtistryTag: "✨ CURATED ARTISTRY / 精品文创推荐",
    curatedArtistryTitle: "探索富有历史温度的手工艺珍品",
    searchPlaceholder: "搜索手工艺文创与特色商品...",
    allProductsTab: "全部匠心之作",
    allProductsDesc: "浏览完整典藏",
    countItems: "件非遗作品",
    noCuratedProducts: "未找到符合您搜索条件或该分类下的非遗作品。",
    communityCraft: "社区非遗手作",
    preOrder: "预售定制",
    readyToShip: "现货直发",
    contributionVal: "认购价值",
    baht: "泰铢",
    viewDetailsBtn: "查看详情",

    // Alerts and notifications
    loginWelcome: "欢迎回来，{username}！",
    loginSuccessMsg: "成功登录，当前角色为：{role}。祝您购物愉快！",
    roleAdmin: "🛡️ 超级管理员",
    roleMember: "👤 社区普通会员",
    logoutSuccess: "成功退出登录",
    logoutMsg: "感谢您的光临！期待您再次回访。",
    errorTitle: "系统发生故障！",
    errorHtmlResp: "服务器返回了无效的 HTML 响应",
    errorPost: "无法向服务器提交交易信息。",
    purchaseFailed: "交易购买失败！",
    purchaseFailedDesc: "无法处理此购物订单。",
    purchaseSuccess: "交易支付成功！",
    purchaseSuccessMsg: "成功扣除 {amount} 泰铢。仓库库存已更新。您的取货验证码：",
    topupSuccessTitle: "账户信用点数充值成功！ 🎉",
    topupSuccessMsg: "感谢您对喃内手工艺人的大力支持！已成功注入 +{amount} 泰铢。当前账户总信用点数: {balance} 泰铢",
    copiedNotify: "产品兑换凭证码已成功复制！",

    // Portfolio and Artisans additions
    emptyPortfolios: "暂无特色文化手工艺作品资料。",
    emptyArtisans: "暂无德艺双馨手工艺传承人信息。",
    statsSystem: "社区文化企业与本土非遗传承体系",
    statsQuestion: "想要亲身体验并延续喃内区非遗文化传承吗？",
    statsBody: "合艾郡喃内区诚挚欢迎各大学校、科研机构及生态环保旅行团队前来考察与研学。我们的蜡染手绘和棕榈叶手工编织工会提供免费的现场技艺演示与实操体验课程。",
    statsReserveBtn: "免费预约研学考察/体验课程",
    statsLocBtn: "获取社区地理导航坐标",

    // Product Detail and Checkout Form Additions
    valFineCraft: "喃内精品非遗工艺",
    stockCount: "当前库存: {count} 件",
    certGenuine: "100% 非遗传承工艺保真",
    certDesc: "本件商品由喃内当地非遗传承人手工蜡染及织造而成。如有任何制作瑕疵，7 天内支持免费更换，全力保障您的权益。",
    productSpecsTab: "文创工艺详情",
    reviewsTab: "买家真实口碑评论 ({count})",
    noReviewsYet: "该文创作品暂无买家评价，欢迎您认购并分享第一条心水评论！",
    couponFormTitle: "输入社区专属礼金优惠券",
    couponPlaceholder: "例如 NEWUSER, LUCKY50...",
    couponVerifyBtn: "核验中...",
    couponApplyBtn: "兑换",
    shippingTitle: "收货地址与快递信息 (Shopee 联运速递)",
    shippingNameLabel: "收货人真实姓名 *",
    shippingNamePlaceholder: "例如 张三",
    shippingPhoneLabel: "联系电话号码 *",
    shippingPhonePlaceholder: "例如 081-234-5678",
    shippingAddressLabel: "详细收货地址（门牌号、街道、市/县区、省份） *",
    shippingAddressPlaceholder: "例如 99/9 Moo 2, Padang Besar, Sadao, Songkhla",
    shippingZipLabel: "邮政编码 *",
    shippingZipPlaceholder: "例如 90110",
    shippingMethodLabel: "选择物流配送方式 *",
    totalSupportLabel: "含运费认购总价",
    itemPriceLabel: "商品价格",
    shippingFeeLabel: "运费",
    outOfStockBtn: "抢购一空",
    buyNowBtn: "倾心认购",
    loginFirstAlert: "在认购非遗工艺文创前，请先登录您的会员账户。",
    exceededStockAlert: "购买数量已超出当前商品最大库存。",
    completeShippingAlert: "⚠️ 提交认购订单前，请务必完整填写收货人地址、联系电话等必填项。",
    benefitCharity: "善款将助力年度社区慈善公益及扶持中小微手工艺人。",
    benefitEco: "采用绿色有机可降解材料包装，低碳环保减塑。",
    benefitTrack: "可在“我的订单历史记录”中一键查询和追踪物流单号。"
  }
};

export const categoryTranslations = {
  "cat-1": {
    en: { name: "Best Sellers", description: "Premium game IDs and codes, instant stock delivery." },
    zh: { name: "热销商品", description: "高端游戏账号及充值码，库存即时秒发。" }
  },
  "cat-2": {
    en: { name: "Game Topup & Digital", description: "Game keys, top-up cards, and various digital services." },
    zh: { name: "游戏充值与数码", description: "游戏CDKey、充值卡及各类数字服务。" }
  },
  "cat-3": {
    en: { name: "Mystery Box (Gacha)", description: "Win premium rewards at low prices, exciting and fun!" },
    zh: { name: "幸运盲盒 (Gacha)", description: "低价赢取高端豪华奖励，惊险刺激好玩！" }
  }
};

export const productTranslations = {
  "prod-1": {
    en: {
      name: "🔑 High-Rank Valorant ID with Premium Rare Knives",
      description: "Diamond rank account with popular Champion 2022+2023 knife skins, premium weapon skins, instant delivery, 30-day warranty!",
      details: "### Account Features\n- Current Rank: **Diamond 2**\n- Knife Skin: **Champions 2022 Butterfly Knife** or **Champions 2023 Vandal**\n- Popular Vandal skins: Prime, Reaver, RGX\n- Change password and email instantly after purchase\n- 30-day warranty against retrieval or arbitrary bans\n\n*Please record a video from transaction start to account login for claims.*"
    },
    zh: {
      name: "🔑 高段位 Valorant 账号（含稀有高级近战武器）",
      description: "Diamond（钻石）段位账号，含 2022+2023 年热门冠军近战皮肤及高级枪械皮肤，即时交付，30 天保障！",
      details: "### 账号属性\n- 当前段位: **Diamond 2 (钻石 2)**\n- 近战皮肤: **Champions 2022 蝴蝶刀** 或 **Champions 2023 狂徒**\n- 包含热门狂徒皮肤: Prime, Reaver, RGX\n- 购买后可立即修改密码和绑定邮箱\n- 交付首月内防回、防回收，提供 30 天无理由售后保障\n\n*请录制从付款至登录成功的完整视频以维护您的售后权益。*"
    }
  },
  "prod-2": {
    en: {
      name: "⭐️ Automated Shop Script (PHP PDO Bootstrap 5)",
      description: "Premium admin dashboard, banner slider, auto-topup, Truemoney Red Packet, and QR slip verification with advanced admin control preset.",
      details: "### Professional Features Included\n- Developed with **PHP OOP - PDO (MySQL/PostgreSQL)**\n- 100% custom admin dashboard (manage users, stock, daily/monthly stats)\n- Automatic top-up via QR scan and SlipOK / EasySlip API slip check\n- Latest Truemoney Red Packet gift code integration\n- One-click login via Discord OAuth\n- Dark/Light theme toggle stored in client cookies"
    },
    zh: {
      name: "⭐️ 自动售货商城系统源码 (PHP PDO Bootstrap 5)",
      description: "高级后台管理系统，轮播图管理，支持自动充值、口令红包以及 QR 二维码扫码支付，配备高级管理员控制面板。",
      details: "### 极客级专业功能\n- 采用 **PHP OOP - PDO (MySQL/PostgreSQL)** 开发\n- 100% 自定义后台管理（管理用户、商品库存、日/月度财务账单）\n- 通过二维码和 SlipOK / EasySlip API 实现自动扫码和秒级入账\n- 整合最新 Truemoney 红包口令充值\n- 集成 Discord OAuth 实现一键快速注册和免密登录\n- 客户端 cookie 存储的主题切换（明亮/暗黑）"
    }
  },
  "prod-3": {
    en: {
      name: "🎁 Discord Nitro (1 Month) Gift Link",
      description: "1-month Discord Nitro gift link. Unlocks server boosts, custom animated stickers, and file uploads up to 500MB.",
      details: "### Exclusive Benefits\n- **2 Free Server Boosts** included\n- Animated avatars and custom emojis anywhere\n- Animated profile pictures (GIF support)\n- High-quality screen sharing up to **4K 60FPS**\n- Expand server limit up to 200 servers\n\n*How to use: Login to Discord and click the gift link to activate.*"
    },
    zh: {
      name: "🎁 Discord Nitro (1 个月) 礼物激活链接",
      description: "1 个月 Discord Nitro 礼物链接。解锁服务器加速加成、自定义动态表情贴纸，以及高达 500MB 的文件上传上限。",
      details: "### 特权尊享福利\n- 套餐内赠送 **2 个免费服务器 Boosts (加速)**\n- 随处使用动态头像、自定义全局表情及贴纸\n- 支持设置 GIF 格式动态背景和头像\n- 支持高达 **4K 60FPS** 的极清高清屏幕共享\n- 可加入服务器数量上限翻倍，最多可达 200 个\n\n*激活方式: 登录 Discord 并点击此礼物链接即可一键秒激活*"
    }
  },
  "prod-4": {
    en: {
      name: "🎁 VIP Mystery Box - Epic Chance to Win Big Rewards!",
      description: "Exciting chance to win game IDs and coupons! Stand a chance to win a legendary Valorant account or a free 100 THB topup!",
      details: "### Reward Probability Details\n1. **Sweet Salt (1 THB Consolation Code)** - Drop Rate: 50%\n2. **10 THB Store Credit Key** - Drop Rate: 30%\n3. **Bronze-Gold Valorant Account** - Drop Rate: 15%\n4. **🎉 JACKPOT: Radiant Rank Valorant Account with Full Skins** - Drop Rate: 5%\n\n*Warning: The more you open, the closer you get to the Jackpot! Rates are processed transparently via random algorithms.*"
    },
    zh: {
      name: "🎁 VIP 豪华盲盒 - 心跳暴击赢取神秘大奖！",
      description: "超值盲盒抽奖！有机会获得稀游 Valorant 极品账号或 100 泰铢免费代金券，百元欧皇由你来当！",
      details: "### 盲盒内设奖励及出率明细\n1. **甜咸阳光盐 (1 泰铢安慰金)** - 概率: 50%\n2. **10 泰铢充值信用激活码** - 概率: 30%\n3. **Bronze 至 Gold 段位 Valorant 账号** - 概率: 15%\n4. **🎉 终极 JACKPOT: Radiant 段位全皮肤绝版账号** - 概率: 5%\n\n*提示: 盲盒爆率由服务器随机数算法公平公开执行，多次尝试更容易触发 JackPot 暴击喔！*"
    }
  }
};

export const boxItemTranslations = {
  "เกลือแสนหวาน (บัตรปลอบใจ 1 THB)": { en: "Sweet Salt (1 THB Consolation)", zh: "甜咸阳光盐 (1 泰铢安慰金)" },
  "คีย์เครดิตร้าน 10 THB": { en: "10 THB Credit Key", zh: "10 泰铢充值激活码" },
  "ไอดี Valorant ระดับ Bronze-Gold": { en: "Bronze-Gold Valorant Account", zh: "Bronze 至 Gold 段位 Valorant 账号" },
  "🎉 JACKPOT: ไอดี Valorant Radiant / สกินครบ!": { en: "🎉 JACKPOT: Full Skins Radiant Valorant Account", zh: "🎉 终极 JACKPOT: 全皮肤 Radiant 绝版账号" }
};

export function getTranslatedCategory(cat: any, lang: Language) {
  if (!cat) return cat;
  if (lang === "th") return cat;
  const trans = categoryTranslations[cat.id as keyof typeof categoryTranslations];
  if (trans && trans[lang as keyof typeof trans]) {
    return {
      ...cat,
      ...trans[lang as keyof typeof trans]
    };
  }
  return cat;
}

export function getTranslatedProduct(prod: any, lang: Language) {
  if (!prod) return prod;
  if (lang === "th") return prod;
  const trans = productTranslations[prod.id as keyof typeof productTranslations];
  let updatedProd = { ...prod };
  if (trans && trans[lang as keyof typeof trans]) {
    updatedProd = {
      ...updatedProd,
      ...trans[lang as keyof typeof trans]
    };
  }
  // Translate boxItems if any
  if (updatedProd.boxItems && Array.isArray(updatedProd.boxItems)) {
    updatedProd.boxItems = updatedProd.boxItems.map((item: any) => {
      const itemTrans = boxItemTranslations[item.name as keyof typeof boxItemTranslations];
      if (itemTrans && itemTrans[lang as keyof typeof itemTrans]) {
        return {
          ...item,
          name: itemTrans[lang as keyof typeof itemTrans]
        };
      }
      return item;
    });
  }
  return updatedProd;
}

export function getTranslation(lang: Language, key: keyof typeof translations["th"]): string {
  const dict = translations[lang] || translations["th"];
  return dict[key] || translations["th"][key] || String(key);
}
