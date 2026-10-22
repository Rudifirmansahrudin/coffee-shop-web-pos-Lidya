export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface MenuProduct {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  price_large: number | null;
  image_url: string | null;
  is_available: boolean;
  is_best_seller: boolean;
  stock_note: string | null;
}

export interface MenuTopping {
  id: string;
  name: string;
  price: number;
}