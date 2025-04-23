import { NextResponse } from 'next/server';
import { initSocketServer, NextApiResponseWithSocket } from '@/lib/socket-server';

export async function GET(req: Request, res: NextApiResponseWithSocket) {
  try {
    initSocketServer(res);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao inicializar o servidor de sockets:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 