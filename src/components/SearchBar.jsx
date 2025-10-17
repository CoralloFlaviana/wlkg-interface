import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ searchQuery, setSearchQuery, setResults, entityTypes }) {
    const [isLoading, setIsLoading] = useState(false);
    const [searchType, setSearchType] = useState('person');

    // Usa entityTypes passato come prop invece di un array hardcoded nel caso contrario uso dati di test todo togliere
    const searchTypeOptions = entityTypes && entityTypes.length > 0
        ? entityTypes
        : [
            { value: 'person', label: 'Persona' },
            { value: 'work', label: 'Opera' },
            { value: 'subject', label: 'Soggetto' }
        ];

    const fetchData = async () => {
        try {
            const queryParams = new URLSearchParams({
                template: JSON.stringify({
                    "QuestionFocus": '',
                    "entities": { "work": [], "person": [], "subject": [], "publisher": [] }
                }),
                text: searchQuery,
                type: searchType,
                k: 1,
            });


            const response = await fetch(`/search_regex?label=${searchQuery}`);
            console.log('/search_regex?label=', searchQuery);
            /*if (entityTypes !== "altro") {
                const response = await fetch(`/search_regex?label=${searchQuery}&numberEntity${entityTypes}`);
            } else {
                console.log("EntityType è 'altro', quindi non eseguo la fetch.");
            }*/


            if (!response.ok) {
                throw new Error(`Errore API: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Risultato API:", data);
            return data;
        } catch (error) {
            console.error("Errore nella chiamata API:", error);
            return null;
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        console.log("Valore cercato:", searchQuery, "Tipo:", searchType);

        try {
            const data = await fetchData();

            if (!data) {
                setResults([]);
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

            if (formattedResults.length === 0) {
                console.warn("Nessun risultato trovato. Uso dati fittizi."); /*TODO: DA TOGLIERE QUESTA PARTE SERVE SOLO X TEST*/
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
            setIsLoading(false);
        }
    };

    return (
        <div className="search-bar-container">
            <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                style={{
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    backgroundColor: 'darkgrey',
                    cursor: 'pointer',
                    fontSize: '14px'
                }}
            >
                {searchTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        handleSearch();
                    }
                }}
                placeholder="Cerca qualcosa..."
                disabled={isLoading}
            />
            <button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? "Caricamento..." : "Cerca"}
            </button>
        </div>
    );
}

export default SearchBar;