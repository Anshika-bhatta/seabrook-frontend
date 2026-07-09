const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export interface Location {
  id: number;
  country: string;
  state: string;
  city: string;
  latitude: string;
  longitude: string;
  airport_code: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

export interface BookingLink {
  id: number;
  destination: number;
  provider: string;
  provider_display: string;
  label: string;
  booking_url: string;
  is_active: boolean;
  display_order: number;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
  description?: string;
}

export interface DestinationImage {
  id: number;
  image: string;
  caption: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
}

export interface Destination {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: Category;
  location: Location;
  latitude: string;
  longitude: string;
  address: string;
  image: string | null;
  website: string;
  is_featured: boolean;
  is_active: boolean;
  amenities?: Amenity[];
  gallery?: DestinationImage[];
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class ApiError extends Error {
  status: number;
  path: string;

  constructor(message: string, status: number, path: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
  }
}

async function fetchJSON<T>(
  path: string,
  options: { revalidateSeconds?: number; cache?: RequestCache } = {}
): Promise<T> {
  const { revalidateSeconds = 3600, cache } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...(cache ? { cache } : { next: { revalidate: revalidateSeconds } }),
  });

  if (!res.ok) {
    throw new ApiError(
      `API request failed: ${path} (${res.status})`,
      res.status,
      path
    );
  }

  return res.json();
}

export async function getDestinationsPage(params?: {
  category?: string;
  search?: string;
  page?: number;
  isFeatured?: boolean;
}): Promise<PaginatedResponse<Destination>> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.search) query.set("search", params.search);
  if (params?.page && params.page > 1) query.set("page", String(params.page));
  if (params?.isFeatured !== undefined) {
    query.set("is_featured", String(params.isFeatured));
  }

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return fetchJSON<PaginatedResponse<Destination>>(`/destinations/${queryString}`);
}

/**
 * Fetches every destination matching the given filters, following
 * pagination automatically. Use this for anything that needs the
 * complete set — geo-matching, the map view — never just page 1.
 */
export async function getAllDestinations(params?: {
  category?: string;
  search?: string;
  isFeatured?: boolean;
}): Promise<Destination[]> {
  const all: Destination[] = [];
  let page = 1;

  while (true) {
    const data = await getDestinationsPage({ ...params, page });
    all.push(...data.results);
    if (!data.next) break;
    page += 1;
  }

  return all;
}

/**
 * @deprecated Prefer getAllDestinations (full set) or getDestinationsPage
 * (single page with pagination metadata) depending on the use case.
 */
export async function getDestinations(params?: {
  category?: string;
  isFeatured?: boolean;
}): Promise<Destination[]> {
  return getAllDestinations(params);
}

export async function getDestinationBySlug(
  slug: string
): Promise<Destination> {
  return fetchJSON<Destination>(`/destinations/${slug}/`);
}

export async function getCategories(): Promise<Category[]> {
  const data = await fetchJSON<PaginatedResponse<Category>>("/categories/");
  return data.results;
}

export async function getLocations(): Promise<Location[]> {
  const data = await fetchJSON<PaginatedResponse<Location>>("/locations/");
  return data.results;
}

export async function getBookingLinksForDestination(
  destinationId: number
): Promise<BookingLink[]> {
  const data = await fetchJSON<PaginatedResponse<BookingLink>>(
    `/booking-links/?destination=${destinationId}&is_active=true`
  );
  return data.results;
}

export async function getLandingPageBySlug(slug: string) {
  return fetchJSON(`/landing-pages/${slug}/`);
}

export { ApiError };
