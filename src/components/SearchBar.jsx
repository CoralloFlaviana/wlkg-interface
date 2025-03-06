import React from 'react';
import './SearchBar.css';

function SearchBar({ searchQuery, setSearchQuery, onSearch }) {
    return (
        <div className="search-bar-container">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca qualcosa..."
            />
            <button onClick={onSearch}>Cerca</button>
        </div>
    );
}

export default SearchBar;
