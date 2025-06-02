export async function getUserRecommendations(userId) {
  try {
    const response = await fetch('/api/auth/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Ha habido un error al obtener las recomendaciones del usuario');
  }
}

export async function getUserWatchlist(userId) {
  try {
    const response = await fetch('/api/auth/watchlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Ha habido un error al obtener la lista de seguimiento del usuario');
  }
}

export async function getUserLiked(userId) {
  try {
    const response = await fetch('/api/auth/liked', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Ha habido un error al obtener el contenido con "me gusta" del usuario');
  }
}

export async function getFriendsWantToSee(userId) {
  try {
    const response = await fetch('/api/auth/friends-want-to-see', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Ha habido un error al obtener lo que los amigos quieren ver');
  }
}

export async function updateUserPreferences(userId, preferences) {
  try {
    const response = await fetch('/api/auth/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, preferences }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Ha habido un error al actualizar las preferencias del usuario');
  }
}

export async function login(credentials) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en el login');
    }

    const data = await response.json();
    
    if (data.user) {
      localStorage.setItem('user_data', JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar
      }));
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || 'Ha habido un error al iniciar sesión');
  }
}

export async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
  } finally {
    localStorage.removeItem('user_data');
    window.location.href = '/login';
  }
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  try {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith('auth-token=')
    );
    const userIdCookie = cookies.find(cookie => 
      cookie.trim().startsWith('user-id=')
    );
    
    return authCookie && authCookie.split('=')[1].trim() !== '' && 
           userIdCookie && userIdCookie.split('=')[1].trim() !== '';
  } catch (error) {
    return false;
  }
}

export async function getUserProfile() {
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Ha habido un error al obtener el perfil del usuario');
  }
}

export async function getRecentHistory() {
  try {
    const response = await fetch('/api/auth/recent-history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return {
        success: true,
        history: [
          {
            id: 1,
            show: "Breaking Bad",
            episode: "S5E14 - Ozymandias",
            watchedAgo: "hace 1 día",
          },
          {
            id: 2,
            show: "Better Call Saul", 
            episode: "S6E13 - Saul Gone",
            watchedAgo: "hace 2 días",
          },
          {
            id: 3,
            show: "The Mandalorian",
            episode: "S3E8 - The Rescue", 
            watchedAgo: "hace 3 días",
          },
        ]
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: true,
      history: [
        {
          id: 1,
          show: "Breaking Bad",
          episode: "S5E14 - Ozymandias",
          watchedAgo: "hace 1 día",
        },
        {
          id: 2,
          show: "Better Call Saul",
          episode: "S6E13 - Saul Gone", 
          watchedAgo: "hace 2 días",
        },
        {
          id: 3,
          show: "The Mandalorian",
          episode: "S3E8 - The Rescue",
          watchedAgo: "hace 3 días",
        },
      ]
    };
  }
}

export async function updatePlatformSubscription(platformName, subscribed) {
  try {
    const response = await fetch('/api/auth/platform-subscription', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify({ platformName, subscribed }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Ha habido un error al actualizar la suscripción de la plataforma');
  }
}

export async function getUserStats() {
  try {
    const response = await fetch('/api/auth/user-stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Ha habido un error al obtener las estadísticas del usuario');
  }
}

export async function oauthLogin(provider) {
  try {
    const response = await fetch(`/api/auth/${provider}/redirect`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get OAuth URL for ${provider}: ${response.status} ${response.statusText}`);
    }

    const redirectUrl = await response.json();
    
    const popup = window.open(
      redirectUrl,
      `${provider}_oauth`,
      'width=600,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }

    return new Promise((resolve, reject) => {
      let resolved = false;
      
      const messageHandler = (event) => {
        
        if (event.data.type === 'OAUTH_SUCCESS' && event.data.provider === provider) {
          resolved = true;
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          if (!popup.closed) popup.close();
          resolve({ 
            success: true, 
            token: event.data.token, 
            user: event.data.user 
          });
        } else if (event.data.type === 'OAUTH_ERROR' && event.data.provider === provider) {
          resolved = true;
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          if (!popup.closed) popup.close();
          reject(new Error(event.data.error || 'OAuth authentication failed'));
        } else if (event.data.type === 'POPUP_CLOSE' && event.data.provider === provider) {
          if (!resolved) {
            resolved = true;
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            reject(new Error('OAuth authentication was cancelled'));
          }
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      const checkClosed = setInterval(() => {
        if (popup.closed && !resolved) {
          resolved = true;
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          if (isAuthenticated()) {
            resolve({ success: true });
          } else {
            reject(new Error('OAuth authentication was cancelled or failed'));
          }
        }
      }, 1000);

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('OAuth authentication timed out'));
        }
      }, 300000);
    });

  } catch (error) {
    throw new Error(error.message || `Ha habido un error al iniciar sesión con ${provider}`);
  }
}

function getAuthToken() {
  if (typeof window === 'undefined') return '';
  
  try {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith('auth-token=')
    );
    
    const token = authCookie ? authCookie.split('=')[1].trim() : '';
    return token;
  } catch (error) {
    return '';
  }
}
