import React, { useState } from 'react';
import './App.css';
import SearchBar from './Components/SearchBar';

function App() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="app-container">
            {/* Sezione sinistra per i risultati della ricerca */}
            <div className="left-section">
                <h2>Risultati della ricerca</h2>
                <div className="search-results">
                    {/* Esempio di contenuto */}
                    <p>Risultato 1</p>
                    <p>Risultato 2</p>
                    <p>Risultato 3</p>
                </div>
            </div>

            {/* Sezione centrale alta per informazioni */}
            <div className="center-top-section">
                <h2>Informazioni</h2>
                <p>Questa è la sezione centrale alta, dove visualizzerai informazioni varie.</p>
            </div>

            {/* Sezione centrale bassa con barra di ricerca */}
            <div className="center-bottom-section">
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>

            {/* Sezione destra per altre informazioni */}
            <div className="right-section">
                <h2>Altre informazioni</h2>
                <p>Questa è la parte destra della pagina</p>
            </div>
        </div>
    );
}

export default App;
