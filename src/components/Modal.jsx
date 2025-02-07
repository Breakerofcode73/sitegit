// src/components/Modal.jsx
import React from 'react';

const Modal = ({ isOpen, title, description, tags, closeModal }) => {
    if (!isOpen) return null;

    return (
        <div id="modal" className="modal" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span id="modal-close" className="modal-close" onClick={closeModal}>&times;</span>
                <h2 id="modal-title">{title}</h2>
                <p id="modal-description">{description}</p>
                <div id="modal-tags" className="tags">
                    {tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Modal;