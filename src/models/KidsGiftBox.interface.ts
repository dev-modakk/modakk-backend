export interface KidsGiftBox {
  id?: number;
  title: string;
  price: string;
  box_contains: string;
  reviews_avg: number;
  description: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateKidsGiftBoxInput {
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
}