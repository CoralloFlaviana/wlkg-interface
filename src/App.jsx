import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';

function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);

    const handleResultClick = (result) => {
        setSelectedResult(result);
    };

    return (
        <div className="app-container">
            {/* Sezione centrale alta */}
            <div className="center-top-section">
                <h2>Informazioni</h2>
                <p>Questa è la sezione centrale alta, dove visualizzerai informazioni varie.</p>
            </div>

            {/* Sezione centrale bassa: Barra di ricerca */}
            <div className="center-bottom-section">
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} setResults={setResults} />
            </div>

            {/* Sezione per i risultati */}
            {results.length > 0 && (
                <div className="center-results-section">
                    <h2>Risultati della ricerca</h2>
                    <div className="search-results">
                        {results.map((result, index) => (
                            <p key={index} onClick={() => handleResultClick(result)} className="result-item">
                                {result.name?.value || "Nome non disponibile"}
                                {result.titolo?.value || "Nome non disponibile"}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Sezione dettagliata a destra */}
            {selectedResult && (
                <div className="right-section">
                    <h2>Dettagli</h2>
                    <p>{selectedResult.name?.value || "Dettagli non disponibili."}</p>
                </div>
            )}
        </div>
    );
}

export default App;
