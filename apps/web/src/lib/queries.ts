import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

type BusinessRow = Tables<"businesses">;
type ReviewRow = Tables<"reviews">;
type ServiceRow = Tables<"services">;

export type SalonSummary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  tier: "standard" | "premium";
  city: string;
  neighborhood: string | null;
  address: string;
  coverUrl: string | null;
  rating: number | null;
  reviewCount: number;
  priceFromCents: number | null;
};

type ReviewAggregate = {
  business_id: string;
  rating_avg: number;
  rating_count: number;
};

function reviewStats(
  reviews: Array<{ business_id: string; rating: number; published: boolean }>,
): Map<string, ReviewAggregate> {
  const m = new Map<string, { sum: number; count: number }>();
  for (const r of reviews) {
    if (!r.published) continue;
    const cur = m.get(r.business_id) ?? { sum: 0, count: 0 };
    cur.sum += r.rating;
    cur.count += 1;
    m.set(r.business_id, cur);
  }
  const out = new Map<string, ReviewAggregate>();
  for (const [business_id, { sum, count }] of m) {
    out.set(business_id, {
      business_id,
      rating_avg: Math.round((sum / count) * 10) / 10,
      rating_count: count,
    });
  }
  return out;
}

function minPrice(
  services: Array<{ business_id: string; price_cents: number; active: boolean }>,
): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of services) {
    if (!s.active) continue;
    const cur = m.get(s.business_id);
    if (cur === undefined || s.price_cents < cur) m.set(s.business_id, s.price_cents);
  }
  return m;
}

/**
 * List every published salon with rating + price-from rollups, ready for the
 * marketplace cards. Cached per request so the Home page can call it without
 * worrying about repeat trips.
 */
export const listSalons = cache(async (): Promise<SalonSummary[]> => {
  const supabase = await createSupabaseServerClient();

  const [biz, reviews, services] = await Promise.all([
    supabase
      .from("businesses")
      .select("*")
      .not("published_at", "is", null)
      .order("tier", { ascending: false })
      .order("name", { ascending: true }),
    supabase.from("reviews").select("*"),
    supabase.from("services").select("*"),
  ]);

  if (biz.error) throw biz.error;
  if (reviews.error) throw reviews.error;
  if (services.error) throw services.error;

  const businesses = (biz.data ?? []) as BusinessRow[];
  const ratings = reviewStats((reviews.data ?? []) as ReviewRow[]);
  const prices = minPrice((services.data ?? []) as ServiceRow[]);

  return businesses.map((b): SalonSummary => {
    const r = ratings.get(b.id);
    return {
      id: b.id,
      slug: b.slug,
      name: b.name,
      description: b.description,
      tier: (b.tier === "premium" ? "premium" : "standard") as SalonSummary["tier"],
      city: b.city,
      neighborhood: b.neighborhood,
      address: b.address,
      coverUrl: b.cover_url,
      rating: r ? r.rating_avg : null,
      reviewCount: r ? r.rating_count : 0,
      priceFromCents: prices.get(b.id) ?? null,
    };
  });
});

export function formatPriceFrom(cents: number | null): string | null {
  if (cents === null) return null;
  return `${Math.round(cents / 100)}€`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Salon detail
// ─────────────────────────────────────────────────────────────────────────────

export type ServiceItem = {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  bufferAfterMin: number;
  priceCents: number;
  category: string | null;
};

export type StaffItem = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: "owner" | "staff";
  bio: string | null;
  sortOrder: number;
};

export type WeeklyHourItem = {
  weekday: number; // 0 = Monday … 6 = Sunday
  startsAt: string; // "HH:MM:SS"
  endsAt: string;
};

export type ReviewItem = {
  id: string;
  reviewerName: string;
  rating: number;
  body: string | null;
  createdAt: string;
};

export type SalonDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  tier: "standard" | "premium";
  city: string;
  neighborhood: string | null;
  address: string;
  coverUrl: string | null;
  phoneE164: string | null;
  email: string | null;
  vatId: string | null;
  rating: number | null;
  reviewCount: number;
  priceFromCents: number | null;
  services: ServiceItem[];
  staff: StaffItem[];
  weeklyHours: WeeklyHourItem[];
  reviews: ReviewItem[];
};

type MemberRow = Tables<"business_members">;
type WeeklyHourRow = Tables<"weekly_hours">;

export const getSalonBySlug = cache(
  async (slug: string): Promise<SalonDetail | null> => {
    const supabase = await createSupabaseServerClient();

    const biz = await supabase
      .from("businesses")
      .select("*")
      .eq("slug", slug)
      .not("published_at", "is", null)
      .maybeSingle();

    if (biz.error) throw biz.error;
    if (!biz.data) return null;

    const business = biz.data as BusinessRow;

    const [servicesRes, membersRes, hoursRes, reviewsRes] = await Promise.all([
      supabase.from("services").select("*").eq("business_id", business.id),
      supabase.from("business_members").select("*").eq("business_id", business.id),
      supabase.from("weekly_hours").select("*").eq("business_id", business.id),
      supabase.from("reviews").select("*").eq("business_id", business.id),
    ]);

    if (servicesRes.error) throw servicesRes.error;
    if (membersRes.error) throw membersRes.error;
    if (hoursRes.error) throw hoursRes.error;
    if (reviewsRes.error) throw reviewsRes.error;

    const services = ((servicesRes.data ?? []) as ServiceRow[])
      .filter((s) => s.active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(
        (s): ServiceItem => ({
          id: s.id,
          name: s.name,
          description: s.description,
          durationMin: s.duration_min,
          bufferAfterMin: s.buffer_after_min,
          priceCents: s.price_cents,
          category: s.category,
        }),
      );

    const staff = ((membersRes.data ?? []) as MemberRow[])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(
        (m): StaffItem => ({
          userId: m.user_id,
          displayName: m.display_name,
          avatarUrl: m.avatar_url,
          role: (m.role === "owner" ? "owner" : "staff") as StaffItem["role"],
          bio: m.bio,
          sortOrder: m.sort_order,
        }),
      );

    const weeklyHours = ((hoursRes.data ?? []) as WeeklyHourRow[])
      .filter((h) => h.user_id === null) // business-wide hours only
      .sort((a, b) => a.weekday - b.weekday)
      .map(
        (h): WeeklyHourItem => ({
          weekday: h.weekday,
          startsAt: h.starts_at,
          endsAt: h.ends_at,
        }),
      );

    const allReviews = ((reviewsRes.data ?? []) as ReviewRow[]).filter(
      (r) => r.published,
    );
    const reviews = allReviews
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .map(
        (r): ReviewItem => ({
          id: r.id,
          reviewerName: r.reviewer_name,
          rating: r.rating,
          body: r.body,
          createdAt: r.created_at,
        }),
      );

    const ratingSum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const ratingAvg =
      allReviews.length > 0
        ? Math.round((ratingSum / allReviews.length) * 10) / 10
        : null;

    const activePrices = services.map((s) => s.priceCents);
    const priceFromCents = activePrices.length > 0 ? Math.min(...activePrices) : null;

    return {
      id: business.id,
      slug: business.slug,
      name: business.name,
      description: business.description,
      tier: (business.tier === "premium" ? "premium" : "standard") as SalonDetail["tier"],
      city: business.city,
      neighborhood: business.neighborhood,
      address: business.address,
      coverUrl: business.cover_url,
      phoneE164: business.phone_e164,
      email: business.email,
      vatId: business.vat_id,
      rating: ratingAvg,
      reviewCount: allReviews.length,
      priceFromCents,
      services,
      staff,
      weeklyHours,
      reviews,
    };
  },
);

/** Stable list of seeded slugs — used by generateStaticParams. */
export const listSalonSlugs = cache(async (): Promise<string[]> => {
  const supabase = await createSupabaseServerClient();
  const res = await supabase
    .from("businesses")
    .select("*")
    .not("published_at", "is", null);
  if (res.error) throw res.error;
  const rows = (res.data ?? []) as BusinessRow[];
  return rows.map((row) => row.slug);
});

/** Format service duration: "45 min" / "1 h 30 min". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** Format price in EUR with no decimals (e.g. "42 €"). */
export function formatPrice(cents: number): string {
  return `${Math.round(cents / 100)} €`;
}
