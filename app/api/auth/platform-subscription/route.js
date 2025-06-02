import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/app/lib/auth';

export async function PUT(req) {
  try {
    const { userId, error, status } = getUserIdFromRequest(req);
    
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const { platformName, subscribed } = await req.json();
    
    if (!platformName || typeof subscribed !== 'boolean') {
      return NextResponse.json(
        { error: 'Datos inválidos' }, 
        { status: 400 }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    
    return NextResponse.json({
      success: true,
      message: `Suscripción a ${platformName} ${subscribed ? 'activada' : 'desactivada'}`
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
