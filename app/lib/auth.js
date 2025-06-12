import { NextResponse } from 'next/server';

export function getUserIdFromRequest(req) {
  try {
    const authHeader = req.headers.get('authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else {
      const cookies = req.cookies.get('auth-token');
      token = cookies?.value;
    }
    
    if (!token) {
      return { 
        error: 'Unauthorized - No valid token found',
        status: 401
      };
    }
    
    const userIdCookie = req.cookies.get('user-id');
    const userId = userIdCookie?.value;
    
    if (!userId) {
      return { 
        error: 'Unauthorized - Invalid session',
        status: 401
      };
    }

    console.log(`Auth success: User ${userId} authenticated`);
    return { userId, token };
  } catch (error) {
    console.log('Auth error: Exception during authentication:', error);
    return { 
      error: 'Internal server error',
      status: 500
    };
  }
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json(
    { error: message }, 
    { status: 401 }
  );
}
