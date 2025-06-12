// filepath: /Users/jtormog/Proyectos/lets-watch-together-next/app/api/auth/watch-invitation/route.js
import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '../../../lib/auth.js';

export async function POST(req) {
  try {
    const { userId, error, status, token } = getUserIdFromRequest(req);
    
    if (error) {
      return NextResponse.json({ 
        success: false,
        message: error,
        data: null 
      }, { status });
    }

    const { friend_id, tmdb_id, media_type } = await req.json();

    // Validate required fields
    if (!friend_id || !tmdb_id || !media_type) {
      return NextResponse.json({
        success: false,
        message: 'friend_id, tmdb_id and media_type are required',
        data: null
      }, { status: 400 });
    }

    // Validate media_type
    if (!['movie', 'tv'].includes(media_type)) {
      return NextResponse.json({
        success: false,
        message: 'media_type must be either "movie" or "tv"',
        data: null
      }, { status: 400 });
    }

    // Validate friend_id is a number
    if (!Number.isInteger(friend_id) || friend_id <= 0) {
      return NextResponse.json({
        success: false,
        message: 'friend_id must be a valid positive integer',
        data: null
      }, { status: 400 });
    }

    // Validate tmdb_id is a number
    if (!Number.isInteger(tmdb_id) || tmdb_id <= 0) {
      return NextResponse.json({
        success: false,
        message: 'tmdb_id must be a valid positive integer',
        data: null
      }, { status: 400 });
    }

    // Validate media_type
    if (!['movie', 'tv'].includes(media_type)) {
      return NextResponse.json({
        success: false,
        message: 'media_type must be either "movie" or "tv"',
        data: null
      }, { status: 400 });
    }

    // Check if user is trying to send invitation to themselves
    if (parseInt(userId) === friend_id) {
      return NextResponse.json({
        success: false,
        message: 'Cannot send watch invitation to yourself',
        data: null
      }, { status: 400 });
    }

    try {
      // Call Laravel API to send watch invitation
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/watch-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ friend_id, tmdb_id, type: media_type })
      });

      if (!laravelResponse.ok) {
        const errorData = await laravelResponse.json();
        
        return NextResponse.json({
          success: false,
          message: errorData.message || 'Failed to send watch invitation',
          data: null
        }, { status: laravelResponse.status });
      }

      const laravelData = await laravelResponse.json();
      
      return NextResponse.json({
        success: true,
        message: 'Watch invitation sent successfully',
        data: laravelData.data || {
          invitation_id: laravelData.invitation_id,
          friendship_id: laravelData.friendship_id,
          tmdb_id: laravelData.tmdb_id
        }
      }, { status: 201 });

    } catch (fetchError) {
      console.error('Laravel API error:', fetchError);
      return NextResponse.json({
        success: false,
        message: 'Service temporarily unavailable',
        data: null
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Send watch invitation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      data: null
    }, { status: 500 });
  }
}