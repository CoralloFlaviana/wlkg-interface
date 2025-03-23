import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ searchQuery, setSearchQuery, setResults }) {
    const [isLoading, setIsLoading] = useState(false); // Stato di caricamento

    // Funzione per fare la chiamata API
    const fetchData = async () => {
        try {
            const queryParams = new URLSearchParams({
                template: JSON.stringify({
                    "QuestionFocus": '',
                    "entities": { "work": [], "person": [], "subject": [], "publisher": [] }
                }),
                text: searchQuery,
                type: "person",
                k: 1,
            });

            const response = await fetch(`/graphrag?${queryParams.toString()}`);

            if (!response.ok) {
                throw new Error(`Errore API: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Risultato API:", data);
            return data;
        } catch (error) {
            console.error("Errore nella chiamata API:", error);
            return null; // Se c'è un errore, restituisci null
        }
    };

    // Funzione per gestire la ricerca
    const handleSearch = async () => {
        if (!searchQuery.trim()) return; // Evita ricerche vuote
        setIsLoading(true); // Avvia il caricamento
        console.log("Valore cercato:", searchQuery);

        try {
            const data = await fetchData(); // Ora aspettiamo il risultato effettivo

            if (!data) {
                setResults([]); // Se la chiamata fallisce, resetta i risultati
                return;
            }

            console.log("Risultati ricevuti:", data, "Tipo:", typeof data);

            let formattedResults = [];
            if (Array.isArray(data.results)) {
                formattedResults = data.results;
            } else if (typeof data.results === "object") {
                formattedResults = Object.values(data.results);
            } else {
                formattedResults = [];
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
