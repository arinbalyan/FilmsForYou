# FilmsForYou - Movie Discovery & Information Platform

**Educational Purpose Only**: This platform provides movie discovery, information, and links to legitimate external streaming services. It does not host or stream any content directly. All streaming links redirect to authorized third-party platforms where users can access content legally.

A comprehensive movie information and discovery platform built with Next.js that helps users find movies and connect them with legitimate streaming services.

![FilmsForYou Preview]([https://via.placeholder.com/800x400/1a1a2e/ffffff?text=FilmsForYou+Movie+Platform](https://films-for-you.vercel.app/)](https://films-for-you.vercel.app/))

## 🌟 Features

### 🎬 Core Features
- **Massive Movie Database**: Access to thousands of movies and TV shows
- **Advanced Search & Filtering**: Search by title, genre, language, rating, and release year
- **Official Movie Trailers**: Direct YouTube integration for official trailers
- **Detailed Movie Information**: Cast, crew, plot summaries, and ratings
- **User Collections**: Save favorites and create watchlists
- **Responsive Design**: Perfect experience on desktop, tablet, and mobile

### 🎯 Streaming & OTT Integration
- **150+ Streaming Platforms**: Netflix, Disney+, Hulu, Prime Video, HBO Max, Paramount+
- **Official Provider Logos**: Authentic branding from all major streaming services
- **Direct Streaming Links**: Navigate directly to content on legitimate platforms
- **Regional Content**: Support for US and India specific content
- **Multiple Access Options**: Streaming, rental, and purchase options

### 🔍 Advanced Search Capabilities
- **Multi-Criteria Filtering**: Combine genre, language, rating, and year filters
- **Real-time Search**: Instant results with intelligent suggestions
- **Smart Recommendations**: Similar movies and personalized suggestions
- **New Arrivals**: Latest releases across all platforms
- **Trending Content**: Popular movies and shows

### 💾 User Experience
- **Personal Collections**: Favorites and bookmarks with persistent storage
- **Professional Video Player**: Custom controls with fullscreen support
- **Intuitive Navigation**: Clean, modern interface with smooth animations
- **Loading States**: Professional loading indicators and error handling
- **Keyboard Shortcuts**: Full video player keyboard navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/films-for-you.git
   cd films-for-you
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your API keys:
   ```env
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
   NEXT_PUBLIC_FLIX_API_KEY=your_flix_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ API Configuration

### TMDB API (Required)
1. Visit [TMDB API Settings](https://www.themoviedb.org/settings/api)
2. Create a free account and request an API key
3. Add the key to your `.env.local` file

### Flix OTT Details API (Recommended for enhanced features)
1. Visit [RapidAPI Flix OTT Details](https://rapidapi.com/hmerritt/api/flix-ott-details1/)
2. Subscribe to get your API key
3. Add the key to your `.env.local` file

## 📱 Usage Guide

### Browsing Movies
- **Landing Page**: Explore popular, trending, and upcoming movies
- **Search Bar**: Find specific movies by title
- **Movie Cards**: Click any movie card to view details

### Movie Details Page
- **Watch Trailer**: Official movie trailers play directly
- **Streaming Options**: See all available platforms with logos
- **Add to Favorites**: Heart icon saves to your collection
- **Add to Watchlist**: Bookmark icon for later viewing
- **Cast & Crew**: Full cast information and biographies

### Personal Collections
- **Favorites**: Access via header button with count badge
- **Bookmarks**: Access via header button with count badge
- **Remove Items**: Individual removal or clear all functionality

### Advanced Search
- **Filter Options**: Genre, language, rating, release year
- **Multiple Filters**: Combine different criteria for precise results
- **Pagination**: Navigate through large result sets

## 🏗️ Project Structure

```
films-for-you/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── favorites/         # Favorites collection page
│   │   ├── bookmarks/         # Bookmarks collection page
│   │   ├── movie/[id]/        # Dynamic movie detail pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── MovieCard.tsx      # Movie card component
│   │   ├── MovieDetailsPage.tsx # Movie details page
│   │   ├── VideoPlayer.tsx    # Custom video player
│   │   └── ...
│   ├── lib/                   # Utility libraries
│   │   ├── tmdb.ts           # TMDB API integration
│   │   └── ...
│   └── types/                # TypeScript type definitions
│       └── movie.ts          # Movie-related types
├── public/                   # Static assets
├── .env.local               # Environment variables
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json             # Dependencies and scripts
```
## 🔧 Configuration

### Environment Variables
```env
# Required
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

# Optional (for enhanced features)
NEXT_PUBLIC_FLIX_API_KEY=your_flix_api_key
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for movie data and images
- [Flix OTT Details API](https://rapidapi.com/hmerritt/api/flix-ott-details1/) for comprehensive streaming information
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons


---

**FilmsForYou** - Your ultimate destination for discovering and streaming movies and TV shows from around the world.
