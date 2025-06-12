// filepath: /Users/jtormog/Proyectos/lets-watch-together-next/app/api/auth/watch-invitations/received/[[...status]]/route.js
import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '../../../../../lib/auth.js';

// Mock data for received watch invitations (fallback when Laravel API is unavailable)
const mockReceivedWatchInvitations = [
  {
    id: 1,
    status: 'pending',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    sender: {
      id: 2,
      name: 'Carlos Martinez',
      email: 'carlos@example.com',
      avatar: null,
      username: 'carlos_m'
    },
    content: {
      tmdb_id: 550,
      title: 'Fight Club',
      overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
      poster_path: 'https://image.tmdb.org/t/p/w342/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      media_type: 'movie',
      release_date: '1999-10-15'
    }
  },
  {
    id: 2,
    status: 'pending',
    created_at: '2024-01-14T15:45:00Z',
    updated_at: '2024-01-14T15:45:00Z',
    sender: {
      id: 3,
      name: 'Ana Lopez',
      email: 'ana@example.com',
      avatar: null,
      username: 'ana_l'
    },
    content: {
      tmdb_id: 82856,
      title: 'The Mandalorian',
      overview: 'After the fall of the Galactic Empire, lawlessness has spread throughout the galaxy.',
      poster_path: 'https://image.tmdb.org/t/p/w342/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',
      media_type: 'tv',
      release_date: '2019-11-12'
    }
  }
];

function getReceivedWatchInvitationsForUser(userId, status) {
  const userMod = parseInt(userId) % 3;
  
  switch (userMod) {
    case 0:
      return mockReceivedWatchInvitations.slice(0, 1);
    case 1:
      return mockReceivedWatchInvitations;
    case 2:
      return [];
    default:
      return mockReceivedWatchInvitations.slice(0, 1);
  }
}

export async function GET(req, { params }) {
  try {
    const { userId, error, status, token } = getUserIdFromRequest(req);
    
    // Get status from params - can be empty array, ['pending'], ['accepted'], ['declined']
    const statusParam = params.status?.[0] || 'pending';
    const validStatuses = ['pending', 'accepted', 'declined'];
    
    if (!validStatuses.includes(statusParam)) {
      return NextResponse.json({
        success: false,
        message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`,
        data: null
      }, { status: 400 });
    }

    // If no authentication, return mock data
    if (error) {
      console.log('No authentication found, returning mock data for received watch invitations');
      const mockData = getReceivedWatchInvitationsForUser(1, statusParam);
      return NextResponse.json({
        success: true,
        message: `Mock watch invitations with status '${statusParam}' retrieved successfully`,
        data: mockData
      });
    }

    try {
      // Call Laravel API to get received watch invitations
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/watch-invitations/received/${statusParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!laravelResponse.ok) {
        const errorData = await laravelResponse.json();
        
        return NextResponse.json({
          success: false,
          message: errorData.message || 'Failed to fetch received watch invitations',
          data: null
        }, { status: laravelResponse.status });
      }

      const laravelData = await laravelResponse.json();
      
      return NextResponse.json({
        success: true,
        message: `Watch invitations with status '${statusParam}' retrieved successfully`,
        data: laravelData.data || laravelData
      });

    } catch (fetchError) {
      console.error('Laravel API error:', fetchError);
      console.log('Falling back to mock data due to Laravel API error');
      const mockData = getReceivedWatchInvitationsForUser(userId, statusParam);
      return NextResponse.json({
        success: true,
        message: `Mock watch invitations with status '${statusParam}' retrieved successfully`,
        data: mockData
      });
    }

  } catch (error) {
    console.error('Get received watch invitations error:', error);
    console.log('Falling back to mock data due to error');
    const mockData = getReceivedWatchInvitationsForUser(1, 'pending');
    return NextResponse.json({
      success: true,
      message: 'Mock watch invitations retrieved successfully',
      data: mockData
    });
  }
}