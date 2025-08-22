export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  genres?: Genre[];
  runtime?: number;
  tagline?: string;
  status?: string;
  production_companies?: ProductionCompany[];
  spoken_languages?: SpokenLanguage[];
  adult: boolean;
  video: boolean;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetails extends Movie {
  belongs_to_collection?: Collection;
  budget: number;
  revenue: number;
  runtime: number;
  tagline: string;
  status: string;
  production_companies: ProductionCompany[];
  spoken_languages: SpokenLanguage[];
}

export interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Videos {
  results: Video[];
}

export interface StreamingSource {
  id: string;
  title: string;
  url: string;
  type: 'youtube' | 'vimeo' | 'archive' | 'direct' | 'streaming' | 'rental' | 'buy';
  quality?: string;
  description?: string;
  logoUrl?: string;
}
