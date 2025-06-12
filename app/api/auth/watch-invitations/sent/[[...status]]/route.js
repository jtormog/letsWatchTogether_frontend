// filepath: /Users/jtormog/Proyectos/lets-watch-together-next/app/api/auth/watch-invitations/sent/[[...status]]/route.js
import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '../../../../../lib/auth.js';

// Mock data for sent watch invitations (fallback when Laravel API is unavailable)
const mockSentWatchInvitations = [
  {
    id: 3,
    status: 'pending',
    created_at: '2024-01-13T12:20:00Z',
    updated_at: '2024-01-13T12:20:00Z',
    recipient: {
      id: 4,
      name: 'Miguel Santos',
      email: 'miguel@example.com',
      avatar: null,
      username: 'miguel_s'
    },
    content: {
      tmdb_id: 19404,
      title: 'Dilwale Dulhania Le Jayenge',
      overview: 'Raj is a rich, carefree, happy-go-lucky second generation NRI. Simran is the daughter of Chaudhary Baldev Singh.',
      poster_path: 'https://image.tmdb.org/t/p/w342/2CAL2433ZeIihfX1Hb2139CX0pW.jpg',
      media_type: 'movie',
      release_date: '1995-10-20'
    }
  },
  {
    id: 4,
    status: 'pending', 
    created_at: '2024-01-12T18:15:00Z',
    updated_at: '2024-01-12T18:15:00Z',
    recipient: {
      id: 5,
      name: 'Laura Garcia',
      email: 'laura@example.com',
      avatar: null,
      username: 'laura_g'
    },
    content: {
      tmdb_id: 1399,
      title: 'Game of Thrones',
      overview: 'Seven noble families fight for control of the mythical land of Westeros.',
      poster_path: 'https://image.tmdb.org/t/p/w342/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
      media_type: 'tv',
      release_date: '2011-04-17'
    }
  }
];

function getSentWatchInvitationsForUser(userId, status) {
  const userMod = parseInt(userId) % 3;
  
  switch (userMod) {
    case 0:
      return [];
    case 1:
      return mockSentWatchInvitations.slice(0, 1);
    case 2:
      return mockSentWatchInvitations;
    default:
      return mockSentWatchInvitations.slice(0, 1);
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
      console.log('No authentication found, returning mock data for sent watch invitations');
      const mockData = getSentWatchInvitationsForUser(1, statusParam);
      return NextResponse.json({
        success: true,
        message: `Mock watch invitations with status '${statusParam}' retrieved successfully`,
        data: mockData
      });
    }

    try {
      // Call Laravel API to get sent watch invitations
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/watch-invitations/sent/${statusParam}`, {
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
          message: errorData.message || 'Failed to fetch sent watch invitations',
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
      const mockData = getSentWatchInvitationsForUser(userId, statusParam);
      return NextResponse.json({
        success: true,
        message: `Mock watch invitations with status '${statusParam}' retrieved successfully`,
        data: mockData
      });
    }

  } catch (error) {
    console.error('Get sent watch invitations error:', error);
    console.log('Falling back to mock data due to error');
    const mockData = getSentWatchInvitationsForUser(1, 'pending');
    return NextResponse.json({
      success: true,
      message: 'Mock watch invitations retrieved successfully',
      data: mockData
    });
  }
}