import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ searchQuery, setSearchQuery, setResults }) {
    const [isLoading, setIsLoading] = useState(false); // Stato di caricamento

    const handleSearch = async () => {
        if (!searchQuery.trim()) return; // Evita ricerche vuote
        setIsLoading(true); // Avvia il caricamento
        console.log("Valore cercato:", searchQuery);

        try {
            const response = await fetch(`/api/query/search_exactly?label=${encodeURIComponent(searchQuery)}&numberEntity=1`);
            const data = await response.json();

            console.log("Risultati ricevuti:", data, "Tipo:", typeof data);

            let formattedResults = [];
            if (Array.isArray(data)) {
                formattedResults = data;
            } else if (data.results && Array.isArray(data.results)) {
                formattedResults = data.results;
            } else {
                formattedResults = [data];
            }

            setResults(formattedResults);
        } catch (error) {
            console.error("Errore nella chiamata API:", error);
            setResults([]);
        } finally {
            setIsLoading(false); // Ferma il caricamento indipendentemente dal risultato
        }
    };

    return (
        <div className="search-bar-container">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca qualcosa..."
                disabled={isLoading} // Disabilita l'input durante il caricamento
            />
            <button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? "Caricamento..." : "Cerca"}
            </button>
        </div>
    );
}

export default SearchBar;
