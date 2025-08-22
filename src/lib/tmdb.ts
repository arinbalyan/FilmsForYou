import axios from 'axios';
import type {
  Movie,
  MovieDetails,
  MovieResponse,
  Genre,
  Credits,
  Videos,
  StreamingSource
} from '@/types/movie';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// You can get a free API key from https://www.themoviedb.org/settings/api
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '8aa7d58f2c4c40d4e6eb3b2f1e3e1b'; // Demo key for testing

// Flix OTT Details API - Comprehensive streaming data
const FLIX_API_BASE_URL = 'https://flix-ott-details1.p.rapidapi.com';
const FLIX_API_KEY = process.env.NEXT_PUBLIC_FLIX_API_KEY || 'your-flix-api-key'; // Replace with actual key
const FLIX_API_HOST = 'flix-ott-details1.p.rapidapi.com';

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

const flixApi = axios.create({
  baseURL: FLIX_API_BASE_URL,
  headers: {
    'X-RapidAPI-Key': FLIX_API_KEY,
    'X-RapidAPI-Host': FLIX_API_HOST,
  },
});

export const tmdb = {
  // Get popular movies
  getPopularMovies: async (page: number = 1): Promise<MovieResponse> => {
    const response = await tmdbApi.get(`/movie/popular`, {
      params: { page, language: 'en-US' },
    });
    return response.data;
  },

  // Get top rated movies
  getTopRatedMovies: async (page: number = 1): Promise<MovieResponse> => {
    const response = await tmdbApi.get(`/movie/top_rated`, {
      params: { page, language: 'en-US' },
    });
    return response.data;
  },

  // Get now playing movies
  getNowPlayingMovies: async (page: number = 1): Promise<MovieResponse> => {
    const response = await tmdbApi.get(`/movie/now_playing`, {
      params: { page, language: 'en-US' },
    });
    return response.data;
  },

  // Get upcoming movies
  getUpcomingMovies: async (page: number = 1): Promise<MovieResponse> => {
    const response = await tmdbApi.get(`/movie/upcoming`, {
      params: { page, language: 'en-US' },
    });
    return response.data;
  },

  // Get movie details by ID
  getMovieDetails: async (movieId: number): Promise<MovieDetails> => {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: { language: 'en-US' },
    });
    return response.data;
  },

  // Get movie credits (cast and crew)
  getMovieCredits: async (movieId: number): Promise<Credits> => {
    const response = await tmdbApi.get(`/movie/${movieId}/credits`);
    return response.data;
  },

  // Get movie videos (trailers, clips, etc.)
  getMovieVideos: async (movieId: number): Promise<Videos> => {
    const response = await tmdbApi.get(`/movie/${movieId}/videos`, {
      params: { language: 'en-US' },
    });
    return response.data;
  },

  // Search movies
  searchMovies: async (query: string, page: number = 1): Promise<MovieResponse> => {
    const response = await tmdbApi.get(`/search/movie`, {
      params: { query, page, language: 'en-US' },
    });
    return response.data;
  },

  // Get movie genres
  getGenres: async (): Promise<{ genres: Genre[] }> => {
    const response = await tmdbApi.get(`/genre/movie/list`, {
      params: { language: 'en-US' },
    });
    return response.data;
  },

  // Get movies by genre
  getMoviesByGenre: async (genreId: number, page: number = 1): Promise<MovieResponse> => {
    const response = await tmdbApi.get(`/discover/movie`, {
      params: {
        with_genres: genreId,
        page,
        language: 'en-US',
        sort_by: 'popularity.desc'
      },
    });
    return response.data;
  },

  // Get trending movies (day or week)
  getTrendingMovies: async (timeWindow: 'day' | 'week' = 'week'): Promise<MovieResponse> => {
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`, {
      params: { language: 'en-US' },
    });
    return response.data;
  },

  // Get watch providers for a movie
  getWatchProviders: async (movieId: number): Promise<any> => {
    const response = await tmdbApi.get(`/movie/${movieId}/watch/providers`);
    return response.data;
  },

  // Get all movie providers with logos
  getMovieProviders: async (): Promise<any> => {
    const response = await tmdbApi.get(`/watch/providers/movie`);
    return response.data;
  },
};

// Flix OTT Details API - Enhanced search and comprehensive streaming data
export const flix = {
  // Advanced search with multiple filters
  advancedSearch: async (params: {
    title?: string;
    genre?: string;
    language?: string;
    rating?: number;
    year?: number;
    region?: 'US' | 'IN';
    page?: number;
  } = {}): Promise<any> => {
    const queryParams: any = {};

    if (params.title) queryParams.title = params.title;
    if (params.genre) queryParams.genre = params.genre;
    if (params.language) queryParams.language = params.language;
    if (params.rating) queryParams.imdb_rating = params.rating;
    if (params.year) queryParams.year = params.year;
    if (params.region) queryParams.region = params.region;
    if (params.page) queryParams.page = params.page;

    const response = await flixApi.get('/advanced_search', { params: queryParams });
    return response.data;
  },

  // Get movie details by IMDB ID
  getTitleDetails: async (imdbId: string): Promise<any> => {
    const response = await flixApi.get('/title_details', {
      params: { imdbid: imdbId }
    });
    return response.data;
  },

  // Get additional title details (cast, reviews, etc.)
  getAdditionalTitleDetails: async (imdbId: string): Promise<any> => {
    const response = await flixApi.get('/additional_title_details', {
      params: { imdbid: imdbId }
    });
    return response.data;
  },

  // Get OTT providers list
  getOTTProviders: async (region: 'US' | 'IN' = 'US'): Promise<any> => {
    const response = await flixApi.get('/ott_providers', {
      params: { region }
    });
    return response.data;
  },

  // Get new arrivals
  getNewArrivals: async (region: 'US' | 'IN' = 'US'): Promise<any> => {
    const response = await flixApi.get('/new_arrivals', {
      params: { region }
    });
    return response.data;
  },

  // Get genres list
  getGenres: async (): Promise<any> => {
    const response = await flixApi.get('/genres');
    return response.data;
  },

  // Get languages list
  getLanguages: async (): Promise<any> => {
    const response = await flixApi.get('/languages');
    return response.data;
  },

  // Simple title search
  searchTitles: async (title: string, region: 'US' | 'IN' = 'US'): Promise<any> => {
    const response = await flixApi.get('/search', {
      params: { title, region }
    });
    return response.data;
  },

  // Get cast/crew details
  getPeopleInfo: async (peopleId: string): Promise<any> => {
    const response = await flixApi.get('/people_info', {
      params: { peopleid: peopleId }
    });
    return response.data;
  },
};

// Image URL helpers
export const getImageUrl = (path: string | null, size: 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'): string => {
  if (!path) return '/placeholder-movie.jpg';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string => {
  if (!path) return '/placeholder-backdrop.jpg';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Mock streaming sources for demonstration
// In a real app, you would integrate with actual streaming services
export const getStreamingSources = (movie: Movie): StreamingSource[] => {
  const sources: StreamingSource[] = [];

  // YouTube educational/documentary content
  if (movie.genres?.some(g => [99, 36, 10752].includes(g.id))) {
    sources.push({
      id: 'youtube-educational',
      title: 'Educational Content',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' documentary')}`,
      type: 'youtube',
      description: 'Educational and documentary content related to this film'
    });
  }

  // Archive.org public domain content
  sources.push({
    id: 'archive-org',
    title: 'Public Domain Archive',
    url: `https://archive.org/search?query=${encodeURIComponent(movie.title)}`,
    type: 'archive',
    description: 'Search for public domain versions'
  });

  // Vimeo creative content
  sources.push({
    id: 'vimeo',
    title: 'Creative Commons',
    url: `https://vimeo.com/search?q=${encodeURIComponent(movie.title)}`,
    type: 'vimeo',
    description: 'Creative Commons and open content'
  });

  return sources;
};
