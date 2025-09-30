
import { Request, Response } from "express";
import multer from "multer";
import ExcelJS from "exceljs";
import { Options as CsvOptions } from "csv-parser";
import * as path from "path";
import csv from "csv-parser";
import prisma from "../lib/prisma";
import { displayIdService } from "../services/display-id-service";
import { z } from "zod";
import { Readable } from "stream";

const bulkImportRowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.union([
    z.number().positive(),
    z.string().transform(val => {
      const n = Number(val);
      if (!Number.isFinite(n) || n <= 0) throw new Error('price must be a positive number');
      return n;
    })
  ]),
  image: z.any().transform(val => {
    console.log('Transforming image value:', val, 'type:', typeof val);
    if (typeof val === 'string') {
      return val.trim();
    }
    if (val && typeof val === 'object' && typeof val.url === 'string') return val.url.trim();
    return '';
  }).refine(val => {
    if (val === '') return false; // Don't allow empty images
    // Accept any valid URL format (including ImageKit URLs)
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, {
    message: 'image must be a valid URL',
  }),
  badge: z.string().max(50).optional().nullable(),
  rating: z.union([
    z.number().min(0).max(5),
    z.string().transform(val => {
      const n = Number(val);
      if (!Number.isFinite(n) || n < 0 || n > 5) throw new Error('rating must be between 0 and 5');
      return n;
    })
  ]),
  reviews: z.union([
    z.number().int().min(0),
    z.string().transform(val => {
      const n = Number(val);
      if (!Number.isInteger(n) || n < 0) throw new Error('reviews must be a non-negative integer');
      return n;
    })
  ]).optional().default(0),
  isWishlisted: z
    .union([
      z.boolean(),
      z.string().transform(val => ['true', '1'].includes(val?.toLowerCase?.() ?? '')),
    ])
    .optional()
    .default(false),

  isSoldOut: z
    .union([
      z.boolean(),
      z.string().transform(val => ['true', '1'].includes(val?.toLowerCase?.() ?? '')),
    ])
    .optional()
    .default(false),
  category: z.enum(['GB', 'TY', 'BK', 'GM', 'CL', 'AC']).optional().default('GB'),
  images: z.string().optional().transform(val => {
    if (!val) return [];
    return val.split(/[,;|]/).map(url => url.trim()).filter(url => url.length > 0);
  })
});


const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream' // Sometimes Excel files come as this
    ];

    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    data?: any;
    error: string;
  }>;
  imported: Array<{
    row: number;
    id: string;
    name: string;
  }>;
  duration: number;
}

export const bulkImportMiddleware = upload.single('file');

export async function bulkImportKidsGiftBoxes(req: Request, res: Response) {
  const startTime = Date.now();

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const result: ImportResult = {
    success: false,
    totalRows: 0,
    successCount: 0,
    errorCount: 0,
    errors: [],
    imported: [],
    duration: 0
  };

  try {
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let data: any[] = [];

    if (fileExtension === '.csv') {
      data = await parseCSV(req.file.buffer);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      data = await parseExcel(req.file.buffer);
    } else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }

    if (data.length === 0) {
      return res.status(400).json({ message: 'File is empty or has no valid data' });
    }

    result.totalRows = data.length;

    const BATCH_SIZE = 100;
    const batches = [];

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      batches.push(data.slice(i, i + BATCH_SIZE));
    }

    let rowIndex = 0;

    for (const batch of batches) {
      const promises = batch.map(async (row, batchIndex) => {
        const currentRow = rowIndex + batchIndex + 2;

        try {
          // Normalize field names (handle different cases and spaces)
          const normalizedRow = normalizeRowKeys(row);

          // Validate row data
          const validated = bulkImportRowSchema.parse(normalizedRow);

          // Generate display ID for human-readable reference
          const displayId = displayIdService.generateTimeBasedDisplayID(validated.category as any);

          // Ensure image is always a string URL
          let imageUrl = validated.image;
          if (imageUrl && typeof imageUrl === 'object') {
            const maybeObj = imageUrl as any;
            if ('url' in maybeObj && typeof maybeObj.url === 'string') {
              imageUrl = maybeObj.url;
            } else {
              imageUrl = '';
            }
          }

          const created = await prisma.kidsGiftBox.create({
            data: {
              displayId, // Human-readable display ID
              name: validated.name,
              description: validated.description,
              priceInINR: validated.price,
              image: imageUrl,
              badge: validated.badge || null,
              rating: validated.rating,
              reviews: validated.reviews || 0,
              isWishlisted: validated.isWishlisted || false,
              isSoldOut: validated.isSoldOut || false,
              images: validated.images || [],
              category: validated.category || 'GB'
            } as any // Temporary type assertion - CUID generation works at runtime  
          });

          result.successCount++;
          result.imported.push({
            row: currentRow,
            id: created.id,
            name: created.name
          });

        } catch (error: any) {
          result.errorCount++;

          let errorMessage = 'Unknown error';
          if (error instanceof z.ZodError) {
            errorMessage = error.issues
              .map(i => `${i.path.join('.')}: ${i.message}`)
              .join(', ');
          } else if (error?.message) {
            errorMessage = error.message;
          }

          result.errors.push({
            row: currentRow,
            data: row,
            error: errorMessage
          });
        }
      });

      await Promise.all(promises);
      rowIndex += batch.length;
    }

    result.success = result.errorCount === 0;
    result.duration = Date.now() - startTime;


    const status = result.errorCount === 0 ? 200 : 207;

    return res.status(status).json(result);

  } catch (error: any) {
    console.error('Bulk import error:', error);
    return res.status(500).json({
      message: 'Failed to process bulk import',
      error: error.message
    });
  }
}

// Helper function to parse CSV
function parseCSV(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const stream = Readable.from(buffer.toString());

    const opts: CsvOptions = {
      mapHeaders: ({ header }) => header.trim(),
    };

    stream
      .pipe(csv(opts))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // remove rows where every value is empty/whitespace
        const cleaned = results.filter(row =>
          Object.values(row).some(v => String(v ?? '').trim() !== '')
        );
        resolve(cleaned);
      })
      .on('error', reject);
  });
}


// Helper function to parse Excel using ExcelJS
async function parseExcel(buffer: Buffer): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.read(Readable.from(buffer));

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error('No worksheet found in Excel file');

  const data: any[] = [];
  let headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    // defensively coerce row.values to array (ExcelJS keeps index 1-based)
    const values = (row.values as any[]) ?? [];

    if (rowNumber === 1) {
      headers = values.slice(1).map((value: any) =>
        value ? String(value).trim() : ''
      );
      return;
    }

    const rowData: any = {};
    values.slice(1).forEach((value: any, index: number) => {
      const header = headers[index];
      if (!header) return;

      // Normalize common cell value shapes
      if (value instanceof Date) {
        rowData[header] = value.toISOString();
      } else if (value && typeof value === 'object') {
        // Handle ExcelJS hyperlink objects and other object types
        if ('result' in value) {
          rowData[header] = (value as any).result;
        } else if ('text' in value && 'hyperlink' in value) {
          // ExcelJS hyperlink object: use the hyperlink URL
          rowData[header] = String(value.hyperlink).trim();
        } else if ('hyperlink' in value) {
          rowData[header] = String(value.hyperlink).trim();
        } else if ('text' in value) {
          rowData[header] = String(value.text).trim();
        } else {
          // Fallback: try to extract any string property or stringify
          const stringValue = value.toString();
          rowData[header] = stringValue === '[object Object]' ? '' : stringValue;
        }
      } else if (value != null) {
        rowData[header] = String(value).trim();
      } else {
        rowData[header] = '';
      }
    });

    if (Object.values(rowData).some(val => String(val ?? '').trim() !== '')) {
      data.push(rowData);
    }
  });

  return data;
}


// Helper function to normalize row keys
function normalizeRowKeys(row: any): any {
  const normalized: any = {};

  // Mapping of possible header variations to standard keys
  const keyMap: Record<string, string> = {
    'name': 'name',
    'product name': 'name',
    'product_name': 'name',
    'title': 'name',

    'description': 'description',
    'desc': 'description',
    'details': 'description',

    'price': 'price',
    'price in inr': 'price',
    'priceinr': 'price',
    'price_inr': 'price',
    'cost': 'price',

    'image': 'image',
    'image url': 'image',
    'image_url': 'image',
    'main image': 'image',
    'main_image': 'image',
    'primary image': 'image',

    'badge': 'badge',
    'tag': 'badge',
    'label': 'badge',

    'rating': 'rating',
    'stars': 'rating',
    'score': 'rating',

    'reviews': 'reviews',
    'review count': 'reviews',
    'review_count': 'reviews',
    'total reviews': 'reviews',

    'iswishlisted': 'isWishlisted',
    'is wishlisted': 'isWishlisted',
    'is_wishlisted': 'isWishlisted',
    'wishlisted': 'isWishlisted',

    'issoldout': 'isSoldOut',
    'is sold out': 'isSoldOut',
    'is_sold_out': 'isSoldOut',
    'sold out': 'isSoldOut',
    'soldout': 'isSoldOut',
    'out of stock': 'isSoldOut',

    'category': 'category',
    'cat': 'category',
    'type': 'category',
    'product type': 'category',
    'product_type': 'category',

    'images': 'images',
    'gallery': 'images',
    'gallery images': 'images',
    'gallery_images': 'images',
    'additional images': 'images',
    'additional_images': 'images'
  };

  // Normalize keys
  Object.keys(row).forEach(key => {
    const normalizedKey = key.toLowerCase().trim();
    const mappedKey = keyMap[normalizedKey] || normalizedKey;

    let value = row[key];

    // Clean up values
    if (typeof value === 'string') {
      value = value.trim();
      // Convert empty strings to null for optional fields
      if (value === '') {
        value = null;
      }
    }

    normalized[mappedKey] = value;
  });

  return normalized;
}


// src/controllers/bulk-import.controller.ts (continued)

export async function downloadBulkImportTemplate(req: Request, res: Response) {
  const format = req.query.format as string || 'xlsx';

  const sampleData = [
    {
      name: 'Unicorn Dreams Gift Box',
      description: 'A magical collection of unicorn-themed toys and accessories',
      price: 599.99,
      image: 'https://example.com/unicorn-box.jpg',
      badge: 'Best Seller',
      rating: 4.5,
      reviews: 125,
      isWishlisted: false,
      isSoldOut: false,
      category: 'GB',
      images: 'https://example.com/img1.jpg,https://example.com/img2.jpg'
    },
    {
      name: 'Dinosaur Adventure Set',
      description: 'Exciting dinosaur toys for prehistoric fun',
      price: 449.99,
      image: 'https://example.com/dino-set.jpg',
      badge: 'New Arrival',
      rating: 4.8,
      reviews: 89,
      isWishlisted: true,
      isSoldOut: false,
      category: 'TY',
      images: 'https://example.com/dino1.jpg,https://example.com/dino2.jpg,https://example.com/dino3.jpg'
    }
  ];

  if (format === 'csv') {
    // Generate CSV
    const headers = Object.keys(sampleData[0]).join(',');
    const rows = sampleData.map(row =>
      Object.values(row).map(val =>
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=kidsgiftboxes_import_template.csv');
    return res.send(csv);

  } else {
    // Generate Excel using ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Gift Boxes');

    // Define columns with headers and styling
    worksheet.columns = [
      { header: 'name', key: 'name', width: 30 },
      { header: 'description', key: 'description', width: 50 },
      { header: 'price', key: 'price', width: 12 },
      { header: 'image', key: 'image', width: 40 },
      { header: 'badge', key: 'badge', width: 15 },
      { header: 'rating', key: 'rating', width: 10 },
      { header: 'reviews', key: 'reviews', width: 12 },
      { header: 'isWishlisted', key: 'isWishlisted', width: 12 },
      { header: 'isSoldOut', key: 'isSoldOut', width: 12 },
      { header: 'category', key: 'category', width: 10 },
      { header: 'images', key: 'images', width: 60 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    sampleData.forEach(row => {
      worksheet.addRow(row);
    });

    // Add data validation for category column
    const categoryColumn = worksheet.getColumn('category');
    categoryColumn.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"GB,TY,BK,GM,CL,AC"'],
          showErrorMessage: true,
          errorTitle: 'Invalid Category',
          error: 'Please select a valid category from the list'
        };
      }
    });

    // Add data validation for boolean columns
    ['isWishlisted', 'isSoldOut'].forEach(columnKey => {
      const column = worksheet.getColumn(columnKey);
      column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber > 1) { // Skip header
          cell.dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"true,false"'],
            showErrorMessage: true,
            errorTitle: 'Invalid Value',
            error: 'Please enter true or false'
          };
        }
      });
    });

    // Add comments to header cells for guidance
    const headerRow = worksheet.getRow(1);
    headerRow.getCell('name').note = 'Required: Product name (max 200 characters)';
    headerRow.getCell('description').note = 'Required: Product description';
    headerRow.getCell('price').note = 'Required: Price in INR (positive number)';
    headerRow.getCell('image').note = 'Required: Main image URL';
    headerRow.getCell('rating').note = 'Required: Rating between 0 and 5';
    headerRow.getCell('badge').note = 'Optional: Badge text (e.g., "Best Seller")';
    headerRow.getCell('reviews').note = 'Optional: Number of reviews (default: 0)';
    headerRow.getCell('category').note = 'Optional: GB=Gift Box, TY=Toy, BK=Book, GM=Game, CL=Clothing, AC=Accessory (default: GB)';
    headerRow.getCell('images').note = 'Optional: Comma-separated URLs for gallery images (max 12)';

    // Freeze the header row
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 1 }
    ];

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=kidsgiftboxes_import_template.xlsx');
    return res.send(buffer);
  }
}