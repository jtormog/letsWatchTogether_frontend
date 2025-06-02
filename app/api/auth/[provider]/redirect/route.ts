import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  if (!['facebook', 'google'].includes(provider)) {
    return NextResponse.json(
      { error: 'Provider not supported' },
      { status: 400 }
    );
  }

  try {
    const laravelCallbackUrl = `${process.env.LARAVEL_API_URL}/api/auth/callback/${provider}`;
    
    let redirectUrl: string;

    switch (provider) {
      case 'facebook':
        redirectUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(laravelCallbackUrl)}&scope=email&response_type=code&state=${generateState()}`;
        break;
      case 'google':
        redirectUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(laravelCallbackUrl)}&scope=openid+profile+email&response_type=code&access_type=offline&prompt=consent&include_granted_scopes=true`;
        break;
      default:
        return NextResponse.json(
          { error: 'Provider not supported' },
          { status: 400 }
        );
    }

    return NextResponse.json(redirectUrl);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}