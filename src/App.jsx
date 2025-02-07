import React, { useState, useEffect } from 'react';
import './App.css';

// Пример карточек (можете добавить свои)
const sampleCards = [
  {
    id: 1,
    title: "Название работы 1",
    description: "Краткое описание работы 1.",
    tags: ["фэнтези", "приключения"],
  },
  {
    id: 2,
    title: "Название работы 2",
    description: "Краткое описание работы 2.",
    tags: ["научная фантастика", "триллер"],
  },
  {
    id: 3,
    title: "Название работы 3",
    description: "Краткое описание работы 3.",
    tags: ["фантастика", "драма"],
  },
  {
    id: 4,
    title: "Название работы 4",
    description: "Краткое описание работы 4.",
    tags: ["приключения", "фантастика"],
  },
];

// Массив всех возможных тегов для автодополнения
const allTags = [
  "фэнтези",
  "приключения",
  "научная фантастика",
  "триллер",
  "драма",
  "фантастика",
];

function App() {
  // Состояния: выбранные теги, строка поиска, список автодополнения и выбранная карточка (для модального окна)
  const [selectedTags, setSelectedTags] = useState(() => {
    const stored = localStorage.getItem('searchTags');
    return stored ? JSON.parse(stored) : [];
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem('searchQuery') || '';
  });
  const [autocompleteItems, setAutocompleteItems] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  // Сохраняем выбранные теги и поисковую строку в localStorage
  useEffect(() => {
    localStorage.setItem('searchTags', JSON.stringify(selectedTags));
  }, [selectedTags]);

  useEffect(() => {
    localStorage.setItem('searchQuery', searchQuery);
  }, [searchQuery]);

  // Обновление списка автодополнения по введённому тексту
  const updateAutocomplete = (query) => {
    const trimmed = query.trim();
    if (trimmed === '') {
      setAutocompleteItems([]);
    } else {
      const filtered = allTags.filter(tag =>
        tag.toLowerCase().includes(trimmed.toLowerCase()) &&
        !selectedTags.includes(tag)
      ).sort();
      setAutocompleteItems(filtered);
    }
  };

  // Обработчик ввода в поле поиска
  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    updateAutocomplete(query);
  };

  // Обработка нажатия клавиш в поле ввода
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = searchQuery.trim();
      if (!trimmed) return;
      // Добавляем тег только если введённый текст точно совпадает с одним из допустимых тегов
      if (allTags.includes(trimmed) && !selectedTags.includes(trimmed)) {
        addTag(trimmed);
      }
      // Если совпадения нет, не добавляем автоматически, даём пользователю выбрать из списка
    }
  };

  // Добавление тега
  const addTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
    setSearchQuery('');
    setAutocompleteItems([]);
  };

  // Удаление тега (при клике по тегу в строке поиска)
  const removeTag = (tag) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  // Фильтрация карточек с учётом выбранных тегов и текста из поисковой строки
  const filteredCards = sampleCards.filter(card => {
    // Проверяем, что карточка содержит все выбранные теги (без учёта регистра)
    const cardTags = card.tags.map(t => t.toLowerCase());
    const matchesTags = selectedTags.every(tag =>
      cardTags.includes(tag.toLowerCase())
    );

    // Если в поисковой строке есть текст, проверяем, что он содержится в заголовке, описании или тегах карточки
    const queryLower = searchQuery.toLowerCase().trim();
    const matchesQuery =
      queryLower === '' ||
      card.title.toLowerCase().includes(queryLower) ||
      card.description.toLowerCase().includes(queryLower) ||
      cardTags.some(t => t.includes(queryLower));

    return matchesTags && matchesQuery;
  });

  // Сброс фильтров и закрытие модального окна
  const goToMain = () => {
    setSelectedTags([]);
    setSearchQuery('');
    setAutocompleteItems([]);
    setSelectedCard(null);
  };

  // Открытие модального окна с информацией о карточке
  const openModal = (card) => {
    setSelectedCard(card);
  };

  // Закрытие модального окна
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
          {/* Контейнер для выбранных тегов */}
          <div id="tags-container">
            {selectedTags.map((tag, index) => (
              <div
                key={index}
                className="tag-in-search"
                onClick={() => removeTag(tag)}
                title="Нажмите для удаления"
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Поле поиска с обработчиками onChange и onKeyDown */}
          <input
            type="text"
            id="search-query"
            placeholder="Введите тег для поиска"
            value={searchQuery}
            onChange={handleSearchInput}
            onKeyDown={handleKeyDown}
          />

          {/* Выпадающий список автодополнения */}
          {autocompleteItems.length > 0 && (
            <div id="autocomplete-list" className="autocomplete-items">
              {autocompleteItems.map((tag, index) => (
                <div
                  key={index}
                  className="autocomplete-item"
                  onClick={() => addTag(tag)}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Сетка карточек */}
        <div className="card-grid" id="card-grid">
          {filteredCards.map(card => (
            <div
              key={card.id}
              className="card"
              onClick={() => openModal(card)}
            >
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <div className="tags">
                {card.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
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
            <span
              id="modal-close"
              className="modal-close"
              onClick={closeModal}
            >
              &times;
            </span>
            <h2 id="modal-title">{selectedCard.title}</h2>
            <p id="modal-description">{selectedCard.description}</p>
            <div id="modal-tags" className="tags">
              {selectedCard.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;