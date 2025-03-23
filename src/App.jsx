import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';

function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);

    // Funzione per gestire il click su un risultato
    const handleResultClick = (result) => {
        setSelectedResult(result); // Imposta il risultato selezionato
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
                            <div
                                key={index}
                                onClick={() => handleResultClick(result)} // Quando clicchi su un risultato, selezionarlo
                                className="result-item"
                            >
                                {/* Visualizza il nome dell'opera */}
                                <p>{result.sogg?.value || "Nome non disponibile"}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sezione dettagliata a destra */}
            {selectedResult && (
                <div className="right-section">
                    <h2>Dettagli</h2>
                    {/* Visualizza i dettagli del risultato selezionato */}
                    <p>{selectedResult.sogg?.value || "Dettagli non disponibili."}</p>
                    <a href={selectedResult.s?.value} target="_blank" rel="noopener noreferrer">
                        {selectedResult.s?.value || "Link non disponibile"}
                    </a>
                </div>
            )}
        </div>
    );
}

export default App;
