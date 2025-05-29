import { NextResponse } from 'next/server';

export function getUserIdFromRequest(req) {
  try {
    const authHeader = req.headers.get('authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
      console.log('Token from Authorization header:', token);
    } else {
      const cookies = req.cookies.get('auth-token');
      token = cookies?.value;
      console.log('Token from cookie:', token);
    }
    
    if (!token) {
      console.log('No token found in header or cookies');
      return { 
        error: 'Unauthorized - No valid token found',
        status: 401
      };
    }
    
    const tokenParts = token.split('-');
    const userId = tokenParts.length > 3 ? tokenParts[3] : null;
    
    console.log('Token parts:', tokenParts);
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      console.log('Invalid userId in token');
      return { 
        error: 'Invalid token format',
        status: 401
      };
    }

    return { userId, token };
  } catch (error) {
    console.error('Error extracting user ID:', error);
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
