import React, { useState, useEffect } from 'react';
import './App.css';

// Пример карточек с полями "author" и "date"
const sampleCards = [
  {
    id: 1,
    title: "Название работы 1",
    description: "Краткое описание работы 1.",
    tags: ["фэнтези", "приключения"],
    author: "Автор 11",
    date: "2022-01-15",
  },
  {
    id: 2,
    title: "Название работы 2",
    description: "Краткое описание работы 2.",
    tags: ["научная фантастика", "триллер"],
    author: "Автор 12",
    date: "2021-12-20",
  },
  {
    id: 3,
    title: "Название работы 3",
    description: "Краткое описание работы 3.",
    tags: ["фантастика", "драма"],
    author: "Автор 13",
    date: "2023-03-10",
  },
  {
    id: 4,
    title: "Название работы абоба",
    description: "Краткое описание работы 4.",
    tags: ["приключения", "фантастика"],
    author: "Автор 14",
    date: "2020-05-05",
  },
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteItems, setAutocompleteItems] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('currentUser') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('currentUser'));
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);

  const goToMain = () => {
    setSearchQuery('');
    setAutocompleteItems([]);
    setSelectedCard(null);
  };

  const openCard = (card) => {
    setSelectedCard(card);
  };

  const closeCard = () => {
    setSelectedCard(null);
  };

  const getRelatedCards = (card) => {
    const relatedCards = sampleCards.filter((c) =>
      c.id !== card.id && c.tags.some((tag) => card.tags.includes(tag))
    );
    return relatedCards;
  };

  const changeSelectedCard = (direction) => {
    const relatedCards = getRelatedCards(selectedCard);
    const currentIndex = relatedCards.findIndex((c) => c.id === selectedCard.id);
    let newIndex = currentIndex + direction;

    if (newIndex < 0) newIndex = relatedCards.length - 1; // Если предыдущий, то последний
    if (newIndex >= relatedCards.length) newIndex = 0; // Если следующий, то первый

    setSelectedCard(relatedCards[newIndex]);
    setSelectedCardIndex(newIndex);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <div className="auth-container">
          {/* Аутентификация */}
        </div>
      ) : (
        <>
          <div className="sidebar">
            <a onClick={goToMain} href="#!">
              Главная
            </a>
            <a href="#!">Загрузить работу</a>
            <a href="#!">О проекте</a>
            <a href="#!">Контакты</a>
            <div className="user-info">
              <span>Добро пожаловать, {currentUser}!</span>
            </div>
            <button onClick={() => setIsLoggedIn(false)}>Выйти</button>
          </div>

          <div className="main-content">
            {selectedCard ? (
              <div className="work-page">
                <div className="content">
                  <h1>{selectedCard.title}</h1>
                  <p>{selectedCard.description}</p>
                  <div className="tags-container">
                    {selectedCard.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="card-footer">
                    <div className="author">{selectedCard.author}</div>
                    <div className="date">{selectedCard.date}</div>
                  </div>
                  <div className="related-cards">
                    <button onClick={() => changeSelectedCard(-1)}>Предыдущая</button>
                    <button onClick={() => changeSelectedCard(1)}>Следующая</button>
                  </div>
                  <button className="back-button" onClick={goToMain}>
                    Назад к списку
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Введите теги, название работы, автора или дату для поиска"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {autocompleteItems.length > 0 && (
                    <div className="autocomplete-items">
                      {autocompleteItems.map((item, index) => (
                        <div
                          key={index}
                          className="autocomplete-item"
                          onClick={() => setSearchQuery(item.value)}
                        >
                          {item.value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-grid">
                  {sampleCards.map((card) => (
                    <div key={card.id} className="card" onClick={() => openCard(card)}>
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                      <div className="tags">
                        {card.tags.map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="card-footer">
                        <div className="author">{card.author}</div>
                        <div className="date">{card.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
