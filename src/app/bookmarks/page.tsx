'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MovieCard } from '@/components/MovieCard';
import { tmdb } from '@/lib/tmdb';
import type { Movie } from '@/types/movie';
import { ArrowLeft, Bookmark, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bookmarks from localStorage
  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const stored = localStorage.getItem('filmsForYou_bookmarks');
      if (stored) {
        const bookmarkIds: number[] = JSON.parse(stored);

        // Fetch movie details for each bookmark
        const bookmarkMovies = await Promise.all(
          bookmarkIds.map(async (id: number) => {
            try {
              return await tmdb.getMovieDetails(id);
            } catch (error) {
              console.error(`Failed to fetch movie ${id}:`, error);
              return null;
            }
          })
        );

        setBookmarks(bookmarkMovies.filter(Boolean) as Movie[]);
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromBookmarks = (movieId: number) => {
    try {
      const stored = localStorage.getItem('filmsForYou_bookmarks');
      if (stored) {
        const bookmarkIds: number[] = JSON.parse(stored);
        const updatedIds = bookmarkIds.filter(id => id !== movieId);

        localStorage.setItem('filmsForYou_bookmarks', JSON.stringify(updatedIds));
        setBookmarks(prev => prev.filter(movie => movie.id !== movieId));
      }
    } catch (error) {
      console.error('Failed to remove from bookmarks:', error);
    }
  };

  const clearAllBookmarks = () => {
    if (confirm('Are you sure you want to clear all bookmarks?')) {
      localStorage.removeItem('filmsForYou_bookmarks');
      setBookmarks([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your bookmarks...</div>
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
              <Bookmark className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                My Bookmarks
              </h1>
            </div>

            {bookmarks.length > 0 && (
              <button
                onClick={clearAllBookmarks}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No bookmarks yet</h2>
            <p className="text-gray-500 mb-6">
              Add movies to your watchlist by clicking the bookmark button on movie pages
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
              <div className="flex items-center gap-2 bg-blue-600/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Bookmark className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">{bookmarks.length} Bookmarks</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {bookmarks.map((movie) => (
                <div key={movie.id} className="relative group">
                  <MovieCard
                    movie={movie}
                  />

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromBookmarks(movie.id);
                    }}
                    className={cn(
                      "absolute top-2 right-2 p-2 bg-black/60 hover:bg-blue-600 rounded-full transition-colors opacity-0 group-hover:opacity-100",
                      "z-10"
                    )}
                  >
                    <Bookmark className="h-4 w-4 text-white fill-current" />
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
            <Bookmark className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">FilmsForYou</span>
          </div>
          <p className="text-gray-400">
            Your personal movie watchlist
          </p>
        </div>
      </footer>
    </div>
  );
}
