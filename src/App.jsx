import React, { useState } from 'react';
import './App.css';
import SearchBar from './Components/SearchBar';

function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [results, setResults] = useState([]);

    const handleSearch = () => {
        if (searchQuery.trim() !== '') {
            setResults([
                { id: 1, text: 'Risultato 1' },
                { id: 2, text: 'Risultato 2' },
                { id: 3, text: 'Risultato 3' }
            ]);
            setShowLeft(true); // Mostra la sezione dei risultati di ricerca
            setShowRight(false); // Nasconde la parte destra quando si avvia una nuova ricerca
        }
    };

    const handleResultClick = (result) => {
        setSelectedResult(result);
        setShowRight(true); // Mostra la parte destra con le informazioni
    };

    return (
        <div className={`app-container ${showLeft ? 'show-left' : ''} ${showRight ? 'show-right' : ''}`}>
            {/* Sezione sinistra: Risultati di ricerca */}
            {showLeft && (
                <div className="left-section">
                    <h2>Risultati della ricerca</h2>
                    <div className="search-results">
                        {results.map((result) => (
                            <p key={result.id} onClick={() => handleResultClick(result)} className="result-item">
                                {result.text}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Sezione centrale alta */}
            <div className="center-top-section">
                <h2>Informazioni</h2>
                <p>Questa è la sezione centrale alta, dove visualizzerai informazioni varie.</p>
            </div>

            {/* Sezione centrale bassa: Barra di ricerca */}
            <div className="center-bottom-section">
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} />
            </div>

            {/* Sezione destra: Informazioni dettagliate */}
            {showRight && (
                <div className="right-section">
                    <h2>Dettagli</h2>
                    <p>{selectedResult ? selectedResult.text : 'Seleziona un risultato per vedere i dettagli.'}</p>
                </div>
            )}
        </div>
    );
}

export default App;
