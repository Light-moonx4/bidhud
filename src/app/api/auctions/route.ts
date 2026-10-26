import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken, ACCESS_COOKIE_NAME } from '@/lib/tokens';

// POST: Crear una subasta (Requiere autenticación)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const {
      title,
      description,
      imageUrl,
      initialPrice,
      minimumIncrement,
      closingDate,
      categoryId,
    } = body as Record<string, unknown>;

    if (
      typeof title !== 'string' || !title.trim() ||
      typeof description !== 'string' || !description.trim() ||
      typeof imageUrl !== 'string' || !imageUrl.trim() ||
      typeof initialPrice !== 'number' || !Number.isFinite(initialPrice) || initialPrice <= 0 ||
      typeof minimumIncrement !== 'number' || !Number.isFinite(minimumIncrement) || minimumIncrement <= 0 ||
      typeof closingDate !== 'string' || !Number.isFinite(Date.parse(closingDate)) ||
      typeof categoryId !== 'string' || !categoryId
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAuction = await prisma.auction.create({
      data: {
        title,
        description,
        imageUrl,
        initialPrice,
        minimumIncrement,
        currentPrice: initialPrice,
        closingDate: new Date(closingDate),
        categoryId,
        sellerId: payload.userId,
      },
    });

    return NextResponse.json({ message: 'Auction created successfully', auction: newAuction }, { status: 201 });
  } catch (error) {
    console.error('Error creating auction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
