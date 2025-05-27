'use client';

import { useState, useEffect } from 'react';
import Card from './card';
import { getTopPopularMixed } from '../services/tmdb';

export default function Section({ title }) {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchShows() {
      try {
        setLoading(true);
        const data = await getTopPopularMixed(); // Get 5 items (default)
        
        // Transform TMDB data to match Card component expectations
        const transformedData = data.map(item => ({
          name: item.title || item.name, // Movies have 'title', TV shows have 'name'
          img: item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
            : null,
          type: item.tipo,
          id: item.id
        }));
        
        setShows(transformedData);
      } catch (err) {
        console.error('Error fetching shows:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchShows();
  }, [title]);

  if (loading) {
    return (
      <div data-layer="Section" className="self-stretch w-full px-12 pt-8 pb-8 flex-col mt-16 justify-start items-start gap-4 flex">
        <div data-layer="Container" className="w-full flex justify-between items-center">
          <div data-layer="Heading 2" className="flex-1 flex flex-col justify-start items-start">
            <div data-layer="Recomendado por tus amigos" className="text-white text-2xl font-['Inter'] font-semibold leading-8 break-words">{title}</div>
          </div>
        </div>
        <div data-layer="Container" className="w-full">
          <div className="flex flex-row justify-start items-start gap-5 overflow-x-auto pb-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="w-[250px] flex-col justify-start items-start gap-[8.01px] inline-flex">
                <div className="Container w-full h-[370.37px] relative overflow-hidden rounded-[6px]">
                  <div className="w-full h-[370.37px] left-0 top-0 absolute shadow-[0px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden flex-col justify-start items-start inline-flex">
                    <div className="w-full h-[370.37px] bg-gray-700 animate-pulse" />
                  </div>
                  <div className="w-full h-[370.37px] left-0 top-0 absolute bg-gradient-to-b from-[rgba(9,9,9,0)] to-[rgba(0,0,0,0.25)]" />
                </div>
                <div className="Heading3 w-full overflow-hidden flex-col justify-start items-start flex">
                  <div className="self-stretch h-5 bg-gray-600 animate-pulse rounded" />
                </div>
              </div>
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
            <div data-layer="Recomendado por tus amigos" className="text-white text-2xl font-['Inter'] font-semibold leading-8 break-words">{title}</div>
          </div>
        </div>
        <div data-layer="Container" className="w-full">
          <div className="flex flex-row justify-start items-start gap-5 overflow-x-auto pb-4">
            <div className="text-red-400 text-sm">Error al cargar contenido: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-layer="Section" className="self-stretch w-full px-12 pt-8 pb-8 flex-col mt-16 justify-start items-start gap-4 flex">
      <div data-layer="Container" className="w-full flex justify-between items-center">
        <div data-layer="Heading 2" className="flex-1 flex flex-col justify-start items-start">
          <div data-layer="Recomendado por tus amigos" className="text-white text-2xl font-['Inter'] font-semibold leading-8 break-words">{title}</div>
        </div>
        <div data-layer="Component 5" data-hover="false" data-variant="1" className="flex-col justify-start items-start inline-flex ml-4">
          <div data-layer="Text" className="Text text-emerald-500 text-sm font-['Inter'] font-normal leading-5 break-words ">Ver más</div>
        </div>
      </div>
      <div data-layer="Container" className="w-full">
        <div className="flex flex-row justify-start items-start gap-5 overflow-x-auto pb-4">
          {shows.map(({ name, img, id }) => (
            <Card key={id} name={name} img={img} />
          ))}
        </div>
      </div>
    </div>
  );
}