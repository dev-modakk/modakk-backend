export type ProductCategory = 'GB' | 'TY' | 'BK' | 'GM' | 'CL' | 'AC';

export class DisplayIDService {
  private readonly PREFIX = 'MDK';

  /**
   * Generate a simple display ID without database dependency
   * Format: MDK-{category}{random6}
   * Example: MDK-GB4A2X1, MDK-TYB8X9M
   */
  generateDisplayID(category: ProductCategory = 'GB'): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let random = '';

    for (let i = 0; i < 6; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `${this.PREFIX}-${category}${random}`;
  }

  /**
   * Alternative: Time-based display ID (more readable)
   * Format: MDK-{category}-{yearMonth}{random3}
   * Example: MDK-GB-25I4A2, MDK-TY-25I8X9
   */
  generateTimeBasedDisplayID(category: ProductCategory = 'GB'): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String.fromCharCode(65 + date.getMonth()); // A=Jan, B=Feb, ..., L=Dec

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let random = '';

    for (let i = 0; i < 3; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `${this.PREFIX}-${category}-${year}${month}${random}`;
  }

  /**
   * Validate display ID format
   */
  isValidDisplayID(id: string): boolean {
    // Pattern: MDK-{category}{6 chars} or MDK-{category}-{year}{month}{3 chars}
    const simplePattern = /^MDK-[A-Z]{2}[A-Z0-9]{6}$/;
    const timeBasedPattern = /^MDK-[A-Z]{2}-\d{2}[A-L][A-Z0-9]{3}$/;

    return simplePattern.test(id) || timeBasedPattern.test(id);
  }
}

export const displayIdService = new DisplayIDService();
