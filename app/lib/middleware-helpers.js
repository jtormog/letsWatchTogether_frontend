export function isValidAuthToken(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const tokenPattern = /^\d+\|[a-zA-Z0-9]+$/;
  return tokenPattern.test(token.trim());
}

export function isValidUserId(userId) {
  if (!userId || typeof userId !== 'string') {
    return false;
  }
  
  const id = parseInt(userId.trim());
  return !isNaN(id) && id > 0;
}

export function validateAuthentication(req) {
  const authToken = req.cookies.get('auth-token')?.value;
  const userId = req.cookies.get('user-id')?.value;
  
  const hasValidToken = isValidAuthToken(authToken);
  const hasValidUserId = isValidUserId(userId);
  
  return {
    isAuthenticated: hasValidToken && hasValidUserId,
    authToken,
    userId,
    details: {
      hasValidToken,
      hasValidUserId,
      tokenFormat: authToken ? 'Laravel Sanctum' : 'none',
      userIdNum: userId ? parseInt(userId) : null
    }
  };
}
