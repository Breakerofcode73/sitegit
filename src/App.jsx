import React, { useState, useEffect } from 'react';
import './App.css';

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
  // Состояния для поиска и автозаполнения
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteItems, setAutocompleteItems] = useState([]);

  // Состояния для отображения выбранной работы
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);

  // Состояния для аутентификации
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('currentUser') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('currentUser'));
  const [authMode, setAuthMode] = useState("login");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [authError, setAuthError] = useState("");

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
    const tagSuggestions = allTags
      .filter(tag =>
        tag.toLowerCase().startsWith(currentToken.toLowerCase()) &&
        !alreadyUsed.includes(tag)
      )
      .map(suggestion => ({
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
    const authorSuggestions = uniqueAuthors
      .filter(author =>
        author.toLowerCase().startsWith(currentToken.toLowerCase()) &&
        !alreadyUsed.includes(author)
      )
      .map(suggestion => ({
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

  // Переход к детальной странице работы
  const openCard = (card) => {
    setSelectedCard(card);
    setSelectedCardIndex(0);
  };

  const changeSelectedCard = (direction) => {
    const relatedCards = sampleCards.filter(c =>
      c.id !== selectedCard.id && c.tags.some(tag => selectedCard.tags.includes(tag))
    );
    const currentIndex = relatedCards.findIndex(c => c.id === selectedCard.id);
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = relatedCards.length - 1;
    if (newIndex >= relatedCards.length) newIndex = 0;
    setSelectedCard(relatedCards[newIndex]);
    setSelectedCardIndex(newIndex);
  };

  const goToMain = () => {
    setSearchQuery('');
    setAutocompleteItems([]);
    setSelectedCard(null);
  };

  // Логика аутентификации
  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === loginUsername);
    if (!user) {
      setAuthError("Пользователь не найден. Пожалуйста, зарегистрируйтесь.");
      return;
    }
    if (user.password !== loginPassword) {
      setAuthError("Неверный пароль.");
      return;
    }
    localStorage.setItem("currentUser", loginUsername);
    setCurrentUser(loginUsername);
    setIsLoggedIn(true);
    setLoginUsername("");
    setLoginPassword("");
    setAuthError("");
  };

  const handleRegister = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === registerUsername);
    if (user) {
      setAuthError("Пользователь уже существует. Пожалуйста, войдите.");
      return;
    }
    const newUser = { username: registerUsername, password: registerPassword };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", registerUsername);
    setCurrentUser(registerUsername);
    setIsLoggedIn(true);
    setRegisterUsername("");
    setRegisterPassword("");
    setAuthError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser("");
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <div className="auth-container">
          {authMode === "login" ? (
            <div className="login-form">
              <h2>Вход</h2>
              <input
                type="text"
                placeholder="Имя пользователя"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Пароль"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <button onClick={handleLogin}>Войти</button>
              {authError && <p className="error-message">{authError}</p>}
              <p>
                <a
                  href="#!"
                  className="link"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                  }}
                >
                  Зарегистрируйтесь
                </a>
              </p>
            </div>
          ) : (
            <div className="register-form">
              <h2>Регистрация</h2>
              <input
                type="text"
                placeholder="Имя пользователя"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Пароль"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
              <button onClick={handleRegister}>Зарегистрироваться</button>
              {authError && <p className="error-message">{authError}</p>}
              <p>
                <a
                  href="#!"
                  className="link"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                  }}
                >
                  Войдите
                </a>
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="sidebar">
            <a onClick={goToMain} href="#!">Главная</a>
            <a href="#!">Загрузить работу</a>
            <a href="#!">О проекте</a>
            <a href="#!">Контакты</a>
            <div className="user-info">
              <span>Добро пожаловать, {currentUser}!</span>
            </div>
            <button onClick={handleLogout}>Выйти</button>
          </div>

          <div className="main-content">
            {selectedCard ? (
              <div className="work-page">
                <div className="content">
                  <h1>{selectedCard.title}</h1>
                  <p>{selectedCard.description}</p>
                  <div className="tags-container">
                    {selectedCard.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
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
                  {/* Кнопка "Назад к списку" оформлена как единая гиперссылка (иконка) */}
                  <a className="back-button" href="#!" onClick={goToMain}>
                    &#x2190;
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <div className="search-bar">
                  <input
                    type="text"
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
                <div className="card-grid">
                  {filteredCards.map(card => (
                    <div key={card.id} className="card" onClick={() => openCard(card)}>
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
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
