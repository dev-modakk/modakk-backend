import { pool } from '../config/database';

import { QueryResult } from 'pg';
import { CreateKidsGiftBoxInput, KidsGiftBox, UpdateKidsGiftBoxInput } from '../models';

export class KidsGiftBoxService {
  async getAllKidsGiftBoxes(): Promise<KidsGiftBox[]> {
    const query = 'SELECT * FROM kids_gift_boxes ORDER BY created_at DESC';
    const result: QueryResult<KidsGiftBox> = await pool.query(query);
    return result.rows;
  }

  async getKidsGiftBoxById(id: number): Promise<KidsGiftBox | null> {
    const query = 'SELECT * FROM kids_gift_boxes WHERE id = $1';
    const result: QueryResult<KidsGiftBox> = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async createKidsGiftBox(giftBoxData: CreateKidsGiftBoxInput): Promise<KidsGiftBox> {
    const query = `
      INSERT INTO kids_gift_boxes (title, price, box_contains, reviews_avg, description, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    const result: QueryResult<KidsGiftBox> = await pool.query(query, [
      giftBoxData.title,
      giftBoxData.price,
      giftBoxData.box_contains,
      giftBoxData.reviews_avg,
      giftBoxData.description,
    ]);
    return result.rows[0];
  }

  async updateKidsGiftBox(id: number, giftBoxData: UpdateKidsGiftBoxInput): Promise<KidsGiftBox | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (giftBoxData.title !== undefined) {
      fields.push(`title = $${paramCount}`);
      values.push(giftBoxData.title);
      paramCount++;
    }

    if (giftBoxData.price !== undefined) {
      fields.push(`price = $${paramCount}`);
      values.push(giftBoxData.price);
      paramCount++;
    }

    if (giftBoxData.box_contains !== undefined) {
      fields.push(`box_contains = $${paramCount}`);
      values.push(giftBoxData.box_contains);
      paramCount++;
    }

    if (giftBoxData.reviews_avg !== undefined) {
      fields.push(`reviews_avg = $${paramCount}`);
      values.push(giftBoxData.reviews_avg);
      paramCount++;
    }

    if (giftBoxData.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(giftBoxData.description);
      paramCount++;
    }

    if (fields.length === 0) {
      const existingGiftBox = await this.getKidsGiftBoxById(id);
      return existingGiftBox;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE kids_gift_boxes 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result: QueryResult<KidsGiftBox> = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteKidsGiftBox(id: number): Promise<boolean> {
    const query = 'DELETE FROM kids_gift_boxes WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}