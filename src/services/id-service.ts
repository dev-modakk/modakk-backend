import prisma from "../lib/prisma";

export type ProductCategory = 'GB' | 'TY' | 'BK' | 'GM' | 'CL' | 'AC';

interface CategoryConfig {
  code: ProductCategory;
  name: string;
  description: string;
}

export class IDService {
  private readonly PREFIX = 'MDK';

  // Category codes for different product types
  static readonly CATEGORIES: Record<string, CategoryConfig> = {
    GIFT_BOX: { code: 'GB', name: 'Gift Box', description: 'Kids gift boxes' },
    TOY: { code: 'TY', name: 'Toy', description: 'Individual toys' },
    BOOK: { code: 'BK', name: 'Book', description: 'Children books' },
    GAME: { code: 'GM', name: 'Game', description: 'Games and puzzles' },
    CLOTHING: { code: 'CL', name: 'Clothing', description: 'Kids clothing' },
    ACCESSORY: { code: 'AC', name: 'Accessory', description: 'Accessories' }
  };

  /**
   * Generate a unique ID for a product
   * Format: MDK-{category}-{year}{month}-{sequence}
   * Example: MDK-GB-24A-0001
   */
  async generateID(category: ProductCategory = 'GB'): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year
    const month = String.fromCharCode(65 + date.getMonth()); // A=Jan, B=Feb, ..., L=Dec
    const prefix = `${this.PREFIX}-${category}-${year}${month}`;

    // Find the highest sequence number for this prefix
    const lastItem = await prisma.kidsGiftBox.findFirst({
      where: {
        id: {
          startsWith: prefix
        }
      },
      orderBy: {
        id: 'desc'
      },
      select: {
        id: true
      }
    });

    let sequence = 1;
    if (lastItem?.id) {
      // Extract the sequence number from the last ID
      const parts = lastItem.id.split('-');
      const lastSequence = parseInt(parts[parts.length - 1] || '0', 10);
      sequence = isNaN(lastSequence) ? 1 : lastSequence + 1;
    }

    // Pad sequence to 4 digits
    const paddedSequence = sequence.toString().padStart(4, '0');
    const id = `${prefix}-${paddedSequence}`;

    // Verify uniqueness (defensive check)
    const exists = await prisma.kidsGiftBox.findUnique({
      where: { id },
      select: { id: true }
    });

    if (exists) {
      // If ID exists (shouldn't happen), try next sequence
      return this.generateID(category);
    }

    return id;
  }

  /**
   * Alternative: Generate using timestamp for guaranteed uniqueness
   * Format: MDK-{timestamp}-{random}
   * Example: MDK-1736241234567-8294
   */
  generateTimestampID(): string {
    const timestamp = Date.now(); // 13 digits
    const random = Math.floor(Math.random() * 10000); // 4 digits
    return `${this.PREFIX}-${timestamp}-${random.toString().padStart(4, '0')}`;
  }

  /**
   * Alternative: Generate short alphanumeric ID
   * Format: MDK-XXXXXXXX (8 random characters)
   * Example: MDK-B08X4N5V
   */
  async generateAlphanumericID(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let attempts = 0;

    while (attempts < 10) {
      let result = this.PREFIX + '-';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check if ID exists
      const exists = await prisma.kidsGiftBox.findUnique({
        where: { id: result },
        select: { id: true }
      });

      if (!exists) return result;
      attempts++;
    }

    // Fallback to timestamp if random generation fails
    return this.generateTimestampID();
  }

  /**
   * Validate ID format (for hybrid approach)
   */
  isValidID(id: string): boolean {
    // Pattern: MDK-XX-YYM-NNNN
    const hybridPattern = /^MDK-[A-Z]{2}-\d{2}[A-L]-\d{4}$/;
    // Pattern: MDK-XXXXXXXX (alphanumeric)
    const alphanumericPattern = /^MDK-[A-Z0-9]{8}$/;
    // Pattern: MDK-timestamp-random
    const timestampPattern = /^MDK-\d{13}-\d{4}$/;

    return hybridPattern.test(id) || alphanumericPattern.test(id) || timestampPattern.test(id);
  }

  /**
   * Parse ID components (for hybrid format)
   */
  parseID(id: string): {
    category?: string;
    year?: string;
    month?: string;
    sequence?: number;
    type: 'hybrid' | 'alphanumeric' | 'timestamp' | 'unknown';
  } | null {
    // Check hybrid format
    if (/^MDK-[A-Z]{2}-\d{2}[A-L]-\d{4}$/.test(id)) {
      const parts = id.split('-');
      const category = parts[1];
      const yearMonth = parts[2];
      const sequence = parseInt(parts[3], 10);

      const year = '20' + yearMonth.slice(0, 2);
      const monthLetter = yearMonth[2];
      const monthNumber = monthLetter.charCodeAt(0) - 65 + 1;

      return {
        category,
        year,
        month: monthNumber.toString().padStart(2, '0'),
        sequence,
        type: 'hybrid'
      };
    }

    // Check alphanumeric format
    if (/^MDK-[A-Z0-9]{8}$/.test(id)) {
      return { type: 'alphanumeric' };
    }

    // Check timestamp format
    if (/^MDK-\d{13}-\d{4}$/.test(id)) {
      return { type: 'timestamp' };
    }

    return { type: 'unknown' };
  }

  /**
   * Get category name from code
   */
  getCategoryName(code: ProductCategory): string {
    const category = Object.values(IDService.CATEGORIES).find(c => c.code === code);
    return category?.name || 'Unknown';
  }
}

export const idService = new IDService();
