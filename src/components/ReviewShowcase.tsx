import {
  ReactNode,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BadgeCheck,
  MessageSquareText,
  PackageOpen,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  Language,
  getTranslatedProduct,
} from "../lib/translations";

import {
  Product,
  Review,
  User,
} from "../types";

import VerifiedReviews from "./VerifiedReviews";

interface ReviewShowcaseProps {
  products: Product[];
  reviews: Review[];
  user: User | null;
  lang: Language;

  onAddReview: (
    productId: string,
    rating: number,
    comment: string
  ) => Promise<Review>;
}

type SortMode =
  | "most-reviewed"
  | "highest-rated";

export default function ReviewShowcase({
  products,
  reviews,
  user,
  lang,
  onAddReview,
}: ReviewShowcaseProps) {
  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<Product | null>(null);

  const [sortMode, setSortMode] =
    useState<SortMode>("most-reviewed");

  const copy =
    lang === "zh"
      ? {
          eyebrow: "真实顾客心声",
          title: "已验证买家评价",
          subtitle:
            "每一条评价都来自完成购买并确认收货的顾客。",
          total: "真实评价",
          products: "已有评价商品",
          average: "综合评分",
          reviews: "条评价",
          view: "查看全部评价",
          empty: "尚无已验证购买评价",
          emptyDesc:
            "顾客完成收货后，评价将显示在这里。",
          most: "评价最多",
          highest: "评分最高",
          modalTitle: "真实购买体验",
          verified: "真实购买",
        }
      : lang === "en"
      ? {
          eyebrow:
            "REAL CUSTOMER VOICES",
          title:
            "Verified buyer reviews",
          subtitle:
            "Every review comes from a completed purchase and confirmed delivery.",
          total: "Verified reviews",
          products: "Reviewed products",
          average: "Overall score",
          reviews: "reviews",
          view: "View all reviews",
          empty:
            "No verified reviews yet",
          emptyDesc:
            "Reviews will appear here after customers confirm delivery.",
          most: "Most reviewed",
          highest: "Highest rated",
          modalTitle:
            "Genuine purchase experiences",
          verified: "Verified",
        }
      : {
          eyebrow:
            "เสียงจริงจากลูกค้า",
          title:
            "รีวิวจากผู้ซื้อจริง",
          subtitle:
            "ทุกความคิดเห็นมาจากลูกค้าที่สั่งซื้อสำเร็จและยืนยันรับสินค้าแล้ว",
          total:
            "รีวิวที่ยืนยันแล้ว",
          products:
            "สินค้าที่มีรีวิว",
          average: "คะแนนรวม",
          reviews: "รีวิว",
          view: "ดูรีวิวทั้งหมด",
          empty:
            "ยังไม่มีรีวิวจากผู้ซื้อจริง",
          emptyDesc:
            "เมื่อมีลูกค้ายืนยันรับสินค้าและเขียนรีวิว รีวิวจะแสดงที่นี่อัตโนมัติ",
          most:
            "รีวิวมากที่สุด",
          highest:
            "คะแนนสูงที่สุด",
          modalTitle:
            "ประสบการณ์จริงจากผู้ซื้อ",
          verified: "ผู้ซื้อจริง",
        };

  const verifiedReviews = useMemo(
    () =>
      reviews.filter(
        (review) =>
          review.verifiedPurchase !== false
      ),
    [reviews]
  );

  const productGroups = useMemo(() => {
    const groups = products
      .map((product) => {
        const productReviews =
          verifiedReviews
            .filter(
              (review) =>
                review.productId ===
                product.id
            )
            .sort(
              (a, b) =>
                Date.parse(b.date) -
                Date.parse(a.date)
            );

        const average =
          productReviews.length > 0
            ? productReviews.reduce(
                (total, review) =>
                  total +
                  review.rating,
                0
              ) /
              productReviews.length
            : 0;

        return {
          product,
          reviews: productReviews,
          average,
          latestReview:
            productReviews[0],
        };
      })
      .filter(
        (group) =>
          group.reviews.length > 0
      );

    return groups.sort((a, b) => {
      if (
        sortMode === "highest-rated"
      ) {
        return (
          b.average -
            a.average ||
          b.reviews.length -
            a.reviews.length
        );
      }

      return (
        b.reviews.length -
          a.reviews.length ||
        b.average -
          a.average
      );
    });
  }, [
    products,
    verifiedReviews,
    sortMode,
  ]);

  const overallAverage =
    verifiedReviews.length > 0
      ? verifiedReviews.reduce(
          (total, review) =>
            total + review.rating,
          0
        ) / verifiedReviews.length
      : 0;

  return (
    <>
      <section
        id="verified-reviews-section"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-[#8E6D4E]/20 bg-gradient-to-br from-[#FFFDF9] via-[#F8F0E7] to-[#E8D7C4] p-5 shadow-xl shadow-[#6F4E32]/5 sm:p-8 dark:from-[#201B17] dark:via-[#171310] dark:to-[#2A211B]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#C99B66]/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-[#8E6D4E]/10 blur-3xl" />

          {/* หัวข้อ */}
          <div className="relative mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#8E6D4E]/20 bg-white/60 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#8E6D4E] dark:bg-black/10">
                <Sparkles size={11} />
                {copy.eyebrow}
              </div>

              <h2 className="font-serif text-2xl font-black text-[#4E3B2C] sm:text-3xl dark:text-[#F0DFCC]">
                {copy.title}
              </h2>

              <p className="mt-2 max-w-xl text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                {copy.subtitle}
              </p>
            </div>

            <select
              value={sortMode}
              onChange={(event) =>
                setSortMode(
                  event.target
                    .value as SortMode
                )
              }
              className="w-fit rounded-xl border border-[#8E6D4E]/20 bg-white/70 px-3 py-2 text-[10px] font-bold text-[#6F4E32] outline-none dark:bg-black/20 dark:text-stone-300"
            >
              <option value="most-reviewed">
                {copy.most}
              </option>

              <option value="highest-rated">
                {copy.highest}
              </option>
            </select>
          </div>

          {/* สถิติรวม */}
          <div className="relative mb-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              icon={
                <ShieldCheck size={16} />
              }
              value={verifiedReviews.length.toLocaleString()}
              label={copy.total}
            />

            <StatCard
              icon={
                <PackageOpen size={16} />
              }
              value={productGroups.length.toLocaleString()}
              label={copy.products}
            />

            <StatCard
              icon={
                <Star
                  size={16}
                  className="fill-current"
                />
              }
              value={overallAverage.toFixed(1)}
              label={copy.average}
            />
          </div>

          {/* กรณียังไม่มีรีวิว */}
          {productGroups.length === 0 ? (
            <div className="relative rounded-3xl border border-dashed border-[#8E6D4E]/25 bg-white/40 px-5 py-12 text-center dark:bg-black/10">
              <MessageSquareText
                className="mx-auto mb-3 text-[#8E6D4E]/50"
                size={30}
              />

              <p className="text-sm font-black text-[#4E3B2C] dark:text-stone-200">
                {copy.empty}
              </p>

              <p className="mx-auto mt-1 max-w-md text-[10px] leading-relaxed text-stone-400">
                {copy.emptyDesc}
              </p>
            </div>
          ) : (
            /* การ์ดสินค้าแยกตามรีวิว */
            <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {productGroups.map(
                (
                  {
                    product,
                    reviews:
                      productReviews,
                    average,
                    latestReview,
                  },
                  index
                ) => {
                  const translatedProduct =
                    getTranslatedProduct(
                      product,
                      lang
                    );

                  return (
                    <motion.article
                      key={product.id}
                      initial={{
                        opacity: 0,
                        y: 14,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.2,
                      }}
                      transition={{
                        delay: Math.min(
                          index * 0.04,
                          0.2
                        ),
                      }}
                      className="group overflow-hidden rounded-3xl border border-[#8E6D4E]/15 bg-white/80 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#8E6D4E]/35 hover:shadow-xl hover:shadow-[#6F4E32]/10 dark:bg-[#171310]/90"
                    >
                      {/* รูปสินค้า */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-stone-200 dark:bg-stone-900">
                        <img
                          src={
                            product.imageUrl
                          }
                          alt={
                            translatedProduct.name
                          }
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="line-clamp-1 font-serif text-sm font-black text-white">
                              {
                                translatedProduct.name
                              }
                            </h3>

                            <div className="mt-1 flex items-center gap-1 text-amber-400">
                              <Star
                                size={12}
                                className="fill-current"
                              />

                              <span className="text-[11px] font-black text-white">
                                {average.toFixed(
                                  1
                                )}
                              </span>

                              <span className="text-[9px] text-white/70">
                                (
                                {
                                  productReviews.length
                                }{" "}
                                {copy.reviews})
                              </span>
                            </div>
                          </div>

                          <span className="shrink-0 rounded-full border border-white/20 bg-black/35 px-2 py-1 text-[8px] font-black text-white backdrop-blur-md">
                            <BadgeCheck
                              size={9}
                              className="mr-1 inline text-emerald-300"
                            />

                            {copy.verified}
                          </span>
                        </div>
                      </div>

                      {/* รีวิวล่าสุด */}
                      <div className="p-4">
                        <div className="mb-3 flex items-start gap-2.5 rounded-2xl bg-[#8E6D4E]/5 p-3 dark:bg-white/[0.03]">
                          <Quote
                            size={14}
                            className="mt-0.5 shrink-0 text-[#B88A5E]"
                          />

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-[10px] font-black text-[#4E3B2C] dark:text-stone-200">
                                {
                                  latestReview.username
                                }
                              </span>

                              <BadgeCheck
                                size={11}
                                className="shrink-0 text-emerald-600"
                              />
                            </div>

                            <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-stone-500 dark:text-stone-400">
                              {
                                latestReview.comment
                              }
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedProduct(
                              product
                            )
                          }
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#8E6D4E]/20 px-3 py-2 text-[10px] font-black text-[#715437] transition hover:bg-[#8E6D4E] hover:text-white dark:text-[#E2C7A9]"
                        >
                          {copy.view}
                          <ArrowRight
                            size={12}
                          />
                        </button>
                      </div>
                    </motion.article>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>

      {/* หน้าต่างดูรีวิวของสินค้า */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/75 p-3 backdrop-blur-md sm:p-6"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setSelectedProduct(null);
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 18,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 12,
                scale: 0.98,
              }}
              className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-[#8E6D4E]/20 bg-[#FAF7F2] shadow-2xl dark:bg-[#171310]"
            >
              <div className="flex items-center justify-between border-b border-[#8E6D4E]/10 px-4 py-3.5 sm:px-6">
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#8E6D4E]">
                    {copy.modalTitle}
                  </p>

                  <h3 className="mt-0.5 truncate font-serif text-base font-black text-[#4E3B2C] dark:text-[#F0DFCC]">
                    {
                      getTranslatedProduct(
                        selectedProduct,
                        lang
                      ).name
                    }
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedProduct(null)
                  }
                  className="rounded-full bg-[#8E6D4E]/10 p-2 text-[#8E6D4E] transition hover:rotate-90 hover:bg-[#8E6D4E] hover:text-white"
                  aria-label="Close"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="overflow-y-auto p-4 sm:p-6">
                <VerifiedReviews
                  product={selectedProduct}
                  user={user}
                  reviews={reviews}
                  lang={lang}
                  onAddReview={
                    onAddReview
                  }
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#8E6D4E]/15 bg-white/55 p-3.5 backdrop-blur-sm dark:bg-black/10">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8E6D4E]/10 text-[#8E6D4E]">
        {icon}
      </div>

      <div>
        <p className="font-serif text-lg font-black leading-none text-[#4E3B2C] dark:text-[#F0DFCC]">
          {value}
        </p>

        <p className="mt-1 text-[8.5px] font-bold text-stone-400">
          {label}
        </p>
      </div>
    </div>
  );
}