import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const width = searchParams.get('width') || '100';
  const height = searchParams.get('height') || '100';
  const text = searchParams.get('text') || '?';
  const bgColor = searchParams.get('bg') || '3f3f46';
  const textColor = searchParams.get('color') || 'ffffff';

  // Generar SVG con las especificaciones
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${bgColor}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="${Math.min(parseInt(width), parseInt(height)) * 0.4}" 
            font-weight="600" 
            fill="#${textColor}">
        ${text.charAt(0).toUpperCase()}
      </text>
    </svg>
  `.trim();

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
