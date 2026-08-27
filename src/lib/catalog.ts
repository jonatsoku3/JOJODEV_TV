import { categoryName, countryName } from "@/lib/i18n";
import { logoPath } from "@/lib/signing";
import type {
  CatalogStats,
  CategoryMeta,
  ChannelDetail,
  ChannelQuery,
  ChannelSummary,
  CountryMeta,
  StreamSource,
} from "@/lib/types";

const API = {
  channels: "https://iptv-org.github.io/api/channels.json",
  streams: "https://iptv-org.github.io/api/streams.json",
  countries: "https://iptv-org.github.io/api/countries.json",
  categories: "https://iptv-org.github.io/api/categories.json",
  logos: "https://iptv-org.github.io/api/logos.json",
};

type RawChannel = {
  id: string;
  name: string;
  alt_names?: string[];
  network?: string | null;
  owners?: string[];
  country: string;
  categories?: string[];
  is_nsfw?: boolean;
  launched?: string | null;
  closed?: string | null;
  replaced_by?: string | null;
  website?: string | null;
};

type RawStream = {
  channel?: string | null;
  url?: string | null;
  quality?: string | null;
  label?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
};

type RawCountry = { name: string; code: string; flag: string };
type RawCategory = { id: string; name: string };
type RawLogo = {
  channel?: string | null;
  url?: string | null;
  in_use?: boolean;
  width?: number;
  height?: number;
  format?: string | null;
};

type StoredChannel = ChannelDetail;

export type Catalog = {
  channels: StoredChannel[];
  byId: Map<string, StoredChannel>;
  countries: CountryMeta[];
  categories: CategoryMeta[];
  stats: CatalogStats;
};

const PINNED_COUNTRIES = [
  "TH",
  "ID",
  "JP",
  "KR",
  "VN",
  "MY",
  "SG",
  "CN",
  "TW",
  "HK",
  "PH",
  "LA",
  "KH",
  "MM",
  "US",
  "UK",
  "IN",
  "AU",
];

function countryPinRank(code: string) {
  const index = PINNED_COUNTRIES.indexOf(code);
  return index === -1 ? PINNED_COUNTRIES.length + 1 : index;
}

const TTL_MS = 45 * 60 * 1000;
let cache: { at: number; data: Catalog } | null = null;
let inflight: Promise<Catalog> | null = null;

function qualityScore(q: string | null) {
  if (!q) return 0;
  const n = parseInt(q, 10);
  if (Number.isFinite(n)) return n;
  const key = q.toUpperCase();
  if (key.includes("UHD") || key.includes("4K")) return 2160;
  if (key.includes("FHD") || key.includes("1080")) return 1080;
  if (key.includes("HD") || key.includes("720")) return 720;
  if (key.includes("SD")) return 480;
  return 0;
}

function sortStreams(streams: StreamSource[]) {
  const ranked = [...streams].sort((a, b) => {
    const quality = qualityScore(b.quality) - qualityScore(a.quality);
    if (quality) return quality;
    return Number(b.url.startsWith("https://")) - Number(a.url.startsWith("https://"));
  });
  const seen = new Set<string>();
  const unique: StreamSource[] = [];
  for (const stream of ranked) {
    if (seen.has(stream.url)) continue;
    seen.add(stream.url);
    unique.push(stream);
  }
  return unique;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(60000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return (await res.json()) as T;
}

function pickLogos(logos: RawLogo[]) {
  const best = new Map<string, { url: string; score: number }>();
  for (const logo of logos) {
    if (!logo.channel || !logo.url) continue;
    if (!/^https?:\/\//i.test(logo.url)) continue;
    let score = 0;
    if (logo.in_use) score += 1000;
    const width = logo.width || 256;
    if (width >= 64 && width <= 512) score += 220;
    else if (width > 512) score += Math.max(40, 220 - (width - 512) / 6);
    else score += width / 2;
    const format = (logo.format || "").toUpperCase();
    if (format === "SVG") score += 140;
    if (format === "PNG" || format === "WEBP") score += 50;
    const host = logo.url.toLowerCase();
    if (host.includes("imgur.com") || host.includes("i.ibb.co")) score -= 850;
    const prev = best.get(logo.channel);
    if (!prev || score > prev.score) best.set(logo.channel, { url: logo.url, score });
  }
  const urls = new Map<string, string>();
  for (const [id, value] of best) urls.set(id, value.url);
  return urls;
}

function toSummary(channel: StoredChannel): ChannelSummary {
  return {
    id: channel.id,
    name: channel.name,
    country: channel.country,
    countryName: channel.countryName,
    countryNameLocal: channel.countryNameLocal,
    flag: channel.flag,
    categories: channel.categories,
    logo: channel.logo ? logoPath(channel.logo) : null,
    quality: channel.quality,
    streamCount: channel.streamCount,
  };
}

async function buildCatalog(): Promise<Catalog> {
  const [channels, streams, countries, categories, logos] = await Promise.all([
    fetchJson<RawChannel[]>(API.channels),
    fetchJson<RawStream[]>(API.streams),
    fetchJson<RawCountry[]>(API.countries),
    fetchJson<RawCategory[]>(API.categories),
    fetchJson<RawLogo[]>(API.logos),
  ]);

  const countryByCode = new Map(countries.map((c) => [c.code, c]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const logoByChannel = pickLogos(logos);

  const streamsByChannel = new Map<string, StreamSource[]>();
  for (const stream of streams) {
    if (!stream.channel || !stream.url) continue;
    if (!/^https?:\/\//i.test(stream.url)) continue;
    const list = streamsByChannel.get(stream.channel) ?? [];
    list.push({
      url: stream.url,
      quality: stream.quality ?? null,
      label: stream.label ?? null,
      userAgent: stream.user_agent ?? null,
      referrer: stream.referrer ?? null,
    });
    streamsByChannel.set(stream.channel, list);
  }

  const stored: StoredChannel[] = [];
  const countryCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  let streamTotal = 0;

  for (const channel of channels) {
    if (!channel.id || channel.is_nsfw || channel.closed || channel.replaced_by) continue;
    const rawStreams = streamsByChannel.get(channel.id);
    if (!rawStreams?.length) continue;
    const country = countryByCode.get(channel.country);
    const sorted = sortStreams(rawStreams);
    const cats = (channel.categories || []).filter(Boolean);
    const record: StoredChannel = {
      id: channel.id,
      name: channel.name,
      altNames: channel.alt_names || [],
      country: channel.country,
      countryName: country?.name || channel.country,
      countryNameLocal: countryName(channel.country, country?.name || channel.country),
      flag: country?.flag || "🏳️",
      categories: cats,
      logo: logoByChannel.get(channel.id) ?? null,
      quality: sorted[0]?.quality ?? null,
      streamCount: sorted.length,
      network: channel.network ?? null,
      owners: channel.owners || [],
      website: channel.website ?? null,
      launched: channel.launched ?? null,
      streams: sorted,
    };
    stored.push(record);
    streamTotal += sorted.length;
    countryCounts.set(channel.country, (countryCounts.get(channel.country) || 0) + 1);
    for (const cat of cats) {
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    }
  }

  stored.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

  const byId = new Map(stored.map((c) => [c.id, c]));

  const countryMeta: CountryMeta[] = [...countryCounts.entries()]
    .map(([code, count]) => {
      const raw = countryByCode.get(code);
      return {
        code,
        name: raw?.name || code,
        nameLocal: countryName(code, raw?.name || code),
        flag: raw?.flag || "🏳️",
        count,
      };
    })
    .sort(
      (a, b) =>
        countryPinRank(a.code) - countryPinRank(b.code) ||
        b.count - a.count ||
        a.nameLocal.localeCompare(b.nameLocal, "th")
    );

  const categoryMeta: CategoryMeta[] = [...categoryCounts.entries()]
    .map(([id, count]) => {
      const raw = categoryById.get(id);
      return {
        id,
        name: raw?.name || id,
        nameLocal: categoryName(id, raw?.name || id),
        count,
      };
    })
    .sort((a, b) => b.count - a.count || a.nameLocal.localeCompare(b.nameLocal, "th"));

  return {
    channels: stored,
    byId,
    countries: countryMeta,
    categories: categoryMeta,
    stats: {
      channels: stored.length,
      countries: countryMeta.length,
      categories: categoryMeta.length,
      streams: streamTotal,
      updatedAt: new Date().toISOString(),
    },
  };
}

export async function getCatalog(): Promise<Catalog> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  if (!inflight) {
    inflight = buildCatalog()
      .then((data) => {
        cache = { at: Date.now(), data };
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  try {
    return await inflight;
  } catch (error) {
    if (cache) return cache.data;
    throw error;
  }
}

export function summarize(channel: StoredChannel): ChannelSummary {
  return toSummary(channel);
}

export function queryChannels(catalog: Catalog, query: ChannelQuery) {
  const limit = Math.min(Math.max(query.limit ?? 48, 1), 96);
  const offset = Math.max(query.offset ?? 0, 0);
  const q = query.q?.trim().toLowerCase();
  const ids = query.ids?.filter(Boolean);

  if (ids?.length) {
    const items = ids.map((id) => catalog.byId.get(id)).filter((c): c is StoredChannel => Boolean(c));
    return {
      items: items.map(summarize),
      total: items.length,
      offset: 0,
      limit: items.length,
    };
  }

  let items = catalog.channels;
  if (query.country) {
    const code = query.country.toUpperCase();
    items = items.filter((c) => c.country === code);
  }
  if (query.category) {
    const category = query.category;
    items = items.filter((c) => c.categories.includes(category));
  }
  if (q) {
    items = items.filter((c) => {
      if (c.name.toLowerCase().includes(q)) return true;
      if (c.countryName.toLowerCase().includes(q)) return true;
      if (c.countryNameLocal.toLowerCase().includes(q)) return true;
      if (c.altNames.some((n) => n.toLowerCase().includes(q))) return true;
      if (c.categories.some((cat) => cat.toLowerCase().includes(q) || categoryName(cat, cat).includes(q))) {
        return true;
      }
      return false;
    });
  }

  const total = items.length;
  const page = items.slice(offset, offset + limit).map(summarize);
  return { items: page, total, offset, limit };
}

export function decodeChannelParam(id: string) {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

export function getChannel(catalog: Catalog, id: string) {
  return catalog.byId.get(decodeChannelParam(id)) ?? catalog.byId.get(id) ?? null;
}

export function relatedChannels(catalog: Catalog, channel: StoredChannel, limit = 12) {
  const sameCountry = catalog.channels.filter(
    (c) => c.id !== channel.id && c.country === channel.country
  );
  const picked = sameCountry.slice(0, limit);
  if (picked.length >= limit) return picked.map(summarize);
  const cats = new Set(channel.categories);
  const extra = catalog.channels.filter(
    (c) => c.id !== channel.id && c.country !== channel.country && c.categories.some((cat) => cats.has(cat))
  );
  return [...picked, ...extra].slice(0, limit).map(summarize);
}

const HERO_IDS = [
  "ThaiPBS.th",
  "Channel7.th",
  "Channel5.th",
  "NBT2HD.th",
  "NationTV.th",
  "NHKWorldJapan.jp",
  "ArirangTV.kr",
];

export function getFeatured(catalog: Catalog) {
  const byCountry = (code: string, limit = 18) =>
    catalog.channels.filter((c) => c.country === code).slice(0, limit).map(summarize);
  const byCategory = (id: string, limit = 18) =>
    catalog.channels.filter((c) => c.categories.includes(id)).slice(0, limit).map(summarize);

  const hero =
    HERO_IDS.map((id) => catalog.byId.get(id)).find(Boolean) ||
    catalog.channels.find((c) => c.country === "TH") ||
    catalog.channels[0] ||
    null;

  return {
    hero: hero ? summarize(hero) : null,
    rows: [
      { key: "th", title: "ทีวีไทย", href: "/country/TH", items: byCountry("TH") },
      { key: "news", title: "ข่าวทั่วโลก", href: "/category/news", items: byCategory("news") },
      { key: "sports", title: "กีฬา", href: "/category/sports", items: byCategory("sports") },
      { key: "jp", title: "ทีวีญี่ปุ่น", href: "/country/JP", items: byCountry("JP") },
      { key: "kr", title: "ทีวีเกาหลี", href: "/country/KR", items: byCountry("KR") },
      {
        key: "entertainment",
        title: "บันเทิง",
        href: "/category/entertainment",
        items: byCategory("entertainment"),
      },
      { key: "us", title: "ทีวีสหรัฐฯ", href: "/country/US", items: byCountry("US") },
      { key: "music", title: "เพลง", href: "/category/music", items: byCategory("music") },
      { key: "id", title: "ทีวีอินโดนีเซีย", href: "/country/ID", items: byCountry("ID") },
      {
        key: "documentary",
        title: "สารคดี",
        href: "/category/documentary",
        items: byCategory("documentary"),
      },
      {
        key: "education",
        title: "การศึกษา",
        href: "/category/education",
        items: byCategory("education"),
      },
    ].filter((row) => row.items.length > 0),
  };
}
