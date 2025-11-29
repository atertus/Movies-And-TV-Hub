import React, { useState } from 'react';

const Card = ({ title, image, description }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const toggleDescription = () => {
    setShowFullDescription((prev) => !prev);
  };

  return (
    <div className="card">
      <img src={image} alt={title} className="card-image" />
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">
          {showFullDescription ? description : `${description.slice(0, 100)}...`}
        </p>
        <button className="toggle-description-button" onClick={toggleDescription}>
          {showFullDescription ? 'Show Less' : 'Show More'}
        </button>
      </div>
    </div>
  );
};

export default Card;