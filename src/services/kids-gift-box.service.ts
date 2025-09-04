import { pool } from '../config/database';
import { QueryResult } from 'pg';
import { CreateKidsGiftBoxInput, KidsGiftBox, UpdateKidsGiftBoxInput } from '../models';

export class KidsGiftBoxService {
  async getAllKidsGiftBoxes(): Promise<KidsGiftBox[]> {
    const query = 'SELECT * FROM kids_gift_boxes ORDER BY created_at DESC';
    const result: QueryResult<KidsGiftBox> = await pool.query(query);
    return result.rows;
  }

  async getKidsGiftBoxById(id: string): Promise<KidsGiftBox | null> {
    const query = 'SELECT * FROM kids_gift_boxes WHERE id = $1';
    const result: QueryResult<KidsGiftBox> = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async createKidsGiftBox(giftBoxData: CreateKidsGiftBoxInput): Promise<KidsGiftBox> {
    const query = `
      INSERT INTO kids_gift_boxes (title, price, box_contains, reviews_avg, description, images, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;
    const result: QueryResult<KidsGiftBox> = await pool.query(query, [
      giftBoxData.title,
      giftBoxData.price,
      giftBoxData.box_contains,
      giftBoxData.reviews_avg,
      giftBoxData.description,
      giftBoxData.images
    ]);
    return result.rows[0];
  }

  async updateKidsGiftBox(id: string, giftBoxData: UpdateKidsGiftBoxInput): Promise<KidsGiftBox | null> {
    const fieldMappings = {
      title: 'title',
      price: 'price',
      box_contains: 'box_contains',
      reviews_avg: 'reviews_avg',
      description: 'description',
      images: 'images'
    };

    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(giftBoxData).forEach(([key, value]) => {
      if (value !== undefined && fieldMappings[key as keyof typeof fieldMappings]) {
        updates.push(`${fieldMappings[key as keyof typeof fieldMappings]} = $${updates.length + 1}`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return this.getKidsGiftBoxById(id);
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const query = `
    UPDATE kids_gift_boxes 
    SET ${updates.join(', ')}
    WHERE id = $${values.length}
    RETURNING *
  `;

    const result: QueryResult<KidsGiftBox> = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteKidsGiftBox(id: string): Promise<boolean> {
    const query = 'DELETE FROM kids_gift_boxes WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}