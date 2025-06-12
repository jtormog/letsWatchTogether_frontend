"use client"

import { useState, useEffect } from "react"
import SearchIcon from "@/icons/SearchIcon"
import { getUserSocial, sendFriendRequest, getReceivedFriendRequests, getSentFriendRequests, respondToFriendRequest, getReceivedWatchInvitations, getSentWatchInvitations, respondToWatchInvitation } from "@/services/auth"

interface Friend {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar: string;
  friendship_status?: string;
  friendship_id?: number;
}

interface ReceivedFriendRequest {
  friendship_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  sender: {
    id: number;
    name: string;
    email: string;
    avatar: string;
    username: string;
  };
}

interface SentFriendRequest {
  friendship_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  recipient: {
    id: number;
    name: string;
    email: string;
    avatar: string;
    username: string;
  };
}

interface ReceivedWatchInvitation {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  sender: {
    id: number;
    name: string;
    email: string;
    avatar: string;
    username: string;
  };
  content: {
    tmdb_id: number;
    title: string;
    overview?: string;
    poster_path?: string;
    media_type: 'movie' | 'tv';
    release_date?: string;
    genres?: string[];
    creator?: string;
    cast?: Array<{
      name: string;
      avatar: string | null;
    }>;
  };
}

interface SentWatchInvitation {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  recipient: {
    id: number;
    name: string;
    email: string;
    avatar: string;
    username: string;
  };
  content: {
    tmdb_id: number;
    title: string;
    overview?: string;
    poster_path?: string;
    media_type: 'movie' | 'tv';
    release_date?: string;
    genres?: string[];
    creator?: string;
    cast?: Array<{
      name: string;
      avatar: string | null;
    }>;
  };
}

interface FriendRequest {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar: string;
  friendship_id: number;
  created_at: string;
}

interface SocialData {
  friends: Friend[];
  friendRequests: FriendRequest[];
  pendingRequests: FriendRequest[];
}

export default function SocialPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [socialData, setSocialData] = useState<SocialData>({
    friends: [],
    friendRequests: [],
    pendingRequests: []
  })
  const [receivedRequests, setReceivedRequests] = useState<ReceivedFriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<SentFriendRequest[]>([])
  const [receivedWatchInvitations, setReceivedWatchInvitations] = useState<ReceivedWatchInvitation[]>([])
  const [sentWatchInvitations, setSentWatchInvitations] = useState<SentWatchInvitation[]>([])
  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent' | 'watch-received' | 'watch-sent'>('friends')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [friendEmail, setFriendEmail] = useState("")
  const [sendingRequest, setSendingRequest] = useState(false)
  const [requestMessage, setRequestMessage] = useState<string | null>(null)
  const [acceptingRequest, setAcceptingRequest] = useState<number | null>(null)
  const [decliningRequest, setDecliningRequest] = useState<number | null>(null)
  const [acceptingWatchInvitation, setAcceptingWatchInvitation] = useState<number | null>(null)
  const [decliningWatchInvitation, setDecliningWatchInvitation] = useState<number | null>(null)

  // Function to transform watch invitation data from API format to frontend format
  const transformWatchInvitationData = (invitationsData: any[], type: 'received' | 'sent') => {
    return invitationsData
      .filter((invitation: any) => invitation && invitation.id)
      .map((invitation: any) => {
        // Handle both new API format and old mock format
        if ((type === 'received' && invitation.sender && invitation.content) || 
            (type === 'sent' && invitation.recipient && invitation.content)) {
          // Already in correct format (mock data)
          return invitation;
        } else if (invitation.friend_name && invitation.tmdb_id) {
          // Transform Laravel API format to expected format
          const baseData = {
            id: invitation.id,
            status: invitation.status,
            created_at: invitation.created_at,
            updated_at: invitation.updated_at || invitation.created_at,
            content: {
              tmdb_id: invitation.tmdb_id,
              title: `Content ${invitation.tmdb_id}`, // Placeholder until we fetch TMDB data
              media_type: invitation.type || 'movie' as const // Use type from invitation or default to movie
            }
          };
          
          if (type === 'received') {
            return {
              ...baseData,
              sender: {
                id: invitation.friendship_id,
                name: invitation.friend_name,
                email: invitation.friend_email,
                avatar: null,
                username: invitation.friend_email.split('@')[0]
              }
            };
          } else {
            return {
              ...baseData,
              recipient: {
                id: invitation.friendship_id,
                name: invitation.friend_name,
                email: invitation.friend_email,
                avatar: null,
                username: invitation.friend_email.split('@')[0]
              }
            };
          }
        }
        return null;
      })
      .filter(Boolean);
  };

  // Function to enrich invitations with TMDB data
  const enrichInvitationsWithTMDB = async (invitations: any[]) => {
    try {
      // Get unique TMDB IDs and their media types
      const tmdbItems = invitations
        .filter(inv => inv && inv.content && inv.content.tmdb_id)
        .map(inv => ({
          id: inv.content.tmdb_id,
          type: inv.content.media_type || 'movie'
        }))
        .filter((item, index, self) => 
          // Remove duplicates
          index === self.findIndex(t => t.id === item.id && t.type === item.type)
        );

      if (tmdbItems.length === 0) {
        return invitations;
      }

      // Fetch TMDB details for all items
      const tmdbPromises = tmdbItems.map(async (item) => {
        try {
          const response = await fetch('/api/tmdb/full-details', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              tvId: item.id,
              mediaType: item.type 
            }),
          });
          
          if (response.ok) {
            const tmdbData = await response.json();
            return {
              tmdb_id: item.id,
              type: item.type,
              data: tmdbData
            };
          }
        } catch (error) {
          console.error(`Error fetching TMDB data for ${item.type}/${item.id}:`, error);
        }
        return null;
      });

      const tmdbResults = await Promise.all(tmdbPromises);
      const tmdbDataMap = new Map();
      
      tmdbResults
        .filter((result): result is NonNullable<typeof result> => result !== null)
        .forEach(result => {
          tmdbDataMap.set(`${result.tmdb_id}-${result.type}`, result.data);
        });

      // Enrich invitations with TMDB data
      return invitations.map(invitation => {
        if (!invitation.content || !invitation.content.tmdb_id) {
          return invitation;
        }

        const key = `${invitation.content.tmdb_id}-${invitation.content.media_type}`;
        const tmdbData = tmdbDataMap.get(key);

        if (tmdbData) {
          return {
            ...invitation,
            content: {
              tmdb_id: invitation.content.tmdb_id,
              title: tmdbData.title,
              overview: tmdbData.description,
              poster_path: tmdbData.poster,
              media_type: invitation.content.media_type,
              release_date: tmdbData.year ? `${tmdbData.year}-01-01` : null,
              genres: tmdbData.genres || [],
              creator: tmdbData.creator,
              cast: tmdbData.cast || []
            }
          };
        }

        return invitation;
      });

    } catch (error) {
      console.error('Error enriching invitations with TMDB data:', error);
      return invitations;
    }
  };

  useEffect(() => {
    const fetchAllSocialData = async () => {
      try {
        setLoading(true)
        
        // Load all data in parallel
        const [socialData, receivedRequests, sentRequests, receivedWatchInvitations, sentWatchInvitations] = await Promise.all([
          getUserSocial(),
          getReceivedFriendRequests('pending'),
          getSentFriendRequests('pending'),
          getReceivedWatchInvitations('pending'),
          getSentWatchInvitations('pending')
        ])
        
        // Debug logging
        console.log('Received watch invitations:', receivedWatchInvitations)
        console.log('Sent watch invitations:', sentWatchInvitations)
        
        setSocialData(socialData)
        setReceivedRequests(receivedRequests)
        setSentRequests(sentRequests)
        
        // Filter and validate watch invitations data
        // Handle both direct array and wrapped response formats
        const receivedInvitationsData = Array.isArray(receivedWatchInvitations) 
          ? receivedWatchInvitations 
          : receivedWatchInvitations?.data || [];
          
        const sentInvitationsData = Array.isArray(sentWatchInvitations) 
          ? sentWatchInvitations 
          : sentWatchInvitations?.data || [];
        
        // Transform API data to match expected interface structure using helper function
        const validReceivedInvitations = transformWatchInvitationData(receivedInvitationsData, 'received');
        const validSentInvitations = transformWatchInvitationData(sentInvitationsData, 'sent');
        
        // Enrich invitations with TMDB data
        const [enrichedReceivedInvitations, enrichedSentInvitations] = await Promise.all([
          enrichInvitationsWithTMDB(validReceivedInvitations),
          enrichInvitationsWithTMDB(validSentInvitations)
        ]);
        
        console.log('Enriched received invitations:', enrichedReceivedInvitations)
        console.log('Enriched sent invitations:', enrichedSentInvitations)
        
        setReceivedWatchInvitations(enrichedReceivedInvitations)
        setSentWatchInvitations(enrichedSentInvitations)
        
      } catch (err) {
        setError('Error al cargar los datos sociales')
        console.error('Error fetching social data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllSocialData()
  }, [])

  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const email = friendEmail.trim()
    
    if (!email) {
      setRequestMessage('Por favor ingresa un email')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setRequestMessage('Por favor ingresa un email válido')
      return
    }

    try {
      setSendingRequest(true)
      setRequestMessage(null)
      
      const result = await sendFriendRequest(email)
      
      if (result.success) {
        setRequestMessage('Solicitud de amistad enviada exitosamente')
        setFriendEmail('')
        
        // Refresh social data to show updated information
        const [updatedSocialData, updatedSentRequests] = await Promise.all([
          getUserSocial(),
          getSentFriendRequests('pending')
        ])
        setSocialData(updatedSocialData)
        setSentRequests(updatedSentRequests)
        
        // Close modal after a delay
        setTimeout(() => {
          setShowAddFriendModal(false)
          setRequestMessage(null)
        }, 2000)
      } else {
        setRequestMessage(result.message || 'Error al enviar solicitud de amistad')
      }
      
    } catch (err: any) {
      // Handle specific error messages from the Laravel API
      let errorMessage = 'Error al enviar solicitud de amistad';
      
      if (err.message) {
        if (err.message.includes('User with this email not found')) {
          errorMessage = 'No se encontró un usuario con este email';
        } else if (err.message.includes('Cannot send friend request to yourself')) {
          errorMessage = 'No puedes enviarte una solicitud de amistad a ti mismo';
        } else if (err.message.includes('You are already friends with this user')) {
          errorMessage = 'Ya eres amigo de este usuario';
        } else if (err.message.includes('Friend request already pending')) {
          errorMessage = 'Ya hay una solicitud de amistad pendiente con este usuario';
        } else if (err.message.includes('Cannot send friend request to this user')) {
          errorMessage = 'No se puede enviar solicitud de amistad a este usuario';
        } else if (err.message.includes('email')) {
          errorMessage = 'Por favor ingresa un email válido';
        } else {
          errorMessage = err.message;
        }
      }
      
      setRequestMessage(errorMessage);
    } finally {
      setSendingRequest(false)
    }
  }

  const handleRespondToFriendRequest = async (friendshipId: number, action: 'accept' | 'decline') => {
    try {
      if (action === 'accept') {
        setAcceptingRequest(friendshipId)
      } else {
        setDecliningRequest(friendshipId)
      }
      
      const result = await respondToFriendRequest(friendshipId, action)
      
      if (result.success) {
        // Refresh received requests to update the list
        const updatedReceivedRequests = await getReceivedFriendRequests('pending')
        setReceivedRequests(updatedReceivedRequests)
        
        // Also refresh social data if friend was accepted
        if (action === 'accept') {
          const updatedSocialData = await getUserSocial()
          setSocialData(updatedSocialData)
        }
      }
      
    } catch (err: any) {
      console.error('Error responding to friend request:', err)
      // You could add a toast notification here if desired
    } finally {
      setAcceptingRequest(null)
      setDecliningRequest(null)
    }
  }

  const handleRespondToWatchInvitation = async (invitationId: number, action: 'accept' | 'decline') => {
    try {
      if (action === 'accept') {
        setAcceptingWatchInvitation(invitationId)
      } else {
        setDecliningWatchInvitation(invitationId)
      }
      
      const result = await respondToWatchInvitation(invitationId, action)
      
      if (result.success) {
        // Refresh received watch invitations to update the list
        const updatedReceivedWatchInvitations = await getReceivedWatchInvitations('pending')
        
        // Handle both direct array and wrapped response formats with transformation
        const updatedInvitationsData = Array.isArray(updatedReceivedWatchInvitations) 
          ? updatedReceivedWatchInvitations 
          : updatedReceivedWatchInvitations?.data || [];
        
        // Transform and validate the updated data using helper function
        const validUpdatedInvitations = transformWatchInvitationData(updatedInvitationsData, 'received');
        
        // Enrich with TMDB data
        const enrichedUpdatedInvitations = await enrichInvitationsWithTMDB(validUpdatedInvitations);
          
        setReceivedWatchInvitations(enrichedUpdatedInvitations)
      }
      
    } catch (err: any) {
      console.error('Error responding to watch invitation:', err)
      // You could add a toast notification here if desired
    } finally {
      setAcceptingWatchInvitation(null)
      setDecliningWatchInvitation(null)
    }
  }

  const filteredFriends = socialData.friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#ffffff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0de383] mx-auto mb-4"></div>
          <p className="text-[#a1a1aa]">Cargando datos sociales...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#ffffff] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#0de383] text-[#121212] px-4 py-2 rounded-lg hover:bg-[#0de383]/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff]">
      <div className="container mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[#0de383] text-3xl font-bold mb-8">Social</h1>

          <div className="relative mb-8">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#a1a1aa] w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar amigos por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#27272a] border border-[#3f3f46] rounded-lg text-[#ffffff] placeholder-[#a1a1aa] focus:outline-none focus:border-[#0de383] focus:ring-1 focus:ring-[#0de383]"
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-[#27272a] p-1 rounded-lg mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'friends'
                  ? 'bg-[#0de383] text-[#121212]'
                  : 'text-[#a1a1aa] hover:text-[#ffffff]'
              }`}
            >
              Amigos ({socialData.friends.length})
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'received'
                  ? 'bg-[#0de383] text-[#121212]'
                  : 'text-[#a1a1aa] hover:text-[#ffffff]'
              }`}
            >
              Solicitudes Recibidas ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'sent'
                  ? 'bg-[#0de383] text-[#121212]'
                  : 'text-[#a1a1aa] hover:text-[#ffffff]'
              }`}
            >
              Solicitudes Enviadas ({sentRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('watch-received')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'watch-received'
                  ? 'bg-[#0de383] text-[#121212]'
                  : 'text-[#a1a1aa] hover:text-[#ffffff]'
              }`}
            >
              Invitaciones Recibidas ({receivedWatchInvitations.length})
            </button>
            <button
              onClick={() => setActiveTab('watch-sent')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'watch-sent'
                  ? 'bg-[#0de383] text-[#121212]'
                  : 'text-[#a1a1aa] hover:text-[#ffffff]'
              }`}
            >
              Invitaciones Enviadas ({sentWatchInvitations.length})
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'friends' && (
          <>
            {/* Legacy Friend Requests Section (from old API) */}
            {socialData.friendRequests.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#0de383]">Solicitudes de amistad</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {socialData.friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-[#27272a] border border-[#3f3f46] rounded-lg p-6 hover:border-[#0de383] transition-colors"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={request.avatar || "/api/placeholder?width=48&height=48&text=U"}
                          alt={request.name}
                          className="w-12 h-12 rounded-full object-cover bg-[#3f3f46]"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-[#ffffff] text-base">{request.name}</h3>
                          <p className="text-sm text-[#a1a1aa]">{request.email}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 bg-[#0de383] text-[#121212] py-2 px-3 rounded-lg text-sm hover:bg-[#0de383]/90 transition-colors">
                          Aceptar
                        </button>
                        <button className="flex-1 bg-[#3f3f46] text-[#ffffff] py-2 px-3 rounded-lg text-sm hover:bg-[#444444] transition-colors">
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0de383]">
                Amigos ({filteredFriends.length})
              </h2>
              
              {filteredFriends.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#a1a1aa] mb-4">
                    {searchQuery ? "No se encontraron amigos con ese criterio de búsqueda" : "Aún no tienes amigos"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="bg-[#27272a] border border-[#3f3f46] rounded-lg p-6 hover:border-[#0de383] transition-colors"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={friend.avatar || "/api/placeholder?width=48&height=48&text=U"}
                          alt={friend.name}
                          className="w-12 h-12 rounded-full object-cover bg-[#3f3f46]"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-[#ffffff] text-base">{friend.name}</h3>
                          <p className="text-sm text-[#a1a1aa]">{friend.email?.startsWith('@') ? friend.email.substring(1) : friend.email}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex-1 bg-[#3f3f46] text-[#ffffff] py-2 px-3 rounded-lg text-sm hover:bg-[#444444] transition-colors">
                          Visto con {friend.name}
                        </button>
                        <button className="flex-1 bg-[#3f3f46] text-[#ffffff] py-2 px-3 rounded-lg text-sm hover:bg-[#444444] transition-colors">
                          Siguiendo juntos
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Received Friend Requests */}
        {activeTab === 'received' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[#0de383]">
              Solicitudes Recibidas Pendientes ({receivedRequests.length})
            </h2>
            
            {receivedRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#a1a1aa] mb-4">
                  No tienes solicitudes de amistad pendientes
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {receivedRequests.map((request) => (
                  <div
                    key={request.friendship_id}
                    className="bg-[#27272a] border border-[#3f3f46] rounded-lg p-6 hover:border-[#0de383] transition-colors"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={request.sender.avatar || "/api/placeholder?width=48&height=48&text=U"}
                        alt={request.sender.name}
                        className="w-12 h-12 rounded-full object-cover bg-[#3f3f46]"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-[#ffffff] text-base">{request.sender.name}</h3>
                        <p className="text-sm text-[#a1a1aa]">{request.sender.email}</p>
                        <p className="text-xs text-[#a1a1aa] mt-1">
                          {new Date(request.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRespondToFriendRequest(request.friendship_id, 'accept')}
                        className="flex-1 bg-[#0de383] text-[#121212] py-2 px-3 rounded-lg text-sm hover:bg-[#0de383]/90 transition-colors disabled:opacity-50"
                        disabled={acceptingRequest === request.friendship_id || decliningRequest === request.friendship_id}
                      >
                        {acceptingRequest === request.friendship_id ? 'Aceptando...' : 'Aceptar'}
                      </button>
                      <button 
                        onClick={() => handleRespondToFriendRequest(request.friendship_id, 'decline')}
                        className="flex-1 bg-[#3f3f46] text-[#ffffff] py-2 px-3 rounded-lg text-sm hover:bg-[#444444] transition-colors disabled:opacity-50"
                        disabled={acceptingRequest === request.friendship_id || decliningRequest === request.friendship_id}
                      >
                        {decliningRequest === request.friendship_id ? 'Rechazando...' : 'Rechazar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sent Friend Requests */}
        {activeTab === 'sent' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[#0de383]">
              Solicitudes Enviadas Pendientes ({sentRequests.length})
            </h2>
            
            {sentRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#a1a1aa] mb-4">
                  No tienes solicitudes de amistad enviadas pendientes
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sentRequests.map((request) => (
                  <div
                    key={request.friendship_id}
                    className="bg-[#27272a] border border-[#3f3f46] rounded-lg p-6 hover:border-[#0de383] transition-colors"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={request.recipient.avatar || "/api/placeholder?width=48&height=48&text=U"}
                        alt={request.recipient.name}
                        className="w-12 h-12 rounded-full object-cover bg-[#3f3f46]"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-[#ffffff] text-base">{request.recipient.name}</h3>
                        <p className="text-sm text-[#a1a1aa]">{request.recipient.email}</p>
                        <p className="text-xs text-[#a1a1aa] mt-1">
                          {new Date(request.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Received Watch Invitations */}
        {activeTab === 'watch-received' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[#0de383]">
              Invitaciones para Ver Juntos Recibidas ({receivedWatchInvitations.length})
            </h2>
            
            {receivedWatchInvitations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#a1a1aa] mb-4">
                  No tienes invitaciones para ver juntos pendientes
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {receivedWatchInvitations.map((invitation) => {
                  // Defensive checks for data structure
                  if (!invitation || !invitation.sender || !invitation.content) {
                    return null;
                  }
                  
                  return (
                  <div
                    key={invitation.id}
                    className="bg-[#27272a] border border-[#3f3f46] rounded-lg p-6 hover:border-[#0de383] transition-colors"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={invitation.sender?.avatar || "/api/placeholder?width=48&height=48&text=U"}
                        alt={invitation.sender?.name || "Usuario"}
                        className="w-12 h-12 rounded-full object-cover bg-[#3f3f46]"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-[#ffffff] text-base">{invitation.sender?.name || "Usuario desconocido"}</h3>
                        <p className="text-sm text-[#a1a1aa]">{invitation.sender.email?.startsWith('@') ? invitation.sender.email.substring(1) : invitation.sender.email || "Email no disponible"}</p>
                        <p className="text-xs text-[#a1a1aa] mt-1">
                          {invitation.created_at ? new Date(invitation.created_at).toLocaleDateString('es-ES') : "Fecha no disponible"}
                        </p>
                      </div>
                    </div>

                    {/* Content Information */}
                    <div className="mb-4 p-4 bg-[#1a1a1a] rounded-lg">
                      <div className="flex gap-4">
                        <img
                          src={invitation.content?.poster_path 
                            ? (invitation.content.poster_path.startsWith('http') 
                                ? invitation.content.poster_path 
                                : `https://image.tmdb.org/t/p/w154${invitation.content.poster_path}`)
                            : "/api/placeholder?width=80&height=120&text=IMG"
                          }
                          alt={invitation.content?.title || "Contenido"}
                          className="w-16 h-24 rounded object-cover bg-[#3f3f46] flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[#ffffff] text-base mb-1 truncate">{invitation.content?.title || "Título no disponible"}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-[#a1a1aa] bg-[#3f3f46] px-2 py-1 rounded capitalize">
                              {invitation.content?.media_type === 'movie' ? 'Película' : invitation.content?.media_type === 'tv' ? 'Serie' : 'Contenido'}
                            </span>
                            {invitation.content?.release_date && (
                              <span className="text-xs text-[#a1a1aa]">
                                {new Date(invitation.content.release_date).getFullYear()}
                              </span>
                            )}
                          </div>
                          {invitation.content?.overview && (
                            <p className="text-xs text-[#a1a1aa] overflow-hidden mb-2" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                              {invitation.content.overview}
                            </p>
                          )}
                          {invitation.content?.genres && invitation.content.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {invitation.content.genres.slice(0, 3).map((genre: string, index: number) => (
                                <span key={index} className="text-xs bg-[#27272a] text-[#a1a1aa] px-2 py-1 rounded">
                                  {genre}
                                </span>
                              ))}
                              {invitation.content.genres.length > 3 && (
                                <span className="text-xs text-[#a1a1aa]">+{invitation.content.genres.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRespondToWatchInvitation(invitation.id, 'accept')}
                        className="flex-1 bg-[#0de383] text-[#121212] py-2 px-3 rounded-lg text-sm hover:bg-[#0de383]/90 transition-colors disabled:opacity-50"
                        disabled={acceptingWatchInvitation === invitation.id || decliningWatchInvitation === invitation.id}
                      >
                        {acceptingWatchInvitation === invitation.id ? 'Aceptando...' : 'Ver Juntos'}
                      </button>
                      <button 
                        onClick={() => handleRespondToWatchInvitation(invitation.id, 'decline')}
                        className="flex-1 bg-[#3f3f46] text-[#ffffff] py-2 px-3 rounded-lg text-sm hover:bg-[#444444] transition-colors disabled:opacity-50"
                        disabled={acceptingWatchInvitation === invitation.id || decliningWatchInvitation === invitation.id}
                      >
                        {decliningWatchInvitation === invitation.id ? 'Rechazando...' : 'Rechazar'}
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Sent Watch Invitations */}
        {activeTab === 'watch-sent' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[#0de383]">
              Invitaciones para Ver Juntos Enviadas ({sentWatchInvitations.length})
            </h2>
            
            {sentWatchInvitations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#a1a1aa] mb-4">
                  No has enviado invitaciones para ver juntos pendientes
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sentWatchInvitations.map((invitation) => {
                  // Defensive checks for data structure
                  if (!invitation || !invitation.recipient || !invitation.content) {
                    return null;
                  }
                  
                  return (
                  <div
                    key={invitation.id}
                    className="bg-[#27272a] border border-[#3f3f46] rounded-lg p-6 hover:border-[#0de383] transition-colors"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={invitation.recipient?.avatar || "/api/placeholder?width=48&height=48&text=U"}
                        alt={invitation.recipient?.name || "Usuario"}
                        className="w-12 h-12 rounded-full object-cover bg-[#3f3f46]"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-[#ffffff] text-base">{invitation.recipient?.name || "Usuario desconocido"}</h3>
                        <p className="text-sm text-[#a1a1aa]">{invitation.recipient.username || invitation.recipient?.email || "Usuario no disponible"}</p>
                        <p className="text-xs text-[#a1a1aa] mt-1">
                          {invitation.created_at ? new Date(invitation.created_at).toLocaleDateString('es-ES') : "Fecha no disponible"}
                        </p>
                      </div>
                    </div>

                    {/* Content Information */}
                    <div className="mb-4 p-4 bg-[#1a1a1a] rounded-lg">
                      <div className="flex gap-4">
                        <img
                          src={invitation.content?.poster_path 
                            ? (invitation.content.poster_path.startsWith('http') 
                                ? invitation.content.poster_path 
                                : `https://image.tmdb.org/t/p/w154${invitation.content.poster_path}`)
                            : "/api/placeholder?width=80&height=120&text=IMG"
                          }
                          alt={invitation.content?.title || "Contenido"}
                          className="w-16 h-24 rounded object-cover bg-[#3f3f46] flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[#ffffff] text-base mb-1 truncate">{invitation.content?.title || "Título no disponible"}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-[#a1a1aa] bg-[#3f3f46] px-2 py-1 rounded capitalize">
                              {invitation.content?.media_type === 'movie' ? 'Película' : invitation.content?.media_type === 'tv' ? 'Serie' : 'Contenido'}
                            </span>
                            {invitation.content?.release_date && (
                              <span className="text-xs text-[#a1a1aa]">
                                {new Date(invitation.content.release_date).getFullYear()}
                              </span>
                            )}
                          </div>
                          {invitation.content?.overview && (
                            <p className="text-xs text-[#a1a1aa] overflow-hidden mb-2" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                              {invitation.content.overview}
                            </p>
                          )}
                          {invitation.content?.genres && invitation.content.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {invitation.content.genres.slice(0, 3).map((genre: string, index: number) => (
                                <span key={index} className="text-xs bg-[#27272a] text-[#a1a1aa] px-2 py-1 rounded">
                                  {genre}
                                </span>
                              ))}
                              {invitation.content.genres.length > 3 && (
                                <span className="text-xs text-[#a1a1aa]">+{invitation.content.genres.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <span className="text-sm text-[#a1a1aa] bg-[#3f3f46] px-3 py-1 rounded-full">
                        Pendiente de respuesta
                      </span>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center">
          <button 
            onClick={() => setShowAddFriendModal(true)}
            className="bg-[#0de383] text-[#121212] px-6 py-3 rounded-lg font-medium hover:bg-[#0de383]/90 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Añadir amigo
          </button>
        </div>

        {/* Add Friend Modal */}
        {showAddFriendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#27272a] border border-[#3f3f46] rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#0de383]">Añadir Amigo</h2>
                <button
                  onClick={() => {
                    setShowAddFriendModal(false)
                    setFriendEmail('')
                    setRequestMessage(null)
                  }}
                  className="text-[#a1a1aa] hover:text-[#ffffff] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSendFriendRequest}>
                <div className="mb-4">
                  <label htmlFor="friendEmail" className="block text-sm font-medium text-[#ffffff] mb-2">
                    Email del amigo
                  </label>
                  <input
                    type="email"
                    id="friendEmail"
                    value={friendEmail}
                    onChange={(e) => {
                      setFriendEmail(e.target.value)
                      // Clear error message when user starts typing
                      if (requestMessage && (
                        requestMessage.includes('email') || 
                        requestMessage.includes('Email') ||
                        requestMessage.includes('válido')
                      )) {
                        setRequestMessage(null)
                      }
                    }}
                    placeholder="ejemplo@correo.com"
                    className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded-lg text-[#ffffff] placeholder-[#a1a1aa] focus:outline-none focus:ring-1 transition-colors ${
                      requestMessage && (
                        requestMessage.includes('email') || 
                        requestMessage.includes('Email') ||
                        requestMessage.includes('válido') ||
                        requestMessage.includes('encontró') ||
                        requestMessage.includes('mismo')
                      )
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-[#3f3f46] focus:border-[#0de383] focus:ring-[#0de383]'
                    }`}
                    required
                    disabled={sendingRequest}
                  />
                </div>

                {requestMessage && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    requestMessage.includes('exitosamente') || requestMessage.includes('enviada')
                      ? 'bg-green-900/20 text-green-400 border border-green-900/30'
                      : 'bg-red-900/20 text-red-400 border border-red-900/30'
                  }`}>
                    {requestMessage}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddFriendModal(false)
                      setFriendEmail('')
                      setRequestMessage(null)
                    }}
                    className="flex-1 bg-[#3f3f46] text-[#ffffff] py-3 px-4 rounded-lg hover:bg-[#444444] transition-colors"
                    disabled={sendingRequest}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#0de383] text-[#121212] py-3 px-4 rounded-lg font-medium hover:bg-[#0de383]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={sendingRequest}
                  >
                    {sendingRequest ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#121212]"></div>
                        Enviando...
                      </>
                    ) : (
                      'Enviar Solicitud'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
