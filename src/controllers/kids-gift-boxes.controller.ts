import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { createGiftBoxSchema, imagesBodySchema } from "../validators";
import { ProductCategory, idService } from "../services";


function toCard(gb: any) {
  return {
    id: gb.id as string,
    name: gb.name as string,
    price: Number(gb.priceInINR),
    image: gb.image as string,
    badge: gb.badge ?? undefined,
    rating: Number(gb.rating),
    reviews: gb.reviews as number,
    description: gb.description as string,
    isWishlisted: gb.isWishlisted as boolean,
    isSoldOut: gb.isSoldOut as boolean,
    category: gb.category as string
  };
}

export async function createKidsGiftBox(req: Request, res: Response) {
  const parsed = createGiftBoxSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });

  const data = parsed.data;

  try {
    // Generate unique ID based on category (default to GB for gift boxes)
    const category = (data.category as ProductCategory) || 'GB';

    // Choose your preferred ID generation method:
    // Option 1: Hybrid (category-based)
    const id = await idService.generateID(category);

    // Option 2: Alphanumeric (shorter, like Amazon)
    // const id = await idService.generateAlphanumericID();

    // Option 3: Timestamp (guaranteed unique)
    // const id = idService.generateTimestampID();

    const created = await prisma.kidsGiftBox.create({
      data: {
        id, // Use the generated ID
        name: data.name,
        description: data.description,
        priceInINR: data.price,
        image: data.image,
        badge: data.badge,
        rating: data.rating,
        reviews: data.reviews,
        isWishlisted: data.isWishlisted,
        isSoldOut: data.isSoldOut,
        images: data.images,
        category
      }
    });

    return res.status(201).json(toCard(created));
  } catch (error) {
    console.error('Error creating gift box:', error);
    return res.status(500).json({ message: 'Failed to create gift box' });
  }
}

export async function getKidsGiftBox(req: Request, res: Response) {
  const { id } = req.params;

  // ID is now a string, so direct lookup
  const gb = await prisma.kidsGiftBox.findUnique({
    where: { id }
  });

  if (!gb) return res.status(404).json({ message: "Gift box not found." });
  return res.json(gb);
}

export async function listGiftBoxes(req: Request, res: Response) {
  const { category } = req.query;

  const where = category ? { category: category as string } : {};

  const all = await prisma.kidsGiftBox.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });

  return res.json(all.map(toCard));
}

export async function addKidsGiftBoxImages(req: Request, res: Response) {
  const { id } = req.params; // Now a string
  const parsed = imagesBodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });

  const gb = await prisma.kidsGiftBox.findUnique({ where: { id } });
  if (!gb) return res.status(404).json({ message: "Gift box not found." });

  const existing = gb.images ?? [];
  const incoming = parsed.data.images;
  const set = new Set(existing);
  const merged = [...existing, ...incoming.filter(u => !set.has(u))];

  if (merged.length > 12) {
    return res.status(400).json({ message: "Too many images. Max is 12 total per gift box." });
  }

  const updated = await prisma.kidsGiftBox.update({
    where: { id },
    data: { images: merged }
  });

  return res.json(updated);
}

export async function replaceKidsGiftBoxImages(req: Request, res: Response) {
  const { id } = req.params; // Now a string
  const parsed = imagesBodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });

  const gb = await prisma.kidsGiftBox.findUnique({ where: { id } });
  if (!gb) return res.status(404).json({ message: "Gift box not found." });

  const seen = new Set<string>();
  const unique = parsed.data.images.filter(u => (seen.has(u) ? false : (seen.add(u), true)));

  const updated = await prisma.kidsGiftBox.update({
    where: { id },
    data: { images: unique }
  });

  return res.json(updated);
}

export async function deleteKidsGiftBoxImages(req: Request, res: Response) {
  const { id } = req.params; // Now a string
  const parsed = imagesBodySchema.partial().safeParse(req.body);
  if (!parsed.success || !parsed.data.images || parsed.data.images.length === 0) {
    return res.status(400).json({ message: "Provide images: string[] to remove." });
  }

  const gb = await prisma.kidsGiftBox.findUnique({ where: { id } });
  if (!gb) return res.status(404).json({ message: "Gift box not found." });

  const toRemove = new Set(parsed.data.images);
  const images: string[] = gb.images ?? [];
  const remaining = images.filter(u => !toRemove.has(u));

  const updated = await prisma.kidsGiftBox.update({
    where: { id },
    data: { images: remaining }
  });

  return res.json(updated);
}
