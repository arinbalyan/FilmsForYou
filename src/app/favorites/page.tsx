'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MovieCard } from '@/components/MovieCard';
import { tmdb } from '@/lib/tmdb';
import type { Movie } from '@/types/movie';
import { ArrowLeft, Heart, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from localStorage
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = localStorage.getItem('filmsForYou_favorites');
      if (stored) {
        const favoriteIds: number[] = JSON.parse(stored);

        // Fetch movie details for each favorite
        const favoriteMovies = await Promise.all(
          favoriteIds.map(async (id: number) => {
            try {
              return await tmdb.getMovieDetails(id);
            } catch (error) {
              console.error(`Failed to fetch movie ${id}:`, error);
              return null;
            }
          })
        );

        setFavorites(favoriteMovies.filter(Boolean) as Movie[]);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = (movieId: number) => {
    try {
      const stored = localStorage.getItem('filmsForYou_favorites');
      if (stored) {
        const favoriteIds: number[] = JSON.parse(stored);
        const updatedIds = favoriteIds.filter(id => id !== movieId);

        localStorage.setItem('filmsForYou_favorites', JSON.stringify(updatedIds));
        setFavorites(prev => prev.filter(movie => movie.id !== movieId));
      }
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    }
  };

  const clearAllFavorites = () => {
    if (confirm('Are you sure you want to clear all favorites?')) {
      localStorage.removeItem('filmsForYou_favorites');
      setFavorites([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your favorites...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </button>
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                My Favorites
              </h1>
            </div>

            {favorites.length > 0 && (
              <button
                onClick={clearAllFavorites}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No favorites yet</h2>
            <p className="text-gray-500 mb-6">
              Start adding movies to your favorites by clicking the heart button on movie pages
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-red-600/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium">{favorites.length} Favorites</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {favorites.map((movie) => (
                <div key={movie.id} className="relative group">
                  <MovieCard
                    movie={movie}
                  />

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromFavorites(movie.id);
                    }}
                    className={cn(
                      "absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-600 rounded-full transition-colors opacity-0 group-hover:opacity-100",
                      "z-10"
                    )}
                  >
                    <Heart className="h-4 w-4 text-white fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/40 backdrop-blur-md border-t border-white/10 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-6 w-6 text-red-400" />
            <span className="text-xl font-bold">FilmsForYou</span>
          </div>
          <p className="text-gray-400">
            Your personal collection of favorite movies
          </p>
        </div>
      </footer>
    </div>
  );
}
