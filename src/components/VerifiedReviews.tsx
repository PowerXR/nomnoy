import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BadgeCheck,
  CircleAlert,
  Clock3,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react";

import { motion } from "motion/react";
import { Product, Review, User } from "../types";
import { Language } from "../lib/translations";

interface VerifiedReviewsProps {
  product: Product;
  user: User | null;
  reviews: Review[];
  lang: Language;
  onAddReview: (
    productId: string,
    rating: number,
    comment: string
  ) => Promise<Review>;
}

interface ReviewEligibility {
  eligible: boolean;
  reasonCode: string;
  message: string;
  existingReview?: Review;
  purchaseDate?: string;
}

const ratingLabels: Record<
  number,
  {
    th: string;
    en: string;
    zh: string;
  }
> = {
  1: {
    th: "ควรปรับปรุง",
    en: "Needs improvement",
    zh: "需要改进",
  },
  2: {
    th: "พอใช้",
    en: "Fair",
    zh: "一般",
  },
  3: {
    th: "ดี",
    en: "Good",
    zh: "良好",
  },
  4: {
    th: "ดีมาก",
    en: "Very good",
    zh: "很好",
  },
  5: {
    th: "ประทับใจมาก",
    en: "Exceptional",
    zh: "非常满意",
  },
};

export default function VerifiedReviews({
  product,
  user,
  reviews,
  lang,
  onAddReview,
}: VerifiedReviewsProps) {
  const copy =
    lang === "zh"
      ? {
          verified: "已验证购买",
          score: "顾客评分",
          basedOn: "条真实购买评价",
          writeTitle: "分享您的真实体验",
          writeDesc:
            "系统已确认您购买并收到了此商品。",
          placeholder:
            "商品品质、包装和使用体验如何？",
          submit: "发布评价",
          submitting: "正在发布...",
          recent: "最新",
          highest: "高分优先",
          all: "全部",
          noReviews: "尚无已验证购买评价",
          noReviewsDesc:
            "购买并确认收货后，成为第一位评价者。",
          login:
            "登录后系统将自动检查您的购买资格。",
          count: "字符",
        }
      : lang === "en"
      ? {
          verified: "Verified purchase",
          score: "Customer score",
          basedOn: "verified reviews",
          writeTitle:
            "Share your genuine experience",
          writeDesc:
            "Your purchase and delivery have been verified.",
          placeholder:
            "How was the product quality, packaging and experience?",
          submit: "Publish review",
          submitting: "Publishing...",
          recent: "Most recent",
          highest: "Highest rated",
          all: "All",
          noReviews:
            "No verified reviews yet",
          noReviewsDesc:
            "Buy and confirm delivery to become the first reviewer.",
          login:
            "Sign in and we will automatically verify your purchase.",
          count: "characters",
        }
      : {
          verified: "ผู้ซื้อจริง",
          score: "คะแนนจากลูกค้า",
          basedOn: "รีวิวจากคำสั่งซื้อจริง",
          writeTitle:
            "แบ่งปันประสบการณ์จริงของคุณ",
          writeDesc:
            "ระบบยืนยันแล้วว่าคุณซื้อและได้รับสินค้าชิ้นนี้จริง",
          placeholder:
            "เล่าความรู้สึกเกี่ยวกับคุณภาพสินค้า บรรจุภัณฑ์ และประสบการณ์ที่ได้รับ...",
          submit: "เผยแพร่รีวิว",
          submitting: "กำลังเผยแพร่...",
          recent: "ล่าสุด",
          highest: "คะแนนสูงสุด",
          all: "ทั้งหมด",
          noReviews:
            "ยังไม่มีรีวิวจากผู้ซื้อจริง",
          noReviewsDesc:
            "ซื้อสินค้าและยืนยันรับของแล้ว มาเป็นคนแรกที่แบ่งปันประสบการณ์ได้เลย",
          login:
            "เข้าสู่ระบบ แล้วระบบจะตรวจสอบสิทธิ์จากคำสั่งซื้อให้อัตโนมัติ",
          count: "ตัวอักษร",
        };

  const [localReviews, setLocalReviews] =
    useState<Review[]>([]);

  const [eligibility, setEligibility] =
    useState<ReviewEligibility | null>(null);

  const [
    checkingEligibility,
    setCheckingEligibility,
  ] = useState(false);

  const [sortMode, setSortMode] = useState<
    "recent" | "highest"
  >("recent");

  const [ratingFilter, setRatingFilter] =
    useState<number | null>(null);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] =
    useState(0);

  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  useEffect(() => {
    setLocalReviews(
      reviews.filter(
        (review) =>
          review.productId === product.id
      )
    );
  }, [product.id, reviews]);

  useEffect(() => {
    let cancelled = false;

    const checkEligibility = async () => {
      if (!user) {
        setEligibility({
          eligible: false,
          reasonCode: "login_required",
          message: copy.login,
        });

        return;
      }

      const authToken =
        user.authToken ||
        localStorage.getItem("authToken");

      if (!authToken) {
        setEligibility({
          eligible: false,
          reasonCode: "session_required",
          message:
            lang === "th"
              ? "กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่หนึ่งครั้ง เพื่อเปิดการยืนยันผู้ซื้อจริง"
              : "Please sign out and sign in again to verify your purchase.",
        });

        return;
      }

      setCheckingEligibility(true);

      try {
        const response = await fetch(
          `/api/reviews/eligibility?productId=${encodeURIComponent(
            product.id
          )}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const data = await response.json();

        if (!cancelled) {
          setEligibility({
            eligible: Boolean(
              response.ok && data.eligible
            ),
            reasonCode:
              data.reasonCode || "unknown",
            message:
              data.message ||
              data.error ||
              "ไม่สามารถตรวจสอบสิทธิ์รีวิวได้",
            existingReview:
              data.existingReview,
            purchaseDate: data.purchaseDate,
          });
        }
      } catch {
        if (!cancelled) {
          setEligibility({
            eligible: false,
            reasonCode: "network_error",
            message:
              lang === "th"
                ? "ตรวจสอบสิทธิ์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
                : "Could not verify your purchase. Please try again.",
          });
        }
      } finally {
        if (!cancelled) {
          setCheckingEligibility(false);
        }
      }
    };

    setEligibility(null);
    checkEligibility();

    return () => {
      cancelled = true;
    };
  }, [
    product.id,
    user?.id,
    user?.authToken,
    lang,
  ]);

  const average = localReviews.length
    ? localReviews.reduce(
        (total, review) =>
          total + review.rating,
        0
      ) / localReviews.length
    : 0;

  const visibleReviews = useMemo(() => {
    const filtered = ratingFilter
      ? localReviews.filter(
          (review) =>
            review.rating === ratingFilter
        )
      : [...localReviews];

    return filtered.sort((a, b) =>
      sortMode === "highest"
        ? b.rating -
            a.rating ||
          Date.parse(b.date) -
            Date.parse(a.date)
        : Date.parse(b.date) -
          Date.parse(a.date)
    );
  }, [
    localReviews,
    ratingFilter,
    sortMode,
  ]);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const cleanComment = comment.trim();

    if (
      cleanComment.length < 5 ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const created = await onAddReview(
        product.id,
        rating,
        cleanComment
      );

      if (created) {
        setLocalReviews((current) => [
          created,
          ...current.filter(
            (item) =>
              item.id !== created.id
          ),
        ]);
      }

      setEligibility({
        eligible: false,
        reasonCode: "already_reviewed",
        message:
          lang === "th"
            ? "เผยแพร่รีวิวจากผู้ซื้อจริงเรียบร้อยแล้ว ขอบคุณที่แบ่งปันประสบการณ์ครับ"
            : "Your verified review has been published.",
        existingReview: created,
      });

      setComment("");
      setRating(5);
    } catch (error: any) {
      setSubmitError(
        error?.message ||
          "ไม่สามารถส่งรีวิวได้"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 py-1">
      {/* กล่องคะแนนเฉลี่ย */}
      <section className="relative overflow-hidden rounded-3xl border border-[#8E6D4E]/20 bg-gradient-to-br from-[#FFFDF9] via-[#F7EFE5] to-[#E8D7C4] p-4 shadow-sm dark:from-[#201B17] dark:via-[#181411] dark:to-[#2B211A]">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#B68A5A]/15 blur-2xl" />

        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-[0.85fr_1.15fr] sm:items-center">
          <div className="text-center sm:border-r sm:border-[#8E6D4E]/15 sm:pr-4">
            <div className="mb-1 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#8E6D4E]">
              <Sparkles size={11} />
              {copy.score}
            </div>

            <div className="font-serif text-5xl font-black leading-none text-[#4E3B2C] dark:text-[#F0DFCC]">
              {average.toFixed(1)}
            </div>

            <div className="mt-2 flex justify-center gap-0.5 text-amber-500">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <Star
                  key={index}
                  size={15}
                  className={
                    index <
                    Math.round(average)
                      ? "fill-current"
                      : "text-stone-300 dark:text-stone-700"
                  }
                />
              ))}
            </div>

            <p className="mt-1.5 text-[9.5px] font-medium text-stone-500 dark:text-stone-400">
              {localReviews.length}{" "}
              {copy.basedOn}
            </p>
          </div>

          {/* กราฟคะแนนดาว */}
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map(
              (score) => {
                const count =
                  localReviews.filter(
                    (review) =>
                      review.rating === score
                  ).length;

                const percentage =
                  localReviews.length
                    ? (count /
                        localReviews.length) *
                      100
                    : 0;

                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() =>
                      setRatingFilter(
                        ratingFilter === score
                          ? null
                          : score
                      )
                    }
                    className="group grid w-full grid-cols-[18px_1fr_24px] items-center gap-2 text-[9px] text-stone-500"
                  >
                    <span className="flex items-center gap-0.5 font-bold">
                      {score}
                      <Star
                        size={8}
                        className="fill-current text-amber-500"
                      />
                    </span>

                    <span className="h-1.5 overflow-hidden rounded-full bg-white/70 ring-1 ring-[#8E6D4E]/10 dark:bg-black/20">
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{
                          width: `${percentage}%`,
                        }}
                        className="block h-full rounded-full bg-gradient-to-r from-[#8E6D4E] to-[#D2A970]"
                      />
                    </span>

                    <span className="text-right font-mono text-[8px]">
                      {count}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* กำลังตรวจสอบสิทธิ์ */}
      {checkingEligibility ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#8E6D4E]/10 bg-white/60 p-4 text-[10px] text-stone-500 dark:bg-black/10">
          <Loader2
            size={14}
            className="animate-spin text-[#8E6D4E]"
          />

          กำลังตรวจสอบคำสั่งซื้อของคุณ...
        </div>
      ) : eligibility?.eligible ? (
        /* ฟอร์มเขียนรีวิว */
        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-3xl border border-emerald-600/20 bg-emerald-50/60 p-4 dark:bg-emerald-950/10"
        >
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-700/15">
              <BadgeCheck size={19} />
            </div>

            <div>
              <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                {copy.writeTitle}
              </h4>

              <p className="mt-0.5 text-[9.5px] leading-relaxed text-emerald-700/75 dark:text-emerald-400/75">
                {copy.writeDesc}
              </p>
            </div>
          </div>

          {/* เลือกดาว */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/70 px-3 py-2.5 dark:bg-black/15">
            <div
              className="flex gap-1"
              onMouseLeave={() =>
                setHoverRating(0)
              }
            >
              {[1, 2, 3, 4, 5].map(
                (score) => (
                  <button
                    key={score}
                    type="button"
                    onMouseEnter={() =>
                      setHoverRating(score)
                    }
                    onClick={() =>
                      setRating(score)
                    }
                    className="rounded-lg p-0.5 transition-transform hover:scale-125"
                    aria-label={`${score} stars`}
                  >
                    <Star
                      size={22}
                      className={
                        score <=
                        (hoverRating ||
                          rating)
                          ? "fill-current text-amber-500"
                          : "text-stone-300 dark:text-stone-700"
                      }
                    />
                  </button>
                )
              )}
            </div>

            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[9px] font-black text-amber-700 dark:text-amber-400">
              {ratingLabels[rating][lang]}
            </span>
          </div>

          <textarea
            value={comment}
            onChange={(event) =>
              setComment(
                event.target.value.slice(
                  0,
                  600
                )
              )
            }
            minLength={5}
            maxLength={600}
            rows={3}
            required
            placeholder={copy.placeholder}
            className="w-full resize-none rounded-2xl border border-[#8E6D4E]/15 bg-white px-3.5 py-3 text-[11px] leading-relaxed text-[#4E3B2C] outline-none transition focus:border-[#8E6D4E]/50 focus:ring-4 focus:ring-[#8E6D4E]/5 dark:bg-[#151210] dark:text-stone-200"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <span className="text-[8.5px] text-stone-400">
                {comment.length}/600{" "}
                {copy.count}
              </span>

              {submitError && (
                <p className="mt-1 text-[9px] font-bold text-red-500">
                  {submitError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                submitting ||
                comment.trim().length < 5
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6F4E32] to-[#9A714B] px-4 py-2 text-[10px] font-black text-white shadow-lg shadow-[#6F4E32]/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <Loader2
                  size={12}
                  className="animate-spin"
                />
              ) : (
                <MessageSquareText
                  size={12}
                />
              )}

              {submitting
                ? copy.submitting
                : copy.submit}
            </button>
          </div>
        </form>
      ) : (
        /* ข้อความเมื่อยังไม่มีสิทธิ์ */
        <div
          className={`flex items-start gap-3 rounded-2xl border p-3.5 ${
            eligibility?.reasonCode ===
            "already_reviewed"
              ? "border-emerald-600/15 bg-emerald-500/5"
              : "border-[#8E6D4E]/15 bg-white/60 dark:bg-black/10"
          }`}
        >
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
              eligibility?.reasonCode ===
              "already_reviewed"
                ? "bg-emerald-600/10 text-emerald-600"
                : "bg-[#8E6D4E]/10 text-[#8E6D4E]"
            }`}
          >
            {eligibility?.reasonCode ===
            "already_reviewed" ? (
              <ShieldCheck size={16} />
            ) : eligibility?.reasonCode ===
              "awaiting_delivery" ? (
              <Clock3 size={16} />
            ) : eligibility?.reasonCode ===
              "not_purchased" ? (
              <ShoppingBag size={16} />
            ) : (
              <CircleAlert size={16} />
            )}
          </div>

          <div>
            <p className="text-[10px] font-black text-[#4E3B2C] dark:text-stone-200">
              {eligibility?.reasonCode ===
              "already_reviewed"
                ? copy.verified
                : "ระบบรีวิวที่เชื่อถือได้"}
            </p>

            <p className="mt-0.5 text-[9.5px] leading-relaxed text-stone-500 dark:text-stone-400">
              {eligibility?.message ||
                copy.login}
            </p>
          </div>
        </div>
      )}

      {/* ตัวกรองรีวิว */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8E6D4E]/10 pb-2.5">
        <div className="flex gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() =>
              setRatingFilter(null)
            }
            className={`whitespace-nowrap rounded-full px-3 py-1 text-[9px] font-bold ${
              ratingFilter === null
                ? "bg-[#8E6D4E] text-white"
                : "bg-[#8E6D4E]/10 text-stone-500"
            }`}
          >
            {copy.all} (
            {localReviews.length})
          </button>

          {[5, 4, 3, 2, 1].map(
            (score) => (
              <button
                key={score}
                type="button"
                onClick={() =>
                  setRatingFilter(
                    ratingFilter === score
                      ? null
                      : score
                  )
                }
                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-bold ${
                  ratingFilter === score
                    ? "bg-amber-500 text-white"
                    : "bg-[#8E6D4E]/10 text-stone-500"
                }`}
              >
                {score} ★
              </button>
            )
          )}
        </div>

        <select
          value={sortMode}
          onChange={(event) =>
            setSortMode(
              event.target.value as
                | "recent"
                | "highest"
            )
          }
          className="rounded-xl border border-[#8E6D4E]/15 bg-transparent px-2.5 py-1 text-[9px] font-bold text-stone-500 outline-none"
        >
          <option value="recent">
            {copy.recent}
          </option>

          <option value="highest">
            {copy.highest}
          </option>
        </select>
      </div>

      {/* รายการรีวิว */}
      {visibleReviews.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#8E6D4E]/20 px-4 py-8 text-center">
          <MessageSquareText
            size={25}
            className="mx-auto mb-2 text-[#8E6D4E]/45"
          />

          <p className="text-[11px] font-black text-[#4E3B2C] dark:text-stone-200">
            {copy.noReviews}
          </p>

          <p className="mx-auto mt-1 max-w-xs text-[9.5px] leading-relaxed text-stone-400">
            {copy.noReviewsDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleReviews.map(
            (review, index) => (
              <motion.article
                key={review.id}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: Math.min(
                    index * 0.04,
                    0.2
                  ),
                }}
                className="rounded-2xl border border-[#8E6D4E]/10 bg-white p-3.5 shadow-sm dark:bg-[#151210]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B88A5E] to-[#60442F] text-xs font-black text-white shadow-sm">
                      {review.username
                        ?.charAt(0)
                        .toUpperCase() ||
                        "U"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[10.5px] font-black text-[#4E3B2C] dark:text-stone-200">
                        {review.username}
                      </p>

                      <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[7.5px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                        <BadgeCheck
                          size={9}
                        />

                        {copy.verified}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex justify-end gap-0.5 text-amber-500">
                      {Array.from({
                        length: 5,
                      }).map(
                        (_, starIndex) => (
                          <Star
                            key={
                              starIndex
                            }
                            size={10}
                            className={
                              starIndex <
                              review.rating
                                ? "fill-current"
                                : "text-stone-200 dark:text-stone-700"
                            }
                          />
                        )
                      )}
                    </div>

                    <time className="mt-1 block text-[8px] text-stone-400">
                      {new Date(
                        review.date
                      ).toLocaleDateString(
                        lang === "zh"
                          ? "zh-CN"
                          : lang === "en"
                          ? "en-US"
                          : "th-TH",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </time>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-line text-[10.5px] leading-relaxed text-stone-600 dark:text-stone-400">
                  {review.comment}
                </p>
              </motion.article>
            )
          )}
        </div>
      )}
    </div>
  );
}