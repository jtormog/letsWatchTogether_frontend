import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const { searchParams } = new URL(req.url);
  
  const token = searchParams.get('token');
  const error = searchParams.get('error');
  const userData = searchParams.get('user');
  
  const createPopupResponse = (success: boolean, data?: any, errorMessage?: string) => {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>OAuth ${provider} - ${success ? 'Éxito' : 'Error'}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #000000;
            color: #ffffff;
        }
        .container {
            text-align: center;
            padding: 20px;
        }
        .success {
            color: #0de383;
        }
        .error {
            color: #ef4444;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="${success ? 'success' : 'error'}">
            ${success ? '¡Autenticación exitosa!' : 'Error de autenticación'}
        </h2>
        <p>${success ? 'Cerrando ventana...' : errorMessage || 'Algo salió mal'}</p>
    </div>
    <script>
        const messageData = ${JSON.stringify({
          type: success ? 'OAUTH_SUCCESS' : 'OAUTH_ERROR',
          provider: provider,
          ...(success ? data : { error: errorMessage })
        })};
        
        function sendMessageToParent() {
            try {
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage(messageData, window.location.origin);
                    window.opener.postMessage(messageData, '*');
                    return true;
                } else if (window.parent && window.parent !== window) {
                    window.parent.postMessage(messageData, window.location.origin);
                    window.parent.postMessage(messageData, '*');
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                return false;
            }
        }
        
        let messageSent = false;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                messageSent = sendMessageToParent();
            });
        } else {
            messageSent = sendMessageToParent();
        }
        
        let retryCount = 0;
        const maxRetries = 20;
        
        const retryInterval = setInterval(() => {
            if (!messageSent && retryCount < maxRetries) {
                retryCount++;
                messageSent = sendMessageToParent();
            }
            
            if (messageSent || retryCount >= maxRetries) {
                clearInterval(retryInterval);
            }
        }, 100);
        
        window.addEventListener('beforeunload', function() {
            sendMessageToParent();
        });
        
        setTimeout(() => {
            try {
                window.close();
            } catch (error) {
                if (window.opener) {
                    try {
                        window.opener.postMessage({
                            type: 'POPUP_CLOSE',
                            provider: '${provider}'
                        }, '*');
                    } catch (e) {
                    }
                }
            }
        }, ${success ? 3000 : 5000});
    </script>
</body>
</html>`;
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  };
  
  if (error) {
    return createPopupResponse(false, null, `Error de autenticación con ${provider}: ${error}`);
  }
  
  if (token) {
    try {
      let user = null;
        if (userData) {
          try {
            const decodedUserData = Buffer.from(userData, 'base64').toString('utf-8');
            user = JSON.parse(decodedUserData);
          } catch (e) {
            try {
              user = JSON.parse(userData);
            } catch (e2) {
            }
          }
        }
        if (user && token) {
        const transformedUser = {
          id: user.id.toString(),
          name: user.name,
          username: user.email,
          email: user.email,
          avatar: user.avatar || "/placeholder.svg?height=120&width=120&text=" + user.name.charAt(0),
          subscription: {
            platforms: []
          },
          stats: {
            seriesVistas: 0,
            peliculasVistas: 0,
            episodiosVistos: 0,
            amigos: 0
          }
        };
        
        const cookieResponse = createPopupResponse(true, {
          token: token,
          user: transformedUser
        });
        
        cookieResponse.cookies.set('auth-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 86400,
          path: '/'
        });
        
        cookieResponse.cookies.set('user-id', user.id.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 86400,
          path: '/'
        });
        
        return cookieResponse;
      }
        if (!user && token) {
          try {
          const response = await fetch(`${process.env.LARAVEL_API_URL}/api/user/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          });            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Token validation failed: ${response.status} ${response.statusText}`);
            }
            
            const userData = await response.json();
            user = userData.user;          } catch (fetchError) {
            if (!user) {
              throw new Error('No se pudo validar el token y no hay datos de usuario disponibles');
            }
          }
      }
      
      if (!user) {
        throw new Error('No se pudieron obtener los datos del usuario');
      }
      
      if (!user.username) {
        user = {
          id: user.id.toString(),
          name: user.name,
          username: user.email,
          email: user.email,
          avatar: user.avatar || "/placeholder.svg?height=120&width=120&text=" + user.name.charAt(0),
          subscription: {
            platforms: []
          },
          stats: {
            seriesVistas: 0,
            peliculasVistas: 0,
            episodiosVistos: 0,
            amigos: 0
          }
        };
      }
      
      const cookieResponse = createPopupResponse(true, {
        token: token,
        user: user
      });
      
      cookieResponse.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400,
        path: '/'
      });
      
      cookieResponse.cookies.set('user-id', user.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400,
        path: '/'
      });
      
      return cookieResponse;      } catch (error) {
        return createPopupResponse(false, null, `Error validando token de ${provider}`);
      }
  }
  
  return createPopupResponse(false, null, `No se recibió token de ${provider}. Verifica la configuración de Laravel.`);
}