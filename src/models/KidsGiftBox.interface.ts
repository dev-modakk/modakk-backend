export interface KidsGiftBox {
  id?: string;
  images: string[];
  title: string;
  price: string;
  box_contains: string;
  reviews_avg: number;
  description: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateKidsGiftBoxInput {
  images: string[];
  title: string;
  price: string;
  box_contains: string;
  reviews_avg: number;
  description: string;
}

export interface UpdateKidsGiftBoxInput {
  title?: string;
  price?: string;
  box_contains?: string;
  reviews_avg?: number;
  description?: string;
  images: string[]
}