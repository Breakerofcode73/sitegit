// src/components/Sidebar.jsx
import React from 'react';

function Sidebar({ tags, addTag, removeTag, goToMain }) {
  return (
    <div className="sidebar">
      <a onClick={goToMain}>Главная</a>
      <a href="#">Загрузить работу</a>
      <a href="#">О проекте</a>
      <a href="#">Контакты</a>
      <div id="tags-container">
        {tags.map(tag => (
          <span key={tag} className="tag-in-search" onClick={() => removeTag(tag)}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;