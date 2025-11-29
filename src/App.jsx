import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'; // Import recharts components
import { PieChart, Pie, Cell } from 'recharts'; // Import PieChart components
import Card from './Components/Card.jsx';
import MovieDetails from './Components/MovieDetails.jsx'; // Import MovieDetails component
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]); // List of genres
  const [selectedGenre, setSelectedGenre] = useState(''); // Selected genre filter
  const [appliedGenre, setAppliedGenre] = useState(''); // Applied genre filter
  const [selectedRuntime, setSelectedRuntime] = useState(''); // Selected runtime filter
  const [appliedRuntime, setAppliedRuntime] = useState(''); // Applied runtime filter
  const [page, setPage] = useState(1); // Track the current page
  const [loading, setLoading] = useState(false); // Track loading state
  const [searchQuery, setSearchQuery] = useState(''); // Track the search query
  const [contentType, setContentType] = useState('movie'); // Filter for TV or Movies

  // Summary statistics
  const [totalItems, setTotalItems] = useState(0); // Total number of items
  const [yearRange, setYearRange] = useState(''); // Range of movie years
  const [mostCommonGenre, setMostCommonGenre] = useState(''); // Most common genre

  const [yearlyData, setYearlyData] = useState([]); // Data for the bar chart
  const [genreChartData, setGenreChartData] = useState([]); // Data for the pie chart

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  // Fetch genres for the sidebar
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/${contentType}/list?api_key=${API_KEY}&language=en-US`
        );
        const data = await response.json();
        setGenres(data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, [API_KEY, contentType]);

  // Fetch movies or TV shows based on search query, genre, runtime, and page
  const fetchMovies = async (pageNumber) => {
    try {
      setLoading(true);

      let url = '';

      if (searchQuery.trim() !== '' && appliedRuntime) {
        // Use the /discover endpoint when both search and runtime filter are applied
        url = `https://api.themoviedb.org/3/discover/${contentType}?api_key=${API_KEY}&language=en-US&page=${pageNumber}&query=${encodeURIComponent(
          searchQuery
        )}`;
      } else if (searchQuery.trim() !== '') {
        // Use the /search endpoint when only search is applied
        url = `https://api.themoviedb.org/3/search/${contentType}?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
          searchQuery
        )}&page=${pageNumber}`;
      } else {
        // Use the /discover endpoint for filters without search
        url = `https://api.themoviedb.org/3/discover/${contentType}?api_key=${API_KEY}&language=en-US&page=${pageNumber}`;
      }

      // Apply genre filter
      if (appliedGenre) {
        url += `&with_genres=${appliedGenre}`;
      }

      // Apply runtime filter (only for movies)
      if (appliedRuntime && contentType === 'movie') {
        if (appliedRuntime === 'short') {
          url += `&with_runtime.lte=90`; // Movies shorter than 90 minutes
        } else if (appliedRuntime === 'medium') {
          url += `&with_runtime.gte=90&with_runtime.lte=120`; // Movies between 90-120 minutes
        } else if (appliedRuntime === 'long') {
          url += `&with_runtime.gte=120`; // Movies longer than 120 minutes
        }
      }

      const response = await fetch(url);
      const data = await response.json();

      const sortedMovies = data.results.sort((a, b) =>
        a.title?.localeCompare(b.title) || a.name?.localeCompare(b.name)
      );

      // Update the movie list
      setMovies((prevMovies) => [...prevMovies, ...sortedMovies]);

      // Update summary statistics
      setTotalItems(data.total_results || sortedMovies.length); // Total number of items

      if (contentType === 'movie') {
        const releaseYears = sortedMovies
          .map((movie) => new Date(movie.release_date).getFullYear())
          .filter((year) => !isNaN(year)) // Filter out invalid years
          .sort((a, b) => a - b); // Sort years in ascending order

        if (releaseYears.length > 0) {
          const earliestYear = releaseYears[0];
          const latestYear = releaseYears[releaseYears.length - 1];
          setYearRange(`${earliestYear} - ${latestYear}`); // Set the year range
        } else {
          setYearRange('N/A'); // No valid years found
        }
      }

      const genreCounts = {};
      sortedMovies.forEach((movie) => {
        if (movie.genre_ids) {
          movie.genre_ids.forEach((genreId) => {
            genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
          });
        }
      });
      const mostCommonGenreId = Object.keys(genreCounts).reduce((a, b) =>
        genreCounts[a] > genreCounts[b] ? a : b
      );
      const genreName = genres.find((genre) => genre.id === parseInt(mostCommonGenreId))
        ?.name;
      setMostCommonGenre(genreName || 'N/A'); // Most common genre
    } catch (error) {
      console.error('Error fetching movies or TV shows:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(page);
  }, [page, appliedGenre, appliedRuntime, contentType]); // Refetch movies or TV shows when page, applied genre, applied runtime, or content type changes

  // Update the bar chart data based on the movies currently displayed
  useEffect(() => {
    const updateChartData = () => {
      const yearCounts = {};
      movies.forEach((movie) => {
        const year = new Date(movie.release_date || movie.first_air_date).getFullYear();
        if (year) {
          yearCounts[year] = (yearCounts[year] || 0) + 1;
        }
      });

      // Convert yearCounts to an array of objects for recharts
      const chartData = Object.keys(yearCounts).map((year) => ({
        year,
        count: yearCounts[year],
      }));

      setYearlyData(chartData);
    };

    updateChartData();
  }, [movies]); // Recalculate chart data whenever the displayed movies change

  // Update the pie chart data based on the movies currently displayed
  useEffect(() => {
    const updateGenreChartData = () => {
      const genreCounts = {};
      movies.forEach((movie) => {
        if (movie.genre_ids) {
          movie.genre_ids.forEach((genreId) => {
            genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
          });
        }
      });

      const chartData = Object.keys(genreCounts).map((genreId) => {
        const genreName = genres.find((genre) => genre.id === parseInt(genreId))?.name;
        return { name: genreName || 'Unknown', value: genreCounts[genreId] };
      });

      setGenreChartData(chartData);
    };

    updateGenreChartData();
  }, [movies, genres]); // Recalculate chart data whenever the displayed movies or genres change

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB', '#FFCE56'];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      setPage(1); // Reset the page number to 1 for a new search
      setMovies([]); // Clear the current movie list
      fetchMovies(1); // Fetch the first page of search results
    }
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1); // Increment the page number
  };

  const handleReset = () => {
    setSearchQuery(''); // Clear the search query
    setPage(1); // Reset the page number
    setMovies([]); // Clear the current movie list
    fetchMovies(1); // Fetch the default popular movies or TV shows
  };

  const applyGenreFilter = () => {
    setPage(1); // Reset the page number
    setMovies([]); // Clear the current movie list
    setAppliedGenre(selectedGenre); // Apply the selected genre
  };

  const clearGenreFilter = () => {
    setPage(1); // Reset the page number
    setMovies([]); // Clear the current movie list
    setSelectedGenre(''); // Clear the selected genre
    setAppliedGenre(''); // Clear the applied genre
  };

  const applyRuntimeFilter = () => {
    setPage(1); // Reset the page number
    setMovies([]); // Clear the current movie list
    setAppliedRuntime(selectedRuntime); // Apply the selected runtime
  };

  const clearRuntimeFilter = () => {
    setPage(1); // Reset the page number
    setMovies([]); // Clear the current movie list
    setSelectedRuntime(''); // Clear the selected runtime
    setAppliedRuntime(''); // Clear the applied runtime
  };

  const handleContentTypeChange = (type) => {
    setPage(1); // Reset the page number
    setMovies([]); // Clear the current movie list
    setContentType(type); // Update the content type (movie or tv)
    setAppliedGenre(''); // Clear the applied genre
    setSelectedGenre(''); // Clear the selected genre
    setAppliedRuntime(''); // Clear the applied runtime
    setSelectedRuntime(''); // Clear the selected runtime
  };

  return (
    <Router>
      <div className="app">
        <h1 className="app-title">Movie & TV Dashboard</h1>
        <Routes>
          <Route
            path="/"
            element={
              <div className="main-container">
                {/* Left Sidebar */}
                <aside className="sidebar">
                  <h2>Filters</h2>
                  <div className="filter-group">
                    <label>Content Type:</label>
                    <div>
                      <button
                        className={`content-type-button ${
                          contentType === 'movie' ? 'active' : ''
                        }`}
                        onClick={() => handleContentTypeChange('movie')}
                      >
                        Movies
                      </button>
                      <button
                        className={`content-type-button ${
                          contentType === 'tv' ? 'active' : ''
                        }`}
                        onClick={() => handleContentTypeChange('tv')}
                      >
                        TV Shows
                      </button>
                    </div>
                  </div>
                  <div className="filter-group">
                    <label htmlFor="genre">Genre:</label>
                    <select
                      id="genre"
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                    >
                      <option value="">All</option>
                      {genres.map((genre) => (
                        <option key={genre.id} value={genre.id}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="apply-filters-button" onClick={applyGenreFilter}>
                    Apply Genre Filter
                  </button>
                  <button className="clear-filters-button" onClick={clearGenreFilter}>
                    Clear Genre Filter
                  </button>
                  <div className="filter-group">
                    <label htmlFor="runtime">Runtime:</label>
                    <select
                      id="runtime"
                      value={selectedRuntime}
                      onChange={(e) => setSelectedRuntime(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="short">Short (&lt; 90 min)</option>
                      <option value="medium">Medium (90-120 min)</option>
                      <option value="long">Long (&gt; 120 min)</option>
                    </select>
                  </div>
                  <button className="apply-filters-button" onClick={applyRuntimeFilter}>
                    Apply Runtime Filter
                  </button>
                  <button className="clear-filters-button" onClick={clearRuntimeFilter}>
                    Clear Runtime Filter
                  </button>
                </aside>

                {/* Main Content */}
                <div className="content">
                  <div className="top-bar">
                    <form className="search-bar" onSubmit={handleSearch}>
                      <input
                        type="text"
                        placeholder="Search for movies or TV shows..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                      />
                      <button type="submit" className="search-button">
                        Search
                      </button>
                    </form>
                    <button className="home-button" onClick={handleReset}>
                      Home
                    </button>
                  </div>
                  <div className="card-grid">
                    {movies.map((movie) => (
                      <Link
                        key={movie.id}
                        to={`/${contentType}/${movie.id}`} // Dynamically link to movie or TV show details
                        className="movie-link"
                      >
                        <Card
                          title={movie.title || movie.name} // Use title for movies and name for TV shows
                          description={movie.overview}
                          image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        />
                      </Link>
                    ))}
                  </div>
                  <div className="load-more-container">
                    <button
                      className="load-more-button"
                      onClick={handleLoadMore}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                </div>

                {/* Summary Statistics */}
                <aside className="summary-sidebar">
                  <h3>Summary Statistics</h3>
                  <p>Total Items: {totalItems}</p>
                  {contentType === 'movie' && <p>Year Range: {yearRange}</p>}
                  <p>Most Common Genre: {mostCommonGenre}</p>
                </aside>

                {/* Yearly Movie Releases */}
                <div className="yearly-releases-container" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div className="yearly-releases">
                    <h3>Yearly Movie Releases</h3>
                    <BarChart
                      width={200}
                      height={200}
                      data={yearlyData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </div>
                </div>

                {/* Genre Distribution */}
                <div className="genre-pie-chart-container" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <div className="genre-pie-chart" style={{ width: '350px', backgroundColor: '#f9f9f9', padding: '1px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                    <h3>Genre Distribution</h3>
                    <PieChart width={300} height={300}>
                      <Pie
                        data={genreChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                      >
                        {genreChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip /> {/* Add Tooltip for hover/click functionality */}
                    </PieChart>
                  </div>
                </div>
              </div>
            }
          />
          <Route path="/:contentType/:id" element={<MovieDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;