import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        category: { select: { name: true, slug: true } },
        seller: { select: { id: true, name: true } },
        bids: {
          include: {
            bidder: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Muestra las últimas 10 pujas en tiempo real
        },
        _count: { select: { bids: true } },
      },
    });

    if (!auction) {
      return NextResponse.json({ error: 'Subasta no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ auction }, { status: 200 });
  } catch (error) {
    console.error('Error fetching auction detail:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
