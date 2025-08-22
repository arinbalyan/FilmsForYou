'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MovieCard } from '@/components/MovieCard';
import { VideoPlayer } from '@/components/VideoPlayer';
import { tmdb, getImageUrl, getBackdropUrl } from '@/lib/tmdb';
import type { Movie, MovieDetails, Credits, Videos, StreamingSource } from '@/types/movie';
import {
  ArrowLeft,
  Play,
  Star,
  Clock,
  Users,
  ExternalLink,
  Heart,
  Share,
  Bookmark
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface MovieDetailsPageProps {
  movieId: number;
}

export const MovieDetailsPage = ({ movieId }: MovieDetailsPageProps) => {
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [videos, setVideos] = useState<Videos | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [streamingSources, setStreamingSources] = useState<StreamingSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchProviders, setWatchProviders] = useState<{ results: Record<string, { flatrate?: unknown[]; rent?: unknown[]; buy?: unknown[] }> } | null>(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const [movieData, creditsData, videosData, watchProvidersData] = await Promise.all([
          tmdb.getMovieDetails(movieId),
          tmdb.getMovieCredits(movieId),
          tmdb.getMovieVideos(movieId),
          tmdb.getWatchProviders(movieId).catch(() => null), // Watch providers might not be available for all movies
        ]);

        setMovie(movieData);
        setCredits(creditsData);
        setVideos(videosData);
        setWatchProviders(watchProvidersData);

        // Fetch similar movies
        const similarResponse = await tmdb.getMoviesByGenre(movieData.genres?.[0]?.id || 28, 1);
        setSimilarMovies(similarResponse.results.slice(0, 6));

        // Create streaming sources from watch providers and trailers
        const sources: StreamingSource[] = [];

        // Add official trailers
        if (videosData.results.some(v => v.type === 'Trailer')) {
          const trailer = videosData.results.find(v => v.type === 'Trailer')!;
          sources.push({
            id: 'youtube-trailer',
            title: 'Official Trailer',
            url: `https://www.youtube.com/watch?v=${trailer.key}`,
            type: 'youtube',
            description: 'Watch the official movie trailer'
          });
        }

        // Add watch providers if available
        if (watchProvidersData?.results?.US) {
          const usProviders = watchProvidersData.results.US;

          // Add streaming services (Netflix, Disney+, Hulu, etc.)
          if (usProviders.flatrate) {
            usProviders.flatrate.slice(0, 8).forEach((provider: unknown) => {
              const p = provider as { provider_id: number; provider_name: string; logo_path?: string };
              const logoUrl = p.logo_path
                ? `https://image.tmdb.org/t/p/w92${p.logo_path}`
                : undefined;

              sources.push({
                id: `streaming-${p.provider_id}`,
                title: p.provider_name,
                url: `https://www.google.com/search?q=${encodeURIComponent(`${p.provider_name} ${movieData.title} movie`)}`,
                type: 'streaming',
                description: `Stream on ${p.provider_name}`,
                logoUrl: logoUrl
              });
            });
          }

          // Add rental services (Amazon, Apple TV, Google Play, etc.)
          if (usProviders.rent) {
            usProviders.rent.slice(0, 6).forEach((provider: unknown) => {
              const p = provider as { provider_id: number; provider_name: string; logo_path?: string };
              const logoUrl = p.logo_path
                ? `https://image.tmdb.org/t/p/w92${p.logo_path}`
                : undefined;

              sources.push({
                id: `rental-${p.provider_id}`,
                title: `Rent on ${p.provider_name}`,
                url: `https://www.google.com/search?q=${encodeURIComponent(`rent ${p.provider_name} ${movieData.title} movie`)}`,
                type: 'rental',
                description: `Rent from ${p.provider_name}`,
                logoUrl: logoUrl
              });
            });
          }

          // Add purchase options
          if (usProviders.buy) {
            usProviders.buy.slice(0, 4).forEach((provider: unknown) => {
              const p = provider as { provider_id: number; provider_name: string; logo_path?: string };
              const logoUrl = p.logo_path
                ? `https://image.tmdb.org/t/p/w92${p.logo_path}`
                : undefined;

              sources.push({
                id: `buy-${p.provider_id}`,
                title: `Buy on ${p.provider_name}`,
                url: `https://www.google.com/search?q=${encodeURIComponent(`buy ${p.provider_name} ${movieData.title} movie`)}`,
                type: 'buy',
                description: `Buy from ${p.provider_name}`,
                logoUrl: logoUrl
              });
            });
          }
        }

        // Add fallback streaming options if no providers available
        if (sources.length === 0 || sources.every(s => s.type === 'youtube')) {
          // Add educational content for documentaries
          if (movieData.genres?.some(g => [99, 36, 10752].includes(g.id))) {
            sources.push({
              id: 'youtube-educational',
              title: 'Educational Content',
              url: `https://www.youtube.com/results?search_query=${encodeURIComponent(movieData.title + ' documentary educational')}`,
              type: 'youtube',
              description: 'Educational and documentary content'
            });
          }

          // Archive.org for public domain
          sources.push({
            id: 'archive-org',
            title: 'Public Domain Archive',
            url: `https://archive.org/search?query=${encodeURIComponent(movieData.title)}`,
            type: 'archive',
            description: 'Search for public domain versions'
          });

          // Vimeo for creative content
          sources.push({
            id: 'vimeo',
            title: 'Creative Commons',
            url: `https://vimeo.com/search?q=${encodeURIComponent(movieData.title)}`,
            type: 'vimeo',
            description: 'Creative Commons and open content'
          });
        }

        setStreamingSources(sources);
      } catch (error) {
        console.error('Failed to fetch movie data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieData();
    }
  }, [movieId]);

  const handlePlayTrailer = (videoKey: string) => {
    setSelectedVideo(videoKey);
    setIsPlaying(true);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setSelectedVideo(null);
  };

  const handleAddToFavorites = () => {
    if (!movie) return;

    try {
      const stored = localStorage.getItem('filmsForYou_favorites');
      let favoriteIds: number[] = stored ? JSON.parse(stored) : [];

      if (!isFavorite) {
        // Add to favorites
        if (!favoriteIds.includes(movie.id)) {
          favoriteIds.push(movie.id);
        }
        console.log(`Added "${movie.title}" to favorites`);
      } else {
        // Remove from favorites
        favoriteIds = favoriteIds.filter(id => id !== movie.id);
        console.log(`Removed "${movie.title}" from favorites`);
      }

      localStorage.setItem('filmsForYou_favorites', JSON.stringify(favoriteIds));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  };

  const handleAddToWatchlist = () => {
    if (!movie) return;

    try {
      const stored = localStorage.getItem('filmsForYou_bookmarks');
      let bookmarkIds: number[] = stored ? JSON.parse(stored) : [];

      if (!isInWatchlist) {
        // Add to bookmarks
        if (!bookmarkIds.includes(movie.id)) {
          bookmarkIds.push(movie.id);
        }
        console.log(`Added "${movie.title}" to watchlist`);
      } else {
        // Remove from bookmarks
        bookmarkIds = bookmarkIds.filter(id => id !== movie.id);
        console.log(`Removed "${movie.title}" from watchlist`);
      }

      localStorage.setItem('filmsForYou_bookmarks', JSON.stringify(bookmarkIds));
      setIsInWatchlist(!isInWatchlist);
    } catch (error) {
      console.error('Failed to update bookmarks:', error);
    }
  };

  const handleShare = () => {
    if (!movie) return;
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: `Check out "${movie.title}" on FilmsForYou!`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      console.log('Movie link copied to clipboard!');
      alert('Movie link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading movie details...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Movie not found</div>
      </div>
    );
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const releaseYear = new Date(movie.release_date).getFullYear();
  const rating = movie.vote_average.toFixed(1);
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Backdrop */}
      <div
        className="relative h-[70vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        {/* Movie Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Poster */}
              <div className="flex-shrink-0">
                <div className="relative w-48 h-72 rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Movie Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold mb-2">{movie.title}</h1>
                  {movie.tagline && (
                    <p className="text-xl text-gray-300 italic">"{movie.tagline}"</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="bg-purple-600 px-3 py-1 rounded-full">{releaseYear}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{runtime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{movie.vote_count.toLocaleString()} votes</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {movie.genres?.map((genre) => (
                    <span
                      key={genre.id}
                      className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                <p className="text-lg text-gray-300 max-w-3xl leading-relaxed">
                  {movie.overview}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  {videos?.results?.some(v => v.type === 'Trailer') && (
                    <button
                      onClick={() => {
                        const trailer = videos.results.find(v => v.type === 'Trailer');
                        if (trailer) {
                          handlePlayTrailer(trailer.key);
                        }
                      }}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      <Play className="h-5 w-5" fill="currentColor" />
                      Watch Trailer
                    </button>
                  )}

                  <button
                    onClick={handleAddToFavorites}
                    className={cn(
                      "flex items-center gap-2 backdrop-blur-sm px-4 py-3 rounded-xl font-medium transition-colors",
                      isFavorite
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>

                  <button
                    onClick={handleAddToWatchlist}
                    className={cn(
                      "flex items-center gap-2 backdrop-blur-sm px-4 py-3 rounded-xl font-medium transition-colors",
                      isInWatchlist
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    )}
                  >
                    <Bookmark className={cn("h-5 w-5", isInWatchlist && "fill-current")} />
                    {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl font-medium transition-colors text-white"
                  >
                    <Share className="h-5 w-5" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {isPlaying && selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            <VideoPlayer
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              title={`${movie.title} - Trailer`}
              onClose={handleClosePlayer}
            />
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Cast */}
        {credits?.cast && credits.cast.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {credits.cast.slice(0, 12).map((person) => (
                <div key={person.id} className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden bg-gray-700">
                    {person.profile_path ? (
                      <img
                        src={getImageUrl(person.profile_path, 'w300')}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Users className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-sm">{person.name}</h3>
                  <p className="text-xs text-gray-400">{person.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Videos */}
        {videos?.results && videos.results.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.results.slice(0, 6).map((video) => (
                <div
                  key={video.id}
                  className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => handlePlayTrailer(video.key)}
                >
                  <img
                    src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                    alt={video.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                    <Play className="h-12 w-12 text-white" fill="currentColor" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <h3 className="font-medium text-sm">{video.name}</h3>
                    <p className="text-xs text-gray-300">{video.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Streaming Sources */}
        {streamingSources.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Where to Watch</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {streamingSources.map((source) => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {source.logoUrl ? (
                      <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-lg overflow-hidden group-hover:bg-white/20 transition-colors">
                        <img
                          src={source.logoUrl}
                          alt={`${source.title} logo`}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Fallback to icon if logo fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="w-5 h-5 text-purple-400"><svg fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 4a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7.414l-2 2V13H5V6h6.586l-2-2H5z"></path></svg></div>';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="p-2 bg-purple-600 rounded-lg">
                        <ExternalLink className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors">
                        {source.title}
                      </h3>
                      <p className="text-sm text-gray-400">{source.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {similarMovies.map((similarMovie) => (
                <MovieCard
                  key={similarMovie.id}
                  movie={similarMovie}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
