// Error message utility for providing user-friendly error messages
const ErrorMessages = {
  AUTHENTICATION_REQUIRED: 'Please log in to view recommendations',
  AUTHENTICATION_EXPIRED: 'Your session has expired. Please log in again',
  SERVICE_UNAVAILABLE: 'Recommendations service is temporarily unavailable. Please try again later',
  NETWORK_ERROR: 'Unable to connect to recommendations service. Check your internet connection',
  DATA_ERROR: 'Unable to load recommendations data. Please refresh the page',
  GENERAL_ERROR: 'Something went wrong while loading recommendations. Please try again',
  FRIENDS_UNAVAILABLE: 'Friends recommendations are temporarily unavailable',
  TMDB_UNAVAILABLE: 'Movie database is temporarily unavailable. Showing limited information'
}

const getErrorMessage = (error, context = 'general') => {
  if (!error) return ErrorMessages.GENERAL_ERROR

  const errorMessage = error.message || error.toString()
  
  // Authentication errors
  if (error.status === 401 || errorMessage.includes('auth')) {
    return ErrorMessages.AUTHENTICATION_EXPIRED
  }
  
  // Network/timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('AbortError') || errorMessage.includes('network')) {
    return ErrorMessages.NETWORK_ERROR
  }
  
  // Service unavailable
  if (error.status >= 500 || errorMessage.includes('server')) {
    return ErrorMessages.SERVICE_UNAVAILABLE
  }
  
  // Context-specific errors
  if (context === 'friends' && (error.status === 404 || errorMessage.includes('friends'))) {
    return ErrorMessages.FRIENDS_UNAVAILABLE
  }
  
  if (context === 'tmdb' && (error.status === 404 || errorMessage.includes('TMDB'))) {
    return ErrorMessages.TMDB_UNAVAILABLE
  }
  
  return ErrorMessages.GENERAL_ERROR
}

const createErrorResponse = (error, status = 500, context = 'general') => {
  const message = getErrorMessage(error, context)
  return {
    error: message,
    debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString()
  }
}

// Export for both CommonJS and ES modules
export { ErrorMessages, getErrorMessage, createErrorResponse }

// Also support CommonJS require
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ErrorMessages, getErrorMessage, createErrorResponse }
  module.exports.ErrorMessages = ErrorMessages
  module.exports.getErrorMessage = getErrorMessage
  module.exports.createErrorResponse = createErrorResponse
}
