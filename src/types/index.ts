// Types mirror supabase/schema.sql

export type ProductSize = "REG" | LRG;

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"
  | "expired";

export type AdminRole = "owner" | "cashier" | "barista";

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  /** REG price in rupiah */
  price: number;
  /** LRG price in rupiah, null = single size product */
  price_large: number | null;
  image_url: string | null;
  is_available: boolean;
  is_best_seller: boolean;
  stock_note: string | null;
  created_at: string;
};

export type Topping = {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
};

/** Topping snapshot stored in order_items.toppings */
export type OrderItemTopping = {
  id: string;
  name: string;
  price: number;
};

export type Order = {
  id: string;
  code: string;
  customer_name: string;
  customer_phone: string | null;
  table_no: string | null;
  note: string | null;
  total: number;
  status: OrderStatus;
  payment_method: string | null;
  payment_ref: string | null;
  paid_at: string | null;
  is_dummy: boolean;
  consent_at: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  size: ProductSize | null;
  toppings: OrderItemTopping[];
  /** Final unit price (size + toppings) */
  price: number;
  qty: number;
  note: string | null;
};

export type OrderWithItems = Order & { order_items: OrderItem[] };

export type Faq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
};

export type Review = {
  id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type PageView = {
  id: number;
  path: string;
  created_at: string;
};

export type AdminProfile = {
  id: string;
  name: string | null;
  role: AdminRole;
};

// site_content values (one shape per key)
export type HeroContent = { title: string; subtitle: string; cta_label: string };
export type PromoContent = { active: boolean; code: string; title: string; text: string };
export type AboutContent = { story: string; vision: string; mission: string[] };
export type DayHours = { open: string; close: string } | null;
export type OpeningHoursContent = {
  timezone: string;
  days: Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", DayHours>;
};
export type ContactContent = {
  mall: string;
  floor: string;
  unit: string;
  whatsapp: string;
  maps_query: string;
  lat: number | null;
  lng: number | null;
};
export type SocialContent = { instagram: string; whatsapp: string };

export type SiteContentMap = {
  hero: HeroContent;
  promo: PromoContent;
  about: AboutContent;
  opening_hours: OpeningHoursContent;
  contact: ContactContent;
  social: SocialContent;
};

export type SiteContentKey = keyof SiteContentMap;