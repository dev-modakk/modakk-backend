import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
  const page = Math.max(parseInt(String(req.query.page ?? 1), 10) || 1, 1);
  const pageSize = Math.min(
    Math.max(parseInt(String(req.query.pageSize ?? 12), 10) || 12, 1),
    60
  );

  const q = (String(req.query.q ?? '').trim()) || '';
  const category = String(req.query.category ?? 'all').toUpperCase();
  const sortBy = String(req.query.sortBy ?? 'featured');

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  } else {
    // Ensure no unnecessary conditions are added when q is empty
    where.OR = undefined;
  }
  if (category && category !== 'ALL') {
    where.category = category;
  }

  // Debug log to verify the WHERE clause
  console.log('WHERE clause:', JSON.stringify(where, null, 2));

  const orderBy: any[] = [];
  switch (sortBy) {
    case 'price-asc':
      orderBy.push({ priceInINR: 'asc' });
      break;
    case 'price-desc':
      orderBy.push({ priceInINR: 'desc' });
      break;
    case 'rating-desc':
      orderBy.push({ rating: 'desc' }, { reviews: 'desc' });
      break;
    case 'newest':
      orderBy.push({ createdAt: 'desc' });
      break;
    case 'featured':
    default:
      orderBy.push({ isWishlisted: 'desc' });
      orderBy.push({ rating: 'desc' });
      orderBy.push({ reviews: 'desc' });
      break;
  }

  const [total, items] = await Promise.all([
    prisma.kidsGiftBox.count({ where }),
    prisma.kidsGiftBox.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        displayId: true,
        name: true,
        description: true,
        priceInINR: true,
        image: true,
        badge: true,
        rating: true,
        reviews: true,
        isSoldOut: true,
        isWishlisted: true,
        category: true,
      },
    }),
  ]);

  return res.json({
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
});

export default router;
