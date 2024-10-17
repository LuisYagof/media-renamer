import { load } from 'jsr:@std/dotenv';
// import type { Cast, MediaInfo } from '@/types/tmdb.types.ts';
import type { Cast, MediaInfo } from '../types/tmdb.types.ts';

const env = await load({
  envPath: './env/.env',
  examplePath: './env/.env.template',
});
/*
 * REPLACE TMDB_API_KEY BEFORE RUNNING 'deno run compile'
 */
const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY') || env['TMDB_API_KEY'];
// const TMDB_API_KEY = '<API_KEY>';
const TMDB_API_BASE = 'https://api.themoviedb.org/3';
if (!TMDB_API_KEY) {
  console.error(
    'TMDB_API_KEY not found in environment variables. Please set it in your .env file.',
  );
  Deno.exit(1);
}

export async function searchTMDB(
  query: string,
  type: 'movie' | 'tv',
): Promise<MediaInfo | null> {
  const searchUrl =
    `${TMDB_API_BASE}/search/${type}?api_key=${TMDB_API_KEY}&query=${
      encodeURIComponent(query)
    }`;
  const response = await fetch(searchUrl);
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    const result = data.results[0];
    if (type === 'movie') {
      const director = await getDirector(result.id);
      return {
        title: result.title,
        year: result.release_date.split('-')[0],
        director: director,
      };
    } else {
      return {
        title: result.name,
        year: result.first_air_date.split('-')[0],
      };
    }
  }
  return null;
}

async function getDirector(movieId: number): Promise<string> {
  const creditsUrl =
    `${TMDB_API_BASE}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`;
  const response = await fetch(creditsUrl);
  const data = await response.json();
  const director = data.crew.find((person: Cast) => person.job === 'Director');
  return director ? director.name : 'Unknown';
}
