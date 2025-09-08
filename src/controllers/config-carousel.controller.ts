import { Request, Response } from "express";
import prisma from "../lib/prisma";
import ExcelJS from "exceljs";
import { slideSchema, upsertCarouselSchema } from "../validators";

function cellToString(val: unknown): string {
  if (val == null) return "";

  if (typeof val === "object") {
    const v = val as any;
    if (typeof v.hyperlink === "string") return v.hyperlink.trim();
    if (typeof v.text === "string") return v.text.trim();
    if (typeof v.result === "string") return v.result.trim();
  }

  return String(val).trim().replace(/\u200B/g, "");
}

export async function getCarousel(req: Request, res: Response) {
  const one = await prisma.configCarousel.findFirst({
    orderBy: { createdAt: "desc" }
  });
  if (!one) return res.status(404).json({ message: "Carousel config not found." });
  return res.json(one);
}

export async function createCarousel(req: Request, res: Response) {
  const parse = upsertCarouselSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten() });
  }

  const existing = await prisma.configCarousel.findFirst();
  if (existing) {
    return res.status(409).json({ message: "Carousel already exists. Use PUT to replace." });
  }

  const created = await prisma.configCarousel.create({
    data: { slides: parse.data.slides }
  });
  return res.status(201).json(created);
}

export async function putCarousel(req: Request, res: Response) {
  const parse = upsertCarouselSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten() });
  }

  const existing = await prisma.configCarousel.findFirst({
    orderBy: { createdAt: "desc" }
  });

  if (!existing) {
    const created = await prisma.configCarousel.create({
      data: { slides: parse.data.slides }
    });
    return res.status(201).json(created);
  }

  const updated = await prisma.configCarousel.update({
    where: { id: existing.id },
    data: { slides: parse.data.slides }
  });
  return res.json(updated);
}

export async function importCarouselFromExcel(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ message: "No file provided (field name: 'file')." });
  }

  const workbook = new ExcelJS.Workbook();
  try {
    const buf: Buffer = Buffer.isBuffer(file.buffer)
      ? file.buffer
      : Buffer.from(file.buffer as any);

    await workbook.xlsx.load(buf as any);
  } catch (error) {
    return res.status(400).json({ message: "Failed to parse Excel file." });
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return res.status(400).json({ message: "The workbook is empty." });
  }

  const headerRow = worksheet.getRow(1);
  const rawHeaderVals = (headerRow?.values ?? []) as Array<string | number | null | undefined>;
  const headers = rawHeaderVals
    .slice(1)
    .map((h) => (h != null ? String(h).trim().toLowerCase() : ""))
    .filter((h) => h.length > 0);

  const urlIdx = headers.findIndex((h) => ["url", "image", "image url"].includes(h));
  const titleIdx = headers.findIndex((h) => h === "title");
  const descIdx = headers.findIndex((h) => h === "description");

  if (urlIdx === -1 || titleIdx === -1 || descIdx === -1) {
    return res.status(400).json({
      message: "Missing required headers. Expect: url (or image/image url), title, description."
    });
  }

  const slidesRaw: { image: string; title: string; description: string }[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const image = cellToString(row.getCell(urlIdx + 1).value);
    const title = cellToString(row.getCell(titleIdx + 1).value);
    const description = cellToString(row.getCell(descIdx + 1).value);

    if (!image && !title && !description) return;

    slidesRaw.push({ image, title, description });
  });

  if (!slidesRaw.length) {
    return res.status(400).json({ message: "No data rows found under headers." });
  }

  const seen = new Set<string>();
  const slidesDedup = slidesRaw.filter((s) => {
    if (seen.has(s.image)) return false;
    seen.add(s.image);
    return true;
  });

  if (slidesDedup.length > 7) {
    return res.status(400).json({ message: "Too many slides. Maximum allowed is 7." });
  }

  const rowErrors: Array<{ row: number; error: string }> = [];
  const validSlides: typeof slidesDedup = [];

  slidesDedup.forEach((s, i) => {
    const parsed = slideSchema.safeParse(s);
    if (!parsed.success) {
      const originalRowIndex = slidesRaw.findIndex(original =>
        original.image === s.image &&
        original.title === s.title &&
        original.description === s.description
      );
      rowErrors.push({
        row: originalRowIndex + 2,
        error: parsed.error.issues.map((x) => x.message).join("; ")
      });
    } else {
      validSlides.push(parsed.data);
    }
  });

  if (rowErrors.length) {
    return res.status(400).json({
      message: "Validation failed for some rows.",
      details: rowErrors
    });
  }

  const parsedAll = upsertCarouselSchema.safeParse({ slides: validSlides });
  if (!parsedAll.success) {
    return res.status(400).json({ errors: parsedAll.error.flatten() });
  }

  try {
    const existing = await prisma.configCarousel.findFirst({ orderBy: { createdAt: "desc" } });

    if (!existing) {
      const created = await prisma.configCarousel.create({
        data: { slides: parsedAll.data.slides }
      });
      return res.status(201).json(created);
    } else {
      const updated = await prisma.configCarousel.update({
        where: { id: existing.id },
        data: { slides: parsedAll.data.slides }
      });
      return res.json(updated);
    }
  } catch (dbError) {
    console.error("Database error:", dbError);
    return res.status(500).json({ message: "Database operation failed." });
  }
}