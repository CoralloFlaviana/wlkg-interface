import React, { useState } from 'react';
import './SearchBar.css';

//const API_BASE = import.meta.env.VITE_API_URL;
//const API_BASE = '/api/query/';

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

            //const response = await fetch(`${API_BASE}/search_regex?label=${searchQuery}`);
            const response = await fetch(`/search_regex?label=${searchQuery}`);
            console.log('/search_regex?label=${}', searchQuery);

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

            //todo NOTA: per test !!!
            if (formattedResults.length === 0) {
                console.warn("Nessun risultato trovato. Uso dati fittizi.");
                const fakeData = {
                    results: {
                        bindings: [
                            {
                                ogg: { type: "literal", value: "Hungary" },
                                s: { type: "uri", value: "http://purl.archive.org/urwriters#citizenship" }
                            },
                            {
                                ogg: { type: "literal", value: "France" },
                                s: { type: "uri", value: "http://purl.archive.org/urwriters#citizenship" }
                            }
                        ]
                    }
                };

                if (Array.isArray(fakeData.results)) {
                    formattedResults = fakeData.results;
                } else if (typeof fakeData.results === "object") {
                    formattedResults = Object.values(fakeData.results);
                } else {
                    formattedResults = [];
                }

                console.log(formattedResults);
            }


            setResults(formattedResults);
            console.log("Risultati ricevuti:", formattedResults);
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
