import { MovieDetailsPage } from '@/components/MovieDetailsPage';

interface MoviePageProps {
  params: {
    id: string;
  };
}

export default function MoviePage({ params }: MoviePageProps) {
  const movieId = parseInt(params.id);

  if (isNaN(movieId)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Invalid movie ID</div>
      </div>
    );
  }

  return <MovieDetailsPage movieId={movieId} />;
}
