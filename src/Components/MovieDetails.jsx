import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function MovieDetails() {
  const { contentType, id } = useParams(); // Get contentType and id from the URL
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/${contentType}/${id}?api_key=${API_KEY}&language=en-US`
        );
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [contentType, id, API_KEY]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!details) {
    return <p>Details not found.</p>;
  }

  return (
    <div className="movie-details">
      <h1>{details.title || details.name}</h1>
      <p>
        {details.overview}
      </p>
      <img
        src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
        alt={details.title || details.name}
      />
      <p><strong>Release Date:</strong> {details.release_date || details.first_air_date}</p>
      <p><strong>Genres:</strong> {details.genres?.map((genre) => genre.name).join(', ') || 'N/A'}</p>
      <p>
        <strong>Duration:</strong>{' '}
        {contentType === 'movie'
          ? `${details.runtime || 'N/A'} minutes`
          : details.episode_run_time?.length > 0
          ? `${details.episode_run_time[0]} minutes per episode`
          : 'N/A'}
      </p>
      <button className="Home" onClick={() => navigate('/')}>
        Go Back
      </button>
      {contentType === 'tv' && details.created_by?.length > 0 && (
        <p><strong>Showrunner:</strong> {details.created_by.map((creator) => creator.name).join(', ')}</p>
      )}
    </div>
  );
}

export default MovieDetails;