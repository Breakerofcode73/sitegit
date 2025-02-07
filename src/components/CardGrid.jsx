// src/components/Card.jsx
import React from 'react';

const Card = ({ title, description, tags, openModal }) => {
    return (
        <div className="card" data-tags={tags.join(', ')} onClick={() => openModal({ title, description, tags })}>
            <h3>{title}</h3>
            <p>{description}</p>
            <div className="tags">
                {tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                ))}
            </div>
        </div>
    );
};

export default Card;