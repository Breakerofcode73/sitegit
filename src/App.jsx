import React, { useState, useEffect } from 'react';
import './App.css';

// Пример карточек с добавленными полями "author" и "date"
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

// Все возможные теги для автодополнения
const allTags = [
  "фэнтези",
  "приключения",
  "научная фантастика",
  "триллер",
  "драма",
  "фантастика",
];

function App() {
  // Состояния: поисковая строка, список автодополнения и выбранная карточка (для модального окна)
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem('searchQuery') || '');
  const [autocompleteItems, setAutocompleteItems] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  // Сохраняем поисковую строку в localStorage и обновляем автодополнение при её изменении
  useEffect(() => {
    localStorage.setItem('searchQuery', searchQuery);
    updateAutocomplete(searchQuery);
  }, [searchQuery]);

  // Функция обновления автодополнения для тегов и названий работ
  const updateAutocomplete = (query) => {
    // Разбиваем строку на токены (слова)
    const tokens = query.split(/\s+/).filter(Boolean);
    let currentToken = "";
    let alreadyUsed = [];
    if (query.endsWith(' ')) {
      // Если последний символ пробел – все токены считаются завершёнными
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
    // Подбираем предложения из тегов
    const tagSuggestions = allTags.filter(tag =>
      tag.toLowerCase().startsWith(currentToken.toLowerCase()) &&
      !alreadyUsed.includes(tag)
    ).map(suggestion => ({
      value: suggestion,
      type: 'Тег',
    }));
    // Подбираем предложения из названий работ (заголовков карточек)
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
    // Объединяем оба массива
    const filtered = [...tagSuggestions, ...titleSuggestions];
    setAutocompleteItems(filtered);
  };

  // Обработчик изменения поисковой строки
  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
  };

  // Функция автодополнения: заменяет текущий токен на выбранное предложение и добавляет пробел для ввода следующего слова
  const completeCurrentToken = (value) => {
    let tokens = searchQuery.split(/\s+/);
    if (searchQuery.endsWith(' ')) {
      // Если строка оканчивается пробелом – просто добавляем новое слово
      tokens.push(value);
    } else {
      tokens[tokens.length - 1] = value;
    }
    const newQuery = tokens.join(' ') + ' ';
    setSearchQuery(newQuery);
    setAutocompleteItems([]);
  };

  // Обработка нажатия клавиши Tab для автодополнения
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (autocompleteItems.length > 0) {
        completeCurrentToken(autocompleteItems[0].value);
      }
    }
  };

  // Разбиваем поисковую строку на токены для фильтрации
  const tokens = searchQuery.trim().split(/\s+/).filter(Boolean);

  // Фильтрация карточек: каждое слово должно встречаться хотя бы в одном из полей: заголовок, описание, теги, автор или дата
  const filteredCards = sampleCards.filter(card => {
    return tokens.every(word => {
      word = word.toLowerCase();
      const inTitle = card.title.toLowerCase().includes(word);
      const inDescription = card.description.toLowerCase().includes(word);
      const inTags = card.tags.some(tag => tag.toLowerCase().includes(word));
      const inAuthor = card.author.toLowerCase().includes(word);
      const inDate = card.date.toLowerCase().includes(word);
      return inTitle || inDescription || inTags || inAuthor || inDate;
    });
  });

  // Функции для сброса фильтра и управления модальным окном
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

  return (
    <div className="App">
      {/* Боковая панель */}
      <div className="sidebar">
        <a onClick={goToMain} href="#!">Главная</a>
        <a href="#!">Загрузить работу</a>
        <a href="#!">О проекте</a>
        <a href="#!">Контакты</a>
      </div>

      {/* Основной контент */}
      <div className="main-content">
        <div className="search-bar" style={{ position: 'relative' }}>
          <input
            type="text"
            id="search-query"
            placeholder="Введите теги, автора или дату для поиска"
            value={searchQuery}
            onChange={handleSearchInput}
            onKeyDown={handleKeyDown}
          />
          {/* Список автодополнения для тегов и названий работ */}
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

        {/* Сетка карточек */}
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
              {/* Автор и дата на новых строках */}
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

      {/* Модальное окно */}
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
            {/* Автор и дата в модальном окне на отдельных строках */}
            <div className="modal-footer">
              <div className="author">{selectedCard.author}</div>
              <div className="date">{selectedCard.date}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

