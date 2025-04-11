import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import Popup from './components/Popup';

function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedResults, setSelectedResults] = useState([]);
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupItems, setPopupItems] = useState([]);
    const [activePopupItem, setActivePopupItem] = useState(null);

    const handleResultClick = (result) => {
        console.log("Risultato cliccato:", result); // Debug
        setSelectedResults((prev) => {
            if (!prev.some(r => r.label === result.label)) {
                return [...prev, result];
            }
            return prev;
        });
    };

    const handleSelectedItemClick = (item) => {
        setActivePopupItem(item);
        setPopupItems([
            { id: 1, name: "Opzione 1" },
            { id: 2, name: "Opzione 2" },
            { id: 3, name: "Opzione 3" }
        ]);
        setPopupVisible(true);
    };

    const handlePopupItemClick = (item) => {
        console.log("Hai selezionato dal popup:", item);
        setPopupItems([
            { id: 4, name: "Sub-Opzione A" },
            { id: 5, name: "Sub-Opzione B" }
        ]);
        setPopupVisible(false);
    };

    const handleRemoveItem = (indexToRemove) => {
        setSelectedResults((prev) =>
            prev.filter((_, index) => index !== indexToRemove)
        );
        setPopupVisible(false);
        setActivePopupItem(null);
    };

    return (
        <div className="app-container">
            <div className="center-area">
                <div className="center-top-section">
                    <h2>Elementi selezionati</h2>
                    <div className="selected-items">
                        {selectedResults.length > 0 ? (
                            selectedResults.map((result, index) => (
                                <div
                                    key={index}
                                    className="selected-item"
                                    onClick={() => handleSelectedItemClick(result)}
                                >
                                    <p>{result.label || "Nome non disponibile"}</p>
                                    <p>Distance: {result.distance?.toFixed(2) || "N/A"}</p>
                                    <button
                                        className="remove-button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Evita che il click apra il popup
                                            handleRemoveItem(index);
                                        }}
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))
                        ) : (
                            <h5>Nessun elemento selezionato.</h5>
                        )}
                    </div>
                </div>

                <div className="center-bottom-section">
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        setResults={setResults}
                    />
                </div>
            </div>

            {/*
            // Sezione disattivata temporaneamente perché l'API non funziona
            {results.length > 0 && (
                <div className="left-section">
                    <h2>Risultati della ricerca</h2>
                    <div className="search-results">
                        {results.map((result, index) => (
                            <div
                                key={index}
                                onClick={() => handleResultClick(result)}
                                className="result-item"
                            >
                                <p>{result.label || "Nome non disponibile"}</p>
                                <p>Distance: {result.distance?.toFixed(2) || "N/A"}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            */}

            {/* MOCK temporaneo dei risultati */}
            <div className="left-section">
                <h2>Risultati fittizi (mock)</h2>
                <div className="search-results">
                    {[
                        { label: "Books", distance: 9.915 },
                        { label: "Alessandro Baricco", distance: 8.173 },
                        { label: "books", distance: 9.915 }
                    ].map((result, index) => (
                        <div
                            key={index}
                            onClick={() => handleResultClick(result)}
                            className="result-item"
                        >
                            <p>{result.label || "Nome non disponibile"}</p>
                            <p>Distance: {result.distance?.toFixed(2) || "N/A"}</p>
                        </div>
                    ))}
                </div>
            </div>

            {popupVisible && (
                <Popup items={popupItems} onSelect={handlePopupItemClick} />
            )}
        </div>
    );
}

export default App;
