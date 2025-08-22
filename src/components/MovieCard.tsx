'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, Star, Calendar, Clock, Youtube, ExternalLink } from 'lucide-react';
import { getImageUrl } from '@/lib/tmdb';
import { cn } from '@/utils/cn';
import type { Movie } from '@/types/movie';

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
  className?: string;
}

export const MovieCard = ({ movie, priority = false, className }: MovieCardProps) => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  const handleCardClick = () => {
    router.push(`/movie/${movie.id}`);
  };

  const handleTrailerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to movie details page where the trailer will play
    window.location.href = `/movie/${movie.id}`;
  };

  const handleStreamClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/movie/${movie.id}`);
  };

  return (
    <div
      className={cn(
        "group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-xl bg-gray-900/50 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25",
        className
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-50" />

      {/* Movie Poster */}
      <div className="relative h-full w-full">
        {!imageError ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            priority={priority}
            className={cn(
              "object-cover transition-all duration-700 group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0",
              "group-hover:brightness-110"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <div className="mb-2 text-2xl">🎬</div>
              <div className="text-sm font-medium">{movie.title}</div>
            </div>
          </div>
        )}

        {/* Loading Shimmer */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 animate-pulse bg-gray-700" />
        )}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
        {/* Top Section - Rating */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{rating}</span>
          </div>
        </div>

        {/* Middle Section - Movie Info */}
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-sm font-bold leading-tight transition-all duration-300 group-hover:text-base">
            {movie.title}
          </h3>

          <div className="flex items-center gap-3 text-xs text-gray-300">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{releaseYear}</span>
            </div>
            {movie.runtime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{movie.runtime}m</span>
              </div>
            )}
          </div>

          {/* Movie Description */}
          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {movie.overview || 'No description available'}
          </p>
        </div>

        {/* Bottom Section - Action Buttons */}
        <div className={cn(
          "flex items-center gap-2 transition-all duration-300",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          <button
            onClick={handleTrailerClick}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            <Youtube className="h-3 w-3" />
            Trailer
          </button>
          <button
            onClick={handleStreamClick}
            className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Stream
          </button>
        </div>
      </div>

      {/* Hover Actions Overlay */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTrailerClick}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-red-700"
          >
            <Youtube className="h-5 w-5" />
          </button>
          <button
            onClick={handleStreamClick}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-purple-700"
          >
            <Play className="h-5 w-5" fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Animated Border */}
      <div className="absolute inset-0 rounded-xl ring-2 ring-transparent transition-all duration-300 group-hover:ring-purple-500/50" />

      {/* Shine Effect */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000",
        isHovered ? "translate-x-full" : "-translate-x-full"
      )} />
    </div>
  );
};
