'use client';

import { useState, useEffect } from 'react';
import { MovieCard } from '@/components/MovieCard';
import { useDynamicBackground } from '@/hooks/useDynamicBackground';
import { tmdb } from '@/lib/tmdb';
import type { Movie, MovieResponse } from '@/types/movie';
import { Play, Search, Film, Star, TrendingUp, Calendar, Clock, ChevronLeft, ChevronRight, Heart, Bookmark } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Home() {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);

  const {
    currentImage,
    nextImage,
    isTransitioning,
    currentMovie,
    nextBackground,
    previousBackground,
    totalMovies
  } = useDynamicBackground();

  // Fetch initial movie data
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [popular, topRated, trending, upcoming] = await Promise.all([
          tmdb.getPopularMovies(1),
          tmdb.getTopRatedMovies(1),
          tmdb.getTrendingMovies('week'),
          tmdb.getUpcomingMovies(1),
        ]);

        setPopularMovies(popular.results);
        setTopRatedMovies(topRated.results);
        setTrendingMovies(trending.results);
        setUpcomingMovies(upcoming.results);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
        // Load fallback demo movies if API fails
        loadDemoMovies();
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Load favorites and bookmarks counts
  useEffect(() => {
    const loadCounts = () => {
      try {
        const favorites = localStorage.getItem('filmsForYou_favorites');
        if (favorites) {
          const favoriteIds = JSON.parse(favorites);
          setFavoritesCount(favoriteIds.length);
        }

        const bookmarks = localStorage.getItem('filmsForYou_bookmarks');
        if (bookmarks) {
          const bookmarkIds = JSON.parse(bookmarks);
          setBookmarksCount(bookmarkIds.length);
        }
      } catch (error) {
        console.error('Failed to load counts:', error);
      }
    };

    loadCounts();

    // Listen for storage changes to update counts
    const handleStorageChange = () => loadCounts();
    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fallback demo movies for when API is not working
  const loadDemoMovies = () => {
    const demoMovies: Movie[] = [
      {
        id: 1,
        title: "Inception",
        original_title: "Inception",
        overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
        release_date: "2010-07-16",
        vote_average: 8.4,
        vote_count: 34495,
        popularity: 83.952,
        genre_ids: [28, 878, 12],
        adult: false,
        video: false
      },
      {
        id: 2,
        title: "The Dark Knight",
        original_title: "The Dark Knight",
        overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
        poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
        release_date: "2008-07-18",
        vote_average: 8.5,
        vote_count: 30619,
        popularity: 82.13,
        genre_ids: [18, 28, 80, 53],
        adult: false,
        video: false
      },
      {
        id: 3,
        title: "Interstellar",
        original_title: "Interstellar",
        overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
        poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
        release_date: "2014-11-07",
        vote_average: 8.4,
        vote_count: 32571,
        popularity: 140.241,
        genre_ids: [12, 18, 878],
        adult: false,
        video: false
      }
    ];

    // Duplicate movies to fill all categories
    setPopularMovies([...demoMovies, ...demoMovies, ...demoMovies]);
    setTopRatedMovies([...demoMovies, ...demoMovies, ...demoMovies]);
    setTrendingMovies([...demoMovies, ...demoMovies, ...demoMovies]);
    setUpcomingMovies([...demoMovies, ...demoMovies, ...demoMovies]);
  };

  // Search functionality
  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await tmdb.searchMovies(query, 1);
      setSearchResults(results.results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Movie card navigation is now handled internally by MovieCard component

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading FilmsForYou...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        {currentImage && (
          <div
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-opacity duration-1000",
              isTransitioning ? "opacity-0" : "opacity-100"
            )}
            style={{ backgroundImage: `url(${currentImage})` }}
          />
        )}
        {nextImage && isTransitioning && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-100"
            style={{ backgroundImage: `url(${nextImage})` }}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FilmsForYou
              </h1>
            </div>

            {/* Navigation & Search */}
            <div className="hidden md:flex items-center gap-4">
              {/* Favorites Button */}
              <button
                onClick={() => window.location.href = '/favorites'}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg transition-colors relative"
              >
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium">Favorites</span>
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* Bookmarks Button */}
              <button
                onClick={() => window.location.href = '/bookmarks'}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg transition-colors relative"
              >
                <Bookmark className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">Bookmarks</span>
                {bookmarksCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {bookmarksCount}
                  </span>
                )}
              </button>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/50 border border-white/20 rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/50 border border-white/20 rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Discover Amazing Films
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Explore thousands of movies from around the world. Watch educational content, documentaries, and creative films—all completely free.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Film className="h-4 w-4 text-purple-400" />
                <span>Free Educational Content</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>Public Domain Films</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span>Trending Movies</span>
              </div>
            </div>
          </div>

          {/* Background Controls */}
          {totalMovies > 1 && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={previousBackground}
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalMovies }).map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === 0 ? "bg-white" : "bg-white/30 hover:bg-white/50"
                    )}
                  />
                ))}
              </div>
              <button
                onClick={nextBackground}
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Search Results */}
      {searchQuery && (searchResults.length > 0 || isSearching) && (
        <section className="relative z-10 py-16 bg-black/20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">Search Results</h2>
            {isSearching ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="aspect-[2/3] bg-gray-800 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {searchResults.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Movie Sections */}
      {!searchQuery && (
        <>
          {/* Popular Movies */}
          <section className="relative z-10 py-16 bg-black/20 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-8">
                <Star className="h-6 w-6 text-yellow-400" />
                <h2 className="text-3xl font-bold">Popular Movies</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {popularMovies.map((movie, index) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    priority={index < 6}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Top Rated Movies */}
          <section className="relative z-10 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="h-6 w-6 text-green-400" />
                <h2 className="text-3xl font-bold">Top Rated</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {topRatedMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Trending Movies */}
          <section className="relative z-10 py-16 bg-black/20 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="h-6 w-6 text-purple-400" />
                <h2 className="text-3xl font-bold">Trending Now</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {trendingMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Upcoming Movies */}
          <section className="relative z-10 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-8">
                <Calendar className="h-6 w-6 text-blue-400" />
                <h2 className="text-3xl font-bold">Coming Soon</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {upcomingMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                  />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="relative z-10 bg-black/40 backdrop-blur-md border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Film className="h-6 w-6 text-purple-400" />
            <span className="text-xl font-bold">FilmsForYou</span>
          </div>
          <p className="text-gray-400 mb-4">
            Discover and watch free educational content, documentaries, and public domain films from around the world.
          </p>
          <div className="text-sm text-gray-500">
            Powered by TMDB API • All content sourced from legitimate free platforms
          </div>
        </div>
      </footer>
    </div>
  );
}
