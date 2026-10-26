import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/tokens';
import type { NextRequest } from 'next/server'; // <-- 1. Importa NextRequest

export async function POST(request: NextRequest) { // <-- 2. Usa NextRequest en lugar de Request
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (accessToken) {
      const payload = await verifyAccessToken(accessToken);
      if (payload) {
        // Revocar el refresh token en la base de datos
        await prisma.user.update({
          where: { id: payload.userId },
          data: { refreshTokenHash: null },
        });
      }
    }

    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

    // Limpiar las cookies expirándolas inmediatamente
    response.cookies.set({ name: 'accessToken', value: '', maxAge: 0, path: '/' });
    response.cookies.set({ name: 'refreshToken', value: '', maxAge: 0, path: '/' });

    return response;
  } catch (error) {
    console.error('Error in logout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}