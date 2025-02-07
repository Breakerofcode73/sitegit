// src/components/Card.jsx
import React from 'react';

function Card({ card, openModal }) {
  return (
    <div
      className="card"
      data-tags={card.tags.join(', ')}
      onClick={() => openModal(card)}
    >
      <h3>{card.title}</h3>
      <p>{card.description}</p>
      <div className="tags">
        {card.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}

export default Card;