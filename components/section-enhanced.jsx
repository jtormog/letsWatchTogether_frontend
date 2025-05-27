/**
 * Enhanced Section Component with Different Content Types
 * 
 * This is an enhanced version of the section component that can show
 * different types of content based on the section type.
 * 
 * To use this enhanced version, replace the current section.jsx with this file.
 */

'use client';

import { useState, useEffect } from 'react';
import Card from './card';
import { getTopPopularMixed } from '../services/tmdb';

// Enhanced version that could support different content types
export default function SectionEnhanced({ title, type = 'mixed', limit = 10 }) {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchShows() {
      try {
        setLoading(true);
        
        let data;
        
        // Different content based on type or title
        switch (type) {
          case 'trending':
            // Could implement trending content
            data = await getTopPopularMixed(limit);
            break;
          case 'popular-movies':
            // Could implement movies-only content
            data = await getTopPopularMixed(limit);
            break;
          case 'popular-tv':
            // Could implement TV shows-only content
            data = await getTopPopularMixed(limit);
            break;
          case 'mixed':
          default:
            data = await getTopPopularMixed(limit);
            break;
        }
        
        // Transform TMDB data to match Card component expectations
        const transformedData = data.map(item => ({
          name: item.title || item.name,
          img: item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
            : null,
          type: item.tipo,
          id: item.id,
          rating: item.vote_average,
          overview: item.overview
        }));
        
        setShows(transformedData);
      } catch (err) {
        console.error(`Error fetching shows for ${title}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchShows();
  }, [title, type, limit]);

  if (loading) {
    return (
      <div data-layer="Section" className="self-stretch w-full px-12 pt-8 pb-8 flex-col mt-16 justify-start items-start gap-4 flex">
        <div data-layer="Container" className="w-full flex justify-between items-center">
          <div data-layer="Heading 2" className="flex-1 flex flex-col justify-start items-start">
            <div className="text-white text-2xl font-['Inter'] font-semibold leading-8 break-words">{title}</div>
          </div>
        </div>
        <div data-layer="Container" className="w-full">
          <div className="flex flex-row justify-start items-start gap-5 overflow-x-auto pb-4">
            {/* Loading skeleton */}
            {[...Array(5)].map((_, index) => (
              <div key={index} className="w-[250px] h-[400px] bg-gray-800 rounded-lg animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-layer="Section" className="self-stretch w-full px-12 pt-8 pb-8 flex-col mt-16 justify-start items-start gap-4 flex">
        <div data-layer="Container" className="w-full flex justify-between items-center">
          <div data-layer="Heading 2" className="flex-1 flex flex-col justify-start items-start">
            <div className="text-white text-2xl font-['Inter'] font-semibold leading-8 break-words">{title}</div>
          </div>
        </div>
        <div data-layer="Container" className="w-full">
          <div className="flex flex-row justify-start items-start gap-5 overflow-x-auto pb-4">
            <div className="text-red-400 text-sm bg-red-900/20 p-4 rounded-lg">
              Error al cargar contenido: {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-layer="Section" className="self-stretch w-full px-12 pt-8 pb-8 flex-col mt-16 justify-start items-start gap-4 flex">
      <div data-layer="Container" className="w-full flex justify-between items-center">
        <div data-layer="Heading 2" className="flex-1 flex flex-col justify-start items-start">
          <div className="text-white text-2xl font-['Inter'] font-semibold leading-8 break-words">{title}</div>
          {shows.length > 0 && (
            <div className="text-gray-400 text-sm mt-1">
              {shows.length} elementos • Actualizado desde TMDB
            </div>
          )}
        </div>
        <div data-layer="Component 5" data-hover="false" data-variant="1" className="flex-col justify-start items-start inline-flex ml-4">
          <div className="text-emerald-500 text-sm font-['Inter'] font-normal leading-5 break-words cursor-pointer hover:text-emerald-400 transition-colors">
            Ver más
          </div>
        </div>
      </div>
      <div data-layer="Container" className="w-full">
        <div className="flex flex-row justify-start items-start gap-5 overflow-x-auto pb-4">
          {shows.map(({ name, img, id, rating }) => (
            <div key={id} className="flex-shrink-0">
              <Card name={name} img={img} />
              {rating && (
                <div className="text-yellow-400 text-xs mt-1 flex items-center">
                  ⭐ {rating.toFixed(1)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Usage examples:
// <SectionEnhanced title="Tendencias" type="trending" limit={8} />
// <SectionEnhanced title="Películas Populares" type="popular-movies" limit={12} />
// <SectionEnhanced title="Series Populares" type="popular-tv" limit={6} />
// <SectionEnhanced title="Recomendado para ti" type="mixed" limit={10} />
