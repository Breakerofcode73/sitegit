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

const allTags = [
  "фэнтези",
  "приключения",
  "научная фантастика",
  "триллер",
  "драма",
  "фантастика",
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteItems, setAutocompleteItems] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('username')); // Проверяем, есть ли сохраненная информация о пользователе
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    localStorage.setItem('searchQuery', searchQuery);
    updateAutocomplete(searchQuery);
  }, [searchQuery]);

  const updateAutocomplete = (query) => {
    const tokens = query.split(/\s+/).filter(Boolean);
    let currentToken = "";
    let alreadyUsed = [];
    if (query.endsWith(' ')) {
      alreadyUsed.push(...tokens);
      currentToken = "";
    } else {
      alreadyUsed.push(...tokens.slice(0, tokens.length - 1));
      currentToken = tokens[tokens.length - 1] || "";
    }
    if (!currentToken) {
      setAutocompleteItems([]);
      return;
    }
    const tagSuggestions = allTags.filter(tag =>
      tag.toLowerCase().startsWith(currentToken.toLowerCase()) &&
      !alreadyUsed.includes(tag)
    ).map(suggestion => ({
      value: suggestion,
      type: 'Тег',
    }));
    const titleSuggestions = sampleCards
      .map(card => card.title)
      .filter(title =>
        title.toLowerCase().startsWith(currentToken.toLowerCase()) &&
        !alreadyUsed.includes(title)
      )
      .map(suggestion => ({
        value: suggestion,
        type: 'Работа',
      }));
    const uniqueAuthors = [...new Set(sampleCards.map(card => card.author))];
    const authorSuggestions = uniqueAuthors.filter(author =>
      author.toLowerCase().startsWith(currentToken.toLowerCase()) &&
      !alreadyUsed.includes(author)
    ).map(suggestion => ({
      value: suggestion,
      type: 'Автор',
    }));
    const filtered = [...tagSuggestions, ...titleSuggestions, ...authorSuggestions];
    setAutocompleteItems(filtered);
  };

  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
  };

  const completeCurrentToken = (value) => {
    let tokens = searchQuery.split(/\s+/);
    if (searchQuery.endsWith(' ')) {
      tokens.push(value);
    } else {
      tokens[tokens.length - 1] = value;
    }
    const newQuery = tokens.join(' ') + ' ';
    setSearchQuery(newQuery);
    setAutocompleteItems([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (autocompleteItems.length > 0) {
        completeCurrentToken(autocompleteItems[0].value);
      }
    }
  };

  const tokens = searchQuery.trim().split(/\s+/).filter(Boolean);

  const filteredCards = sampleCards.filter(card => {
    return tokens.every(token => {
      const lowerToken = token.toLowerCase();
      const ddmmyyyyRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
      const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (ddmmyyyyRegex.test(token)) {
        const match = token.match(ddmmyyyyRegex);
        const converted = `${match[3]}-${match[2]}-${match[1]}`;
        return card.date.includes(converted);
      } else if (yyyymmddRegex.test(token)) {
        return card.date.includes(token);
      } else {
        return card.title.toLowerCase().includes(lowerToken) ||
               card.description.toLowerCase().includes(lowerToken) ||
               card.tags.some(tag => tag.toLowerCase().includes(lowerToken)) ||
               card.author.toLowerCase().includes(lowerToken) ||
               card.date.toLowerCase().includes(lowerToken);
      }
    });
  });

  const goToMain = () => {
    setSearchQuery('');
    setAutocompleteItems([]);
    setSelectedCard(null);
  };

  const openModal = (card) => {
    setSelectedCard(card);
  };

  const closeModal = () => {
    setSelectedCard(null);
  };

  const handleLogin = () => {
    if (newUsername && newPassword) {
      localStorage.setItem('username', newUsername);
      localStorage.setItem('password', newPassword); // Сохраняем пароль
      setUsername(newUsername);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    setIsLoggedIn(false);
    setUsername('');
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <div className="login-container">
          <div className="login-form">
            <h2>Создайте аккаунт или войдите</h2>
            <input
              type="text"
              placeholder="Введите ваше имя"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Введите ваш пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Создать аккаунт / Войти</button>
          </div>
        </div>
      ) : (
        <>
          <div className="sidebar">
            <a onClick={goToMain} href="#!">Главная</a>
            <a href="#!">Загрузить работу</a>
            <a href="#!">О проекте</a>
            <a href="#!">Контакты</a>
            <div className="user-info">
              <span>Добро пожаловать, {username}!</span>
            </div>
            <button onClick={handleLogout}>Выйти</button>
          </div>
          <div className="main-content">
            <div className="search-bar">
              <input
                type="text"
                id="search-query"
                placeholder="Введите теги, название работы, автора или дату для поиска"
                value={searchQuery}
                onChange={handleSearchInput}
                onKeyDown={handleKeyDown}
              />
              {autocompleteItems.length > 0 && (
                <div className="autocomplete-items">
                  {autocompleteItems.map((item, index) => (
                    <div
                      key={index}
                      className="autocomplete-item"
                      onClick={() => completeCurrentToken(item.value)}
                    >
                      <span className="suggestion-label">{item.type}:</span> {item.value}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-grid" id="card-grid">
              {filteredCards.map(card => (
                <div key={card.id} className="card" onClick={() => openModal(card)}>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <div className="tags">
                    {card.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="card-footer">
                    <div className="author">{card.author}</div>
                    <div className="date">{card.date}</div>
                  </div>
                </div>
              ))}
              {filteredCards.length === 0 && (
                <p>Нет карточек, соответствующих фильтру</p>
              )}
            </div>
          </div>

          {selectedCard && (
            <div
              id="modal"
              className="modal"
              style={{ display: 'block' }}
              onClick={(e) => {
                if (e.target.id === 'modal') closeModal();
              }}
            >
              <div className="modal-content">
                <span id="modal-close" className="modal-close" onClick={closeModal}>
                  &times;
                </span>
                <h2 id="modal-title">{selectedCard.title}</h2>
                <p id="modal-description">{selectedCard.description}</p>
                <div id="modal-tags" className="tags">
                  {selectedCard.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="modal-footer">
                  <div className="author">{selectedCard.author}</div>
                  <div className="date">{selectedCard.date}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;

