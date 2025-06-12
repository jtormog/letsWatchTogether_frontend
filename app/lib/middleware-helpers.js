export function isValidAuthToken(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const cleanToken = token.trim();
  
  // Check for empty token
  if (cleanToken.length === 0) {
    return false;
  }
  
  // Support multiple token formats:
  // 1. Laravel Sanctum: número|caracteres
  const sanctumPattern = /^\d+\|[a-zA-Z0-9]+$/;
  
  // 2. JWT tokens: three base64-encoded parts separated by dots
  const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  
  // 3. Generic alphanumeric tokens (minimum 10 characters for security)
  const genericPattern = /^[a-zA-Z0-9_-]{10,}$/;
  
  return sanctumPattern.test(cleanToken) || 
         jwtPattern.test(cleanToken) || 
         genericPattern.test(cleanToken);
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
    userId
  };
}
