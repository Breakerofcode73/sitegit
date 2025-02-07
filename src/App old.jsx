import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const allTags = [
  "фэнтези",
  "приключения",
  "научная фантастика",
  "триллер",
  "Female Pred",
  "драма",
  "фантастика",
  "романтика",
  "комедия",
  "ужасы",
  "боевик",
  "история",
  "мистика"
];

function App() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteItems, setAutocompleteItems] = useState([]);
  const [cards, setCards] = useState([
    {
      id: 1,
      title: "Название работы 1",
      description: "Краткое описание работы 1.",
      tags: ["фэнтези", "приключения"],
      visible: true
    },
    {
      id: 2,
      title: "Название работы 2",
      description: "Краткое описание работы 2.",
      tags: ["научная фантастика", "триллер"],
      visible: true
    },
    {
      id: 3,
      title: "Название работы 3",
      description: "Краткое описание работы 3.",
      tags: ["фантастика", "драма"],
      visible: true
    },
    {
      id: 4,
      title: "Название работы 4",
      description: "Краткое описание работы 4.",
      tags: ["приключения", "фантастика"],
      visible: true
    },
    {
      id: 5,
      title: "Название работы 5",
      description: "Краткое описание работы 5.",
      tags: ["фэнтези", "драма"],
      visible: true
    },
    {
      id: 6,
      title: "Название работы 6",
      description: "Краткое описание работы 6.",
      tags: ["научная фантастика", "триллер"],
      visible: true
    },
    {
      id: 7,
      title: "Название работы 7",
      description: "Краткое описание работы 7.",
      tags: ["романтика", "комедия"],
      visible: true
    },
    {
      id: 8,
      title: "Название работы 8",
      description: "Краткое описание работы 8.",
      tags: ["ужасы", "боевик"],
      visible: true
    },
    {
      id: 9,
      title: "Название работы 9",
      description: "Краткое описание работы 9.",
      tags: ["история", "мистика"],
      visible: true
    }
  ]);
  const [selectedCard, setSelectedCard] = useState(null);

  const tagsRef = useRef(selectedTags);
  tagsRef.current = selectedTags;

  useEffect(() => {
    filterCards();
    localStorage.setItem('searchTags', JSON.stringify(selectedTags));
  }, [selectedTags]);

  useEffect(() => {
    localStorage.setItem('searchQuery', searchQuery);
    if (searchQuery === '') {
      if (selectedTags.length > 0) {
        filterCards();
      } else {
        displayAllCards();
      }
    } else {
      filterCards();
      showAutocomplete();
    }
  }, [searchQuery]);

  const filterCards = () => {
    const workItems = document.querySelectorAll('.card');
    workItems.forEach(item => {
      const itemTags = item.getAttribute('data-tags').toLowerCase().split(',').map(tag => tag.trim());
      let includeMatch = selectedTags.length === 0 || selectedTags.every(tag => itemTags.includes(tag.toLowerCase()));
      if (includeMatch) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  };

  const addTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setSearchQuery('');
    closeAutocomplete();
  };

  const removeTag = (tag) => {
    const updatedTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(updatedTags);
  };

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query === '') {
      setAutocompleteItems([]);
    } else {
      const lastCommaIndex = query.lastIndexOf(',');
      const currentInput = query.substring(lastCommaIndex + 1).trim().toLowerCase();
      const filteredTags = allTags.filter(tag => tag.toLowerCase().includes(currentInput) && !selectedTags.includes(tag)).sort();
      setAutocompleteItems(filteredTags);
    }
  };

  const showAutocomplete = () => {
    const autocompleteList = document.getElementById('autocomplete-list');
    autocompleteList.innerHTML = '';

    if (searchQuery === '') {
      return;
    }

    const lastCommaIndex = searchQuery.lastIndexOf(',');
    const currentInput = searchQuery.substring(lastCommaIndex + 1).trim().toLowerCase();
    const filteredTags = allTags.filter(tag => tag.toLowerCase().includes(currentInput) && !selectedTags.includes(tag)).sort();
    filteredTags.forEach(tag => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.textContent = tag;
      div.addEventListener('click', () => {
        addTag(tag);
      });
      autocompleteList.appendChild(div);
    });
  };

  const closeAutocomplete = () => {
    const autocompleteList = document.getElementById('autocomplete-list');
    autocompleteList.innerHTML = '';
  };

  const renderTags = () => {
    const tagsContainer = document.getElementById('tags-container');
    tagsContainer.innerHTML = '';
    selectedTags.forEach(tag => {
      const tagElement = document.createElement('button');
      tagElement.className = 'tag-button';
      tagElement.textContent = tag;
      tagElement.addEventListener('click', () => {
        removeTag(tag);
      });
      tagsContainer.appendChild(tagElement);
    }
    );
    filterCards();
  };

  const displayAllCards = () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.style.display = 'block';
    });
  };

  const openModal = (card) => {
    setSelectedCard(card);
  };

  const closeModal = () => {
    setSelectedCard(null);
  };

  const goToMain = () => {
    setSelectedTags([]);
    setSearchQuery('');
    displayAllCards();
    closeAutocomplete();
    document.getElementById('search-query').value = '';
    localStorage.setItem('searchTags', JSON.stringify([]));
    localStorage.setItem('searchQuery', '');
  };

  return (
    <div className="App">
      <div className="sidebar">
        <a onClick={goToMain}>Главная</a>
        <a href="#">Загрузить работу</a>
        <a href="#">О проекте</a>
        <a href="#">Контакты</a>
      </div>

      <div className="main-content">
        <div className="search-bar">
          <div id="tags-container">
            <div className="selected-tags">
              {selectedTags.map((tag, index) => (
                <button key={index} className="tag-button" onClick={() => removeTag(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            id="search-query"
            placeholder="Введите теги для поиска"
            value={searchQuery}
            onChange={handleSearchInput}
          />
          <div id="autocomplete-list" className="autocomplete-items"></div>
        </div>

        <div className="card-grid" id="card-grid">
          {cards.map(card => (
            card.visible && (
              <div
                key={card.id}
                className="card"
                data-tags={card.tags.join(', ')}
                onClick={() => openModal(card)}
              >
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <div className="tags">
                  {card.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {selectedCard && (
        <div id="modal" className="modal">
          <div className="modal-content">
            <span id="modal-close" className="modal-close" onClick={closeModal}>&times;</span>
            <h2 id="modal-title">{selectedCard.title}</h2>
            <p id="modal-description">{selectedCard.description}</p>
            <div id="modal-tags" className="tags">
              {selectedCard.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function goToMain() {
  // Логика для перехода на главную
  alert('Перейти на главную');
}

export default App;