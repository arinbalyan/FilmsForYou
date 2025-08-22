import { useState, useEffect } from 'react';
import { tmdb, getBackdropUrl } from '@/lib/tmdb';
import type { Movie } from '@/types/movie';

interface BackgroundState {
  currentImage: string;
  nextImage: string;
  isTransitioning: boolean;
}

export const useDynamicBackground = (intervalMs: number = 8000) => {
  const [state, setState] = useState<BackgroundState>({
    currentImage: '',
    nextImage: '',
    isTransitioning: false,
  });

  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch trending movies for background images
  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        const response = await tmdb.getTrendingMovies('week');
        const moviesWithBackdrops = response.results.filter(
          movie => movie.backdrop_path
        );
        setMovies(moviesWithBackdrops);

        // Set initial background
        if (moviesWithBackdrops.length > 0) {
          const firstImage = getBackdropUrl(moviesWithBackdrops[0].backdrop_path);
          setState(prev => ({
            ...prev,
            currentImage: firstImage,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch trending movies:', error);
        // Load fallback demo movies with backdrops
        loadDemoBackgrounds();
      }
    };

    fetchTrendingMovies();
  }, []);

  // Fallback demo backgrounds
  const loadDemoBackgrounds = () => {
    const demoMovies: Movie[] = [
      {
        id: 1,
        title: "Inception",
        original_title: "Inception",
        overview: "A mind-bending sci-fi thriller about dream infiltration.",
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
        overview: "Batman faces the Joker in a battle for Gotham's soul.",
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
        overview: "A journey through space to save humanity's future.",
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

    setMovies(demoMovies);

    if (demoMovies.length > 0) {
      const firstImage = getBackdropUrl(demoMovies[0].backdrop_path);
      setState(prev => ({
        ...prev,
        currentImage: firstImage,
      }));
    }
  };

  // Auto-rotate backgrounds
  useEffect(() => {
    if (movies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % movies.length;
        const nextImage = getBackdropUrl(movies[nextIndex].backdrop_path);

        setState(prev => ({
          ...prev,
          nextImage,
          isTransitioning: true,
        }));

        // After transition completes, update current image
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            currentImage: nextImage,
            nextImage: '',
            isTransitioning: false,
          }));
        }, 1000); // Match CSS transition duration

        return nextIndex;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [movies, intervalMs]);

  const nextBackground = () => {
    if (movies.length === 0) return;

    const nextIndex = (currentIndex + 1) % movies.length;
    const nextImage = getBackdropUrl(movies[nextIndex].backdrop_path);

    setState(prev => ({
      ...prev,
      nextImage,
      isTransitioning: true,
    }));

    setCurrentIndex(nextIndex);

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentImage: nextImage,
        nextImage: '',
        isTransitioning: false,
      }));
    }, 1000);
  };

  const previousBackground = () => {
    if (movies.length === 0) return;

    const prevIndex = currentIndex === 0 ? movies.length - 1 : currentIndex - 1;
    const prevImage = getBackdropUrl(movies[prevIndex].backdrop_path);

    setState(prev => ({
      ...prev,
      nextImage: prevImage,
      isTransitioning: true,
    }));

    setCurrentIndex(prevIndex);

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentImage: prevImage,
        nextImage: '',
        isTransitioning: false,
      }));
    }, 1000);
  };

  return {
    ...state,
    currentMovie: movies[currentIndex],
    nextBackground,
    previousBackground,
    totalMovies: movies.length,
  };
};
