export type StreamSource = {
  url: string;
  quality: string | null;
  label: string | null;
  userAgent: string | null;
  referrer: string | null;
};

export type ChannelSummary = {
  id: string;
  name: string;
  country: string;
  countryName: string;
  countryNameLocal: string;
  flag: string;
  categories: string[];
  logo: string | null;
  quality: string | null;
  streamCount: number;
};

export type ChannelDetail = ChannelSummary & {
  altNames: string[];
  network: string | null;
  owners: string[];
  website: string | null;
  launched: string | null;
  streams: StreamSource[];
};

export type CountryMeta = {
  code: string;
  name: string;
  nameLocal: string;
  flag: string;
  count: number;
};

export type CategoryMeta = {
  id: string;
  name: string;
  nameLocal: string;
  count: number;
};

export type CatalogStats = {
  channels: number;
  countries: number;
  categories: number;
  streams: number;
  updatedAt: string;
};

export type ChannelQuery = {
  q?: string;
  country?: string;
  category?: string;
  ids?: string[];
  offset?: number;
  limit?: number;
};
