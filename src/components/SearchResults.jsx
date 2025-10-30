import React from 'react';

const SearchResults = ({ results, onSelectResult, selectedItems }) => {
    // Funzione per verificare se un'entità esiste già
    const isEntityAlreadyPresent = (uri) => {
        return selectedItems.some(item => item.uri === uri);
    };

    const handleResultClick = (result) => {
        // Verifica se l'entità è già presente
        if (isEntityAlreadyPresent(result.s.value)) {
            alert('Questa entità è già presente nella lavagna!');
            return;
        }

        // Estrai il tipo dall'api o usa unknown
        let entityType = 'unknown';

        if (result.type) {
            console.log("provaaaaaaaaaaaaaa", result.type);
            entityType = result.type;
        } else {
            // Fallback: prova a dedurre dal path dell'URI
            const uri = result.s?.value || '';
            if (uri.includes('person') || uri.includes('Person')) {
                entityType = 'person';
            } else if (uri.includes('work') || uri.includes('Work')) {
                entityType = 'work';
            } else if (uri.includes('subject') || uri.includes('Subject')) {
                entityType = 'subject';
            }
        }

        const newItem = {
            id: `${result.s.value}-${Date.now()}`,
            label: result.name.value,
            uri: result.s.value,
            entityType: entityType,
            connections: [],
            position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 }
        };

        console.log('Creating new item with entityType:', entityType);
        onSelectResult(newItem);
    };

    return (
        <div style={{
            width: '300px',
            minWidth: '300px',
            backgroundColor: '#bdc3c7',
            padding: '20px',
            color: 'white',
            overflowY: 'auto',
            maxHeight: '100vh'
        }}>
            <h2 style={{
                margin: '0 0 20px 0',
                position: 'sticky',
                top: '0',
                backgroundColor: '#bdc3c7',
                paddingBottom: '10px'
            }}>
                Risultati
            </h2>

            {results.length === 0 && (
                <div style={{
                    color: 'rgba(255,255,255,0.7)',
                    textAlign: 'center',
                    padding: '20px',
                    fontSize: '14px'
                }}>
                    Nessun risultato. Effettua una ricerca.
                </div>
            )}

            {results.map((result, index) => (
                <div
                    key={index}
                    style={{
                        backgroundColor: 'white',
                        color: '#333',
                        padding: '12px',
                        marginBottom: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    onClick={() => handleResultClick(result)}
                >
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {result.name.value}
                    </div>
                    {result.type?.value && (
                        <div style={{
                            fontSize: '11px',
                            color: '#666',
                            backgroundColor: '#f0f0f0',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginTop: '4px'
                        }}>
                            {result.type.value}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SearchResults;