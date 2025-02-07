// src/components/SearchBar.jsx
import React, { useState, useEffect } from 'react';

const allTags = ["фэнтези", "приключения", "научная фантастика", "триллер", "драма", "фантастика"];

const SearchBar = ({ tags, setTags, filterCards }) => {
    const [query, setQuery] = useState('');
    const [autocomplete, setAutocomplete] = useState([]);

    useEffect(() => {
        filterCards();
    }, [tags]);

    const handleInput = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (value === '') {
            filterCards();
        } else {
            setAutocomplete(allTags.filter(tag => tag.toLowerCase().includes(value.toLowerCase()) && !tags.includes(tag)));
        }
    };

    const addTag = (tag) => {
        if (!tags.includes(tag)) {
            setTags([...tags, tag]);
        }
        setQuery('');
        setAutocomplete([]);
    };

    const removeTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };

    return (
        <div className="search-bar">
            <div id="tags-container">
                {tags.map((tag, index) => (
                    <div key={index} className="tag-in-search" onClick={() => removeTag(tag)}>
                        {tag}
                    </div>
                ))}
            </div>
            <input
                type="text"
                id="search-query"
                placeholder="Введите теги для поиска"
                value={query}
                onChange={handleInput}
                onFocus={() => filterCards()}
            />
            <div id="autocomplete-list" className="autocomplete-items">
                {autocomplete.map((tag, index) => (
                    <div key={index} className="autocomplete-item" onClick={() => addTag(tag)}>
                        {tag}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchBar;