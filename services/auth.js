export async function getUserRecommendations(userId, limit = 20) {
  try {
    const response = await fetch('/api/auth/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify({ userId, limit }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated for recommendations');
        return [];
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching recommendations:', error.message);
    return [];
  }
}

export async function getUserWatchlist(userId) {
  try {
    const response = await fetch('/api/auth/watchlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated for watchlist');
        return [];
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching watchlist:', error.message);
    return [];
  }
}

export async function getUserLiked(userId) {
  try {
    const response = await fetch('/api/auth/liked', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated for liked content');
        return [];
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching liked content:', error.message);
    return [];
  }
}

export async function getFriendsWantToSee(userId) {
  try {
    const response = await fetch('/api/auth/friends-want-to-see', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated for friends recommendations');
        return [];
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching friends want to see:', error.message);
    return [];
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

export async function register(credentials) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en el registro');
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
    throw new Error(error.message || 'Ha habido un error al registrarse');
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

export async function getUserWatching(userId, limit = 20) {
  try {
    const response = await fetch('/api/auth/watching', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify({ userId, limit }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated for watching list');
        return [];
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching watching list:', error.message);
    return [];
  }
}

export async function getUserCompleted(userId) {
  try {
    const response = await fetch('/api/auth/completed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated for completed list');
        return [];
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching completed list:', error.message);
    return [];
  }
}

export async function getUserPlanned(userId) {
  try {
    const response = await fetch('/api/auth/planned', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated for planned list');
        return [];
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching planned list:', error.message);
    return [];
  }
}

export async function getUserSocial() {
  try {
    const response = await fetch('/api/auth/social', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated for social data');
        return { friends: [], friendRequests: [], pendingRequests: [] };
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || { friends: [], friendRequests: [], pendingRequests: [] };
  } catch (error) {
    console.warn('Error fetching social data:', error.message);
    return { friends: [], friendRequests: [], pendingRequests: [] };
  }
}

export async function sendFriendRequest(email) {
  try {
    const response = await fetch('/api/auth/friend-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message || 'Error al enviar solicitud de amistad');
  }
}

export async function getReceivedFriendRequests(status = 'pending') {
  try {
    const response = await fetch(`/api/auth/friend-requests/received?status=${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated for received friend requests');
        return [];
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.warn('Error fetching received friend requests:', error.message);
    return [];
  }
}

export async function getSentFriendRequests(status = 'pending') {
  try {
    const response = await fetch(`/api/auth/friend-requests/sent?status=${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated for sent friend requests');
        return [];
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.warn('Error fetching sent friend requests:', error.message);
    return [];
  }
}

export async function respondToFriendRequest(friendshipId, action) {
  try {
    const response = await fetch(`/api/auth/friend-request/${friendshipId}/respond`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message || 'Error al responder a la solicitud de amistad');
  }
}

// Watch Invitation Functions
export async function sendWatchInvitation(friendId, tmdbId, mediaType = 'movie') {
  try {
    const response = await fetch('/api/auth/watch-invitation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify({ friend_id: friendId, tmdb_id: tmdbId, media_type: mediaType }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message || 'Error al enviar invitación para ver juntos');
  }
}

export async function respondToWatchInvitation(invitationId, action) {
  try {
    const response = await fetch(`/api/auth/watch-invitation/${invitationId}/respond`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message || 'Error al responder a la invitación para ver juntos');
  }
}

export async function getReceivedWatchInvitations(status = 'pending') {
  try {
    const response = await fetch(`/api/auth/watch-invitations/received/${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated for received watch invitations');
        return { success: false, data: [], message: 'Authentication required' };
      }
      const errorData = await response.json();
      throw new Error(errorData.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching received watch invitations:', error.message);
    return { success: false, data: [], message: error.message };
  }
}

export async function getSentWatchInvitations(status = 'pending') {
  try {
    const response = await fetch(`/api/auth/watch-invitations/sent/${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated for sent watch invitations');
        return { success: false, data: [], message: 'Authentication required' };
      }
      const errorData = await response.json();
      throw new Error(errorData.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching sent watch invitations:', error.message);
    return { success: false, data: [], message: error.message };
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
